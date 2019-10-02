'use strict'

const Database = use('Database')
const Config = use('Config')
const Logger = use('Logger')
const Model = use('Model')
const { validate } = use('Validator')
	
const customConfig = Config.get('custom.database')

class GenericController {

	async search ({ request, response, session }) {

		const DBsearchable = customConfig.search || {}

		console.log("search ")

		// var Model = new Model('Tea')
		const table = 'Tea'

		return await use('Database').from(table)
		// var list = yield Model.all()
		// Logger.debug(JSON.stringify(list))

		// return list
	}

	async upload ({ request, response, session }) {
		Logger.info('custom: ' + JSON.stringify(customConfig))

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
		return record
	}

}

module.exports = GenericController
