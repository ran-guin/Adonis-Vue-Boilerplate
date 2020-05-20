'use strict'

/*
|--------------------------------------------------------------------------
| UserSettingSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Factory = use('Factory')
const Database = use('Database')

class UserSettingSeeder {
	static async dependencies() {
		return [
		  'OrganizationSeeder',
		  'UserSeeder'
		]
	}
	static async run () {
  		const user_settings = await Database.table('user_settings').insert([
			{user_id: 2, access: 'Admin'},
			{user_id: 3, access: 'Admin'},
			{user_id: 4, access: 'Admin'}
  		])
  		console.log('added: ' + user_settings)
  	}
}

module.exports = UserSettingSeeder
