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
		+ ' GROUP_CONCAT(CASE WHEN user_interests.min_skill_id IS NULL THEN "" ELSE user_interests.min_skill_id END) AS min_skill_ids, '
		+ ' GROUP_CONCAT(CASE WHEN user_interests.max_skill_id IS NULL THEN "" ELSE user_interests.max_skill_id END) AS max_skill_ids, '
		+ ' GROUP_CONCAT(CASE WHEN min_skill.id IS NULL THEN "" ELSE min_skill.level END) AS min_skill_levels, '
		+ ' GROUP_CONCAT(CASE WHEN min_skill.id IS NULL THEN "" ELSE min_skill.name END) AS min_skills, '
		+ ' GROUP_CONCAT(CASE WHEN max_skill.id IS NULL THEN "" ELSE max_skill.level END) AS max_skill_levels, '
		+ ' GROUP_CONCAT(CASE WHEN max_skill.id IS NULL THEN "" ELSE max_skill.name END) AS max_skills '
		+ ' FROM users'
		+ ' LEFT JOIN user_interests ON users.id=user_interests.user_id'
		+ ' LEFT JOIN interests ON user_interests.interest_id=interests.id'
		+ ' LEFT JOIN skills as min_skill ON user_interests.min_skill_id=min_skill.id'
		+ ' LEFT JOIN skills as max_skill ON user_interests.max_skill_id=max_skill.id'
		+ ' WHERE user_interests.level NOT LIKE "none"'
		+ ' GROUP BY users.id'

		var build_list_for_events = 'DROP VIEW IF EXISTS event_interest_lists; '
		+ ' CREATE VIEW event_interest_lists AS SELECT '
		+ ' events.id AS event_id, '
		+ ' GROUP_CONCAT(interests.id) AS interest_ids, '
		+ ' GROUP_CONCAT(interests.name) AS interests, '
		+ ' GROUP_CONCAT(CASE WHEN event_interests.min_skill_id IS NULL THEN "" ELSE event_interests.min_skill_id END) AS min_skill_ids, '
		+ ' GROUP_CONCAT(CASE WHEN min_skill.id IS NULL THEN "" ELSE min_skill.level END) AS min_skill_levels, '
		+ ' GROUP_CONCAT(CASE WHEN min_skill.id IS NULL THEN "" ELSE min_skill.name END) AS min_skills, '

		+ ' GROUP_CONCAT(CASE WHEN event_interests.max_skill_id IS NULL THEN "" ELSE event_interests.max_skill_id END) AS max_skill_ids, '
		+ ' GROUP_CONCAT(CASE WHEN max_skill.id IS NULL THEN "" ELSE max_skill.level END) AS max_skill_levels, '
		+ ' GROUP_CONCAT(CASE WHEN max_skill.id IS NULL THEN "" ELSE max_skill.name END) AS max_skills '
		+ ' FROM events'
		+ ' LEFT JOIN event_interests ON events.id=event_interests.event_id'
		+ ' LEFT JOIN interests ON event_interests.interest_id=interests.id'
		+ ' LEFT JOIN skills as min_skill ON event_interests.min_skill_id=min_skill.id'
		+ ' LEFT JOIN skills as max_skill ON event_interests.max_skill_id=max_skill.id'
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
    
	async mySkills ({request, response, params}) {
    	const { user_id, interest_id, interest, skill } = request.all()
		
		const myInterest = interest_id || interest || params.interest_id
		const myUser = user_id || params.user_id
		console.debug('retrieve skills from database for ' + myUser +  ' : ' + myInterest)

        const searchskill = '%' + skill + '%'

		var result = Database
			.select(
				'interests.id as interest_id',
				'interests.name as interest',
				'min_skill.id as min_skill_id',
				'min_skill.name as min_skill',
				'min_skill.level as min_skill_level',
				'max_skill.id as max_skill_id',
				'max_skill.name as max_skill',
				'max_skill.level as max_skill_level',
				'user_interests.min_skill_id as user_min_skill_id',
				'user_interests.max_skill_id as user_max_skill_id'
			)
            .from('user_interests')
            .innerJoin('users', 'users.id', 'user_interests.user_id')
            .innerJoin('interests', 'interests.id', 'user_interests.interest_id')
			.leftJoin('skills as min_skill', 'user_interests.min_skill_id', 'min_skill.id')
			.leftJoin('skills as max_skill', 'user_interests.max_skill_id', 'max_skill.id')
            .where('users.id', 'like', myUser)
            .orderBy('min_skill.level')
            
		if (myInterest) {
            result = result
            .where( function() {
                this.where('interests.id', 'like' , myInterest)
				this.orWhere('interests.name', 'like' , myInterest)
            })
        }

		if (skill) {
			result = result
            .where( function() {
                this.where('min_skill.name', 'like', searchskill)
				this.orWhere('min_skill.name', 'like', searchskill)
            })
			// .where('skills.name', 'like', searchskill)
		}
		const skills = await result
		response.json({skills: skills})
	}
	 
	async list ({request, response, params}) {
        const { interest_id, interest, user_id, with_skills, include_skills, search} = request.all()
		Logger.debug('retrieve list of interests from database')
		const myUser = user_id || params.user_id
		const myInterest = interest_id || interest || params.interest_id
		const searchstring = '%' + search + '%'

		Logger.info('Get interest list for: ' + myUser)

		try {
			var result = Database
			.select(
				'interests.name',
				'interests.description',
				'interests.id',
				'interests.parent_id',
				'parent.name as parent',
				'user_interests.level',
				'user_interests.min_skill_id',
				'user_interests.max_skill_id',
				'min_skill.level as min_skill_level',
				'min_skill.name as min_skill',
				'max_skill.level as max_skill_level',
				'max_skill.name as max_skill'
			)
			.from('user_interests')
			.innerJoin('users', 'users.id', 'user_interests.user_id')
			.innerJoin('interests', 'interests.id', 'user_interests.interest_id')
			.leftJoin('interests as parent', 'interests.parent_id', 'parent.id')
			.leftJoin('skills as min_skill', 'min_skill.id', 'user_interests.min_skill_id')
			.leftJoin('skills as max_skill', 'max_skill.id', 'user_interests.max_skill_id')
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
			console.log(myUser + ' got: ' + JSON.stringify(interests))
			response.json({interests: interests})
		} catch (err) {
			console.log('err: ' + err.message)
			response.json({error: err.message})
		}
	}

	async update ( {request, response, params} ) {
		const { add, remove } = request.all()
		const user_id = params.user_id

		var added = 0
		var removed = 0

		console.log('add: ' + JSON.stringify(add))
		if (add && add.length) {
			for (var i = 0; i < add.length; i++) {
				const ok = this.add(user_id, add[i])
				if (ok) { added++ }
			}
			console.log('added ' + added + ' of ' + add.length)
		}
		if (remove && remove.length) {
			console.log('remove: ' + JSON.stringify(remove))
			for (var i = 0; i < remove.length; i++) {
				const ok = this.remove(user_id, remove[i])
				if (ok) { removed = removed + ok }
			}
			console.log('removed ' + removed + ' of ' + remove.length)
		}
		response.json({added: added, removed: removed})
	}

	async addInterest ( {request, response, params} ) {
		const input = request.all()
		const user_id = params.user_id
		const added = this.add(user_id, input)
		response.json({added: added})
	}

	async removeInterest ( {request, response, params} ) {
		const input = request.all()
		const user_id = params.user_id
		const interest_id = params.interest_id

		const removed = this.remove(user_id, input)
		response.json({removed: removed})
	}
	
	async add (user_id, input) {
		const { id, name } = input
		var { interest_level, min_skill_id, max_skill_id } = input
		console.log('add ' + name + ' : ' + id)

		if (user_id && id) {
			var ui = new UserInterest()
			ui.user_id = user_id
			ui.interest_id = id
			ui.level = interest_level || 'normal'
			// ui.skill_level = skill_level
			ui.min_skill_id = min_skill_id 
			ui.max_skill_id = max_skill_id 
			return await ui.save()
		} else {
			console.log('missing user_id or id ?: ' + JSON.stringify(input))
			return false
		}
	}

	async remove (user_id, input) {
		const { id, name } = input
		var { interest_level, skill_id } = input
		console.log('delete ' + name + ' : ' + id)

		if (user_id && id) {
			var existing = await Database
				.select('id')
				.from('user_interests')
				.where('interest_id', 'like', id)
				.where('user_id', 'like', user_id)
			
			if (existing.length) {
				var removed = 0
				for (var i = 0; i < existing.length; i++) {
					// Just in case there are redundant records
					var record = await UserInterest.findBy('id', existing[i].id)
					var ok = record.delete()
					if (ok) {
						removed++
					}
				}
				return removed
			} else {
				return null
			}
		} else {
			console.log('missing user_id or id ?: ' + JSON.stringify(input))
			return null
		}
	}

    async updateDetails ( {request, response, params} ) {
    	const { user_id, interest_id, level, min_skill_id, max_skill_id } = request.all()
		Logger.debug('update user interest')
		const myInterest = interest_id || params.interest_id
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
			if (level || min_skill_id || max_skill_id) {
				const id = existing[0].id
				console.log('update ' + id + ' to ' + level)
				// const retrieved = await UserInterest.findBy('id', id)

				// console.log('got updated')
				// updated = await retrieved.update({level: level})

				updated = await UserInterest
					.query()
					.where('id', id)
					.update({level: level, min_skill_id: min_skill_id, max_skill_id: max_skill_id})
				action = 'update'
			} else {
				console.log('interest already registered... no additional level / skill info')
			}
		} else {
			console.log('add new record')
			const newInterest = new UserInterest()
			newInterest.interest_id = myInterest
			newInterest.user_id = myUser
			newInterest.level = level
			newInterest.min_skill_id = min_skill_id
			newInterest.max_skill_id = max_skill_id

			appended = await newInterest.save()
			action = 'append'
		}
		console.log('respond..')
		response.json({success: true, action: action, updated: updated, appended: appended})
	}
}

module.exports = InterestController
