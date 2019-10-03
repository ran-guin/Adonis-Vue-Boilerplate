'use strict'

/*
|--------------------------------------------------------------------------
| AgentSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Factory = use('Factory')
const Database = use('Database')

class AgentSeeder {
	static async dependencies() {
		return [
		  'OrganizationSeeder',
		  'UserSeeder'
		]
	}
	static async run () {
  		const agents = await Database.table('agents').insert([
			{user_id: 3, organization_id: 1, role: 'Tester', status: 'active'},
			{user_id: 4, organization_id: 1, role: 'Admin', status: 'active'}
  		])
  		console.log('added: ' + agents)
  	}
}

module.exports = AgentSeeder
