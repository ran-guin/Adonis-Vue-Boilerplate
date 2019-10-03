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
  	const users = await Database.table('users').insert([
      {id: 1, uuid: uuidv4(), username: 'Guest', email: 'guest@gmail.com', password: '$2a$10$LXsj1/4CpjFEmZ7FEtqAQ.5zhxIJWRSGq9mcogGUSb0kRurMzISwS'},
      {id: 2, uuid: uuidv4(), username: 'Proxy', email: 'proxy@gmail.com', password: '$2a$10$zUaEVd0d.6ReSBW7aBdeTOx6XEG.K2MfjxAzXIQIfx/ddt9yFcdyK'},
      {id: 3, uuid: uuidv4(), username: 'Tester', email: 'tester@gmail.com', password: '$2a$10$zUaEVd0d.6ReSBW7aBdeTOx6XEG.K2MfjxAzXIQIfx/ddt9yFcdyK'},
      {id: 4, uuid: uuidv4(), username: 'Admin', email: 'admin@gmail.com', password: '$2a$10$zUaEVd0d.6ReSBW7aBdeTOx6XEG.K2MfjxAzXIQIfx/ddt9yFcdyK'},
	])

  	console.log('seeded users: ' + users)
  }
}

module.exports = sparcUserSeeder
