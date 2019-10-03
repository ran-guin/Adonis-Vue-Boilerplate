'use strict'

const Database = use('Database')
const Config = use('Config')
const Logger = use('Logger')
const Model = use('Model')
const Validator = use('Validator')

const customConfig = Config.get('custom.database')

class DBFormController {

	async search ({ request, response, session }) {

		const DBsearchable = customConfig.search || {}

		console.log("search ")

		const table = 'users'

		return await use('Database').from(table)
	}

	async loadTable ({ request, response }) {
		const {table} = request.all()
		const rules = {
		table: 'required'
		}

		const validation = await Validator.validateAll(request.all(), rules)
		if (validation.fails()) {
		var errors = validation.messages()
		console.log('Failed registration validation' + JSON.stringify(validation.messages()))
		
		response.json( { error: 'Failed Validation for saving form', validation_errors: errors, rules: rules} )
			} else {
				var fields = await Database.raw('desc ' + table)
		response.json({fields: fields[0]})	
		}
	}

	async saveRecord ({ request, response }) {
		const {table, access, form, login_id, changes, validate} = request.all()
		const rules = {
			table: 'required',
			access: 'required',
			form: 'required'
		}

		const validation = await Validator.validateAll(request.all(), rules)
		if (validation.fails()) {
			var errors = validation.messages()
			console.log('Failed registration validation' + JSON.stringify(validation.messages()))
			
			response.json( { error: 'Failed Validation for saving form', validation_errors: errors, rules: rules} )
		} else {
			const keys = Object.keys(form)

			var record = {}
			var fields = []
			for (var i = 0; i < keys.length; i++) {
				// confirmed and validate are special form fields for form checking
				if (keys[i] !== 'table' && keys[i] !== 'validate' && keys[i] !== 'confirmed') {
					if (access === 'append' || (access === 'update' && changes && changes[keys[i]])) {
						record[keys[i]] = form[keys[i]]
						fields.push(keys[i])
					}
				}
			}

			console.log(JSON.stringify(record, null, 2))
			if (!fields.length) {
				const msg = 'No data to update'
				return {warning: msg}
			} else {
				if (access === 'update' && form['id'] && changes && changes.length) {
					const id = form['id']
					var update = Database
						.table(table)
						.where('id', id)

					for (var j = 0; j < fields.length; j++) {
						update = update.update(fields[j], record[fields[j]])
					}
					console.log('insert edit tracking here ....')
					var updated = await update
					return {success: true, updated: updated}
				} else if (access === 'append') {
					const id = await use('Database').table(table).insert(record)
					return {success: true, id: id}
				} else {
					console.log('undefined access')
					return {error: 'undefined access'}
				}
			}
		}
	}
}

module.exports = DBFormController
