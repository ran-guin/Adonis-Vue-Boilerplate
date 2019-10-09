'use strict'

const Database = use('Database')
const Config = use('Config')
const Logger = use('Logger')
const Model = use('Model')
// const { validate } = use('Validator')
	
const customConfig = Config.get('custom.database')

class GenericController {
	async tables ({ request, response, session }) {
		var {table, fields, condition} = request.all()
		console.log('get tables..')
	}

	async search ({ request, response, session, params }) {
		var {table, fields, condition} = request.all()
		if (params.table) { table = params.table }
		console.log('search ' + table)

		var query = Database
			// .select('id')
			.from(table)
		
		if (condition) {
			query = query
				.whereRaw(condition)
		}

		var results = await query

		if (results && results.length && !fields) { 
			fields = Object.keys(results[0])
		}
		return response.json({data : results, fields: fields})
	}

	async describe ({ request, response, session, params }) {
		var {table, fields, condition} = request.all()
		if (params.table) { table = params.table }
		console.log('describe ' + table)

		var query = Database.raw('desc ' + table)
		
		var results = await query

		if (results && results.length && !fields) { 
			fields = Object.keys(results[0])
		}
		response.status(200)
		return response.json(results)
	}

	async update ({ request, response, session, params }) {
		var {table, id, data} = request.all()
		if (params.table) { table = params.table }
		if (params.id) { id = params.id }
		console.log('update ' + table)
		var updated
		response.status(200)
		return response.json(updated)
	}

	async append ({ request, response, session, params }) {
		Logger.info('custom: ' + JSON.stringify(customConfig))
		if (params.table) { table = params.table }

		const DBuploadable = customConfig.upload || {}
		const uploadableTables = Object.keys(DBuploadable) || []

		var input = request.get()
		Logger.info('upload: ' + JSON.stringify(input))

		var table = input.table
		var record = input.record || input.data || {}

		Logger.debug(Object.keys(record))

		if (!table) {
			const msg = 'No table specified for upload'
			Logger.warning(msg) 

			return {error: msg, message: 'Uploadable tables: ' + uploadableTables.join(', ')}
		}
		
		table = table.toLowerCase()
		const validation = input.validate || DBuploadable[table]

		if (uploadableTables.indexOf(table) === -1) {
			const msg = table + ' does not have upload capabilities'
			Logger.warning(msg) 
			return {error: msg, message: 'Uploadable tables: ' + uploadableTables.join(', ')}
		}
		else if (!record || !Object.keys(record).length) {
			// record = {}
			// default to using input parameters as assumed fields
			const keys = Object.keys(input)
			Logger.debug('use input params for keys: ' + keys.join(','))

			var fields = 0
			for (var i = 0; i < keys.length; i++) {
				if (keys[i] !== 'table' && keys[i] !== 'validate') {
					record[keys[i]] = input[keys[i]]
					fields++
				}
			}

			if (!fields) {
				const msg = 'No data supplied to upload'
				Logger.warning(msg)
				return {error: msg}
			}
		}

		if (validation) {
			Logger.info('validating: ' + JSON.stringify(validation))

			// validate form input
			const validated = await validate(request.all(), validation) // eg name: 'required|min:3|max:255'

			// show error messages upon validation fail
			if (validated.fails()) {
				session.withErrors(validated.messages())
					   .flashAll()

				Logger.warning(validated.messages().message)
				return {
					'input' : record,
					'validation error': validated.messages()
				}
			}
		}
	  
		// persist to database

		Logger.info("append: " + JSON.stringify(record))

		const id = await use('Database').table(table).insert(record)
		Logger.info('id: ' + id)
		response.status(201)
		return record
	}

	async delete ({ request, response, session, params }) {
		var {table, id} = request.all()
		if (params.table) { table = params.table }
		if (params.id) { id = params.id }
		console.log('delete ' + table)
		var updated
		response.status(200)
		return response.json(updated)
	}

}

module.exports = GenericController
