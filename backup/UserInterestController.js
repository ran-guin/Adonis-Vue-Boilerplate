'use strict'

const Database = use('Database')
const Config = use('Config')
const Logger = use('Logger')
const Model = use('Model')

const execSync = require('child_process').execSync

const Validator = use('Validator')

const Interest = use('App/Models/Interest')
const UserInterest = use('App/Models/UserInterest')

Logger.level = process.env.LOG_LEVEL
Logger.info('Logging Level (from .env file): ' + Logger.level)

// const { validate } = use('Validator')

/*

/skills -> skills()
*** Retrieve Skills ***

input options:  user_id, interest_id, interest

/interests -> list()
*** Retrieve Interests ***

input options:  user_id, interest_id, interest
additional option: 
  - with_skills (only include interests with associated skills)
  - include_skills (include skills information - results in multiple records per interest)
*/

Logger.debug('loaded interest controller...')

class InterestController {

	async interestProfile ({request, response}) {
		Logger.debug('generate the interest profile...')
		Logger.warning('generate interest profile...')
		response.json({msg: 'generate interest profile'})
	}
	
	async rebuild_views ({request, response}) {
		var build_list_for_users = 'DROP VIEW IF EXISTS user_interest_lists; '
		+ ' CREATE VIEW user_interest_lists AS SELECT '
		+ ' users.id AS user_id, '
		+ ' GROUP_CONCAT(interests.id) AS interest_ids, '
		+ ' GROUP_CONCAT(interests.name) AS interests, '
		+ ' GROUP_CONCAT(CASE WHEN user_interests.skill_id IS NULL THEN "" ELSE user_interests.skill_id END) AS skill_ids, '
		+ ' GROUP_CONCAT(CASE WHEN skills.id IS NULL THEN "" ELSE skills.level END) AS skill_levels, '
		+ ' GROUP_CONCAT(CASE WHEN skills.id IS NULL THEN "" ELSE skills.name END) AS skills '
		+ ' FROM users'
		+ ' LEFT JOIN user_interests ON users.id=user_interests.user_id'
		+ ' LEFT JOIN interests ON user_interests.interest_id=interests.id'
		+ ' LEFT JOIN skills ON user_interests.skill_id=skills.id'
		+ ' GROUP BY users.id'

		var build_list_for_events = 'DROP VIEW IF EXISTS event_interest_lists; '
		+ ' CREATE VIEW event_interest_lists AS SELECT '
		+ ' events.id AS event_id, '
		+ ' GROUP_CONCAT(interests.id) AS interest_ids, '
		+ ' GROUP_CONCAT(interests.name) AS interests, '
		+ ' GROUP_CONCAT(CASE WHEN event_interests.skill_id IS NULL THEN "" ELSE event_interests.skill_id END) AS skill_ids, '
		+ ' GROUP_CONCAT(CASE WHEN skills.id IS NULL THEN "" ELSE skills.level END) AS skill_levels, '
		+ ' GROUP_CONCAT(CASE WHEN skills.id IS NULL THEN "" ELSE skills.name END) AS skills '
		+ ' FROM events'
		+ ' LEFT JOIN event_interests ON events.id=event_interests.event_id'
		+ ' LEFT JOIN interests ON event_interests.interest_id=interests.id'
		+ ' LEFT JOIN skills ON event_interests.skill_id=skills.id'
		+ ' GROUP BY events.id'
		
		const execute = "mysql -u " + process.env.DB_USER + " -p" + process.env.DB_PASSWORD + " " + process.env.DB_DATABASE
		try {
			const rebuilt_users = execSync(execute + " -e '" + build_list_for_users + "'")
			const rebuilt_events = execSync(execute + " -e '" + build_list_for_events + "'")
			response.json({success: true, user_interest_lists: build_list_for_users, event_interest_lists: build_list_for_events})
		} catch (err) {
			console.debug("Execution error: " + err.message)
			console.debug("Attempted: " + execute)
			response.json({success: false, error: err.message})
		}
    }
    
	async skills ({request, response, params}) {
    	const { user_id, interest_id, interest, skill } = request.all()
		Logger.debug('retrieve skills from database')
		
		const myInterest = interest_id || interest || params.interest
		const myUser = user_id || params.user_id

        const searchskill = '%' + skill + '%'

		var result = Database
			.select(
				'interests.id as interest_id',
				'interests.name as interest',
				'skills.id as skill_id',
				'skills.name as skill',
				'skills.level as skill_level',
				'user_interests.skill_id as user_skill_id'
			)
            .from('user_interests')
            .innerJoin('users', 'users.id', 'user_interests.user_id')
            .innerJoin('interests', 'interests.id', 'user_interests.interest_id')
			.leftJoin('skills', 'interests.id', 'skills.interest_id')
            .where('users.id', 'like', myUser)
            .orderBy('skills.level')
            
		if (myInterest) {
            result = result
            .where( function() {
                this.where('skills.interest_id', 'like' , myInterest)
				this.orWhere('interests.name', 'like' , myInterest)
            })
        }

		if (skill) {
			result = result
			.where('skills.name', 'like', searchskill)
		}
		const skills = await result
		response.json({skills: skills})
	}
	 
	async list ({request, response, params}) {
        const { interest_id, interest, user_id, with_skills, include_skills, search} = request.all()
		Logger.debug('retrieve list of interests from database')
		const myUser = user_id || params.user_id
		const myInterest = interest_id || interest || params.interest
		const searchstring = '%' + search + '%'

		Logger.info('Get interest list for: ' + myUser)

		var result = Database
		.select(
			'interests.name',
			'interests.id',
			'interests.parent_id',
			'parent.name as parent',
			'user_interests.skill_id',
			'skills.level as skill_level',
			'skills.name as skill'
		)
        .from('user_interests')
        .innerJoin('users', 'users.id', 'user_interests.user_id')
        .innerJoin('interests', 'interests.id', 'user_interests.interest_id')
		.leftJoin('interests as parent', 'interests.parent_id', 'parent.id')
		.leftJoin('skills', 'skills.id', 'user_interests.skill_id')
		.where('user_interests.user_id', 'like', myUser)
		.whereNot('user_interests.level', 'like', 'none')	
		
		if (myInterest) {
            result = result
                .where( function() {
                    this.where('interests.name', 'like', myInterest)
                    this.orWhere('interests.id', 'like', myInterest)
                })
        }
		
		const interests = await result
		response.json({interests: interests})
	}

	async add ( {request, response, params} ) {
    	const { user_id, interest_id, name, status, description } = request.all()
		Logger.debug('add user interest')
		const myInterest = interest_id || params.interest
		const myUser = user_id || params.user_id
		const rules = { name: 'required' }
	  
		const validation = await Validator.validateAll(request.all(), rules)
		if (validation.fails()) {
			response.json({ 
				success: false, 
				error: 'Validation Error', 
				messages: validation_messages()
			})
		}

		var interest = new UserInterest
		if (name) { interest.name = name }
		if (description) { interest.description = description }
		if (status) { interest.status = status }

		const saved = interest.save()
		response.json({success: true, saved: saved})
	}

    async update ( {request, response, params} ) {
    	const { user_id, interest_id, level, skill_id } = request.all()
		Logger.debug('update user interest')
		const myInterest = interest_id || params.interest
		const myUser = user_id || params.user_id

		if (!(myUser && myInterest && level)) {
			response.json({ 
				success: false, 
				error: 'Validation Error', 
				messages: ['missing information']
			})
        }

		var updated
		var appended
		var action
		var existing = await Database
			.select('id')
			.from('user_interests')
            .where('interest_id', myInterest)
			.where('user_id', myUser)
		
		console.log('records: ' + JSON.stringify(existing))
		if (existing.length) {
			const id = existing[0].id
			console.log('update ' + id + ' to ' + level)
			// const retrieved = await UserInterest.findBy('id', id)

			// console.log('got updated')
			// updated = await retrieved.update({level: level})

			updated = await UserInterest
				.query()
				.where('id', id)
				.update({level: level, skill_id: skill_id})
			action = 'update'
		} else {
			console.log('add new record')
			const newInterest = new UserInterest()
			newInterest.interest_id = myInterest
			newInterest.user_id = myUser
			newInterest.level = level
			newInterest.skill_id = skill_id

			appended = await newInterest.save()
			action = 'append'
		}
		console.log('respond..')
		response.json({success: true, action: action, updated: updated, appended: appended})
	}
}

module.exports = InterestController
