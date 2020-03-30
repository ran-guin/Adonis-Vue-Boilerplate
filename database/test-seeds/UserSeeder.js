'use strict'

/*
|--------------------------------------------------------------------------
      username: 'UserSeeder
|--------------------------------------------------------------------------
|
      username: 'Make use of the Factory instance to seed database with dummy data or
      username: 'make use of Lucid models directly.
|
*/

const Factory = use('Factory')
const Database = use('Database')
const uuidv4 = require('uuid/v4');

class sparcUserSeeder {
  static async run () {
      // preset guest passwords as 'demoPassword' + admin passwords as 'backdoorentrance'
  	const users = await Database.table('users').insert([
      {id: 1, uuid: uuidv4(), username: 'Guest', email: 'guest@myDomain.com', password: '$2a$10$LXsj1/4CpjFEmZ7FEtqAQ.5zhxIJWRSGq9mcogGUSb0kRurMzISwS'},
      {id: 2, uuid: uuidv4(), username: 'Proxy', email: 'proxy@myDomain.com', password: '$2a$10$zUaEVd0d.6ReSBW7aBdeTOx6XEG.K2MfjxAzXIQIfx/ddt9yFcdyK'},
      {id: 3, uuid: uuidv4(), username: 'Tester', email: 'tester@myDomain.com', password: '$2a$10$zUaEVd0d.6ReSBW7aBdeTOx6XEG.K2MfjxAzXIQIfx/ddt9yFcdyK'},
      {id: 4, uuid: uuidv4(), username: 'Admin', email: 'admin@myDomain.com', password: '$2a$10$zUaEVd0d.6ReSBW7aBdeTOx6XEG.K2MfjxAzXIQIfx/ddt9yFcdyK'},
	])

  	console.log('seeded users: ' + users)
  }
}

module.exports = sparcUserSeeder
