'use strict'

/*
|--------------------------------------------------------------------------
| VendorSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Database = use('Database')

class OrganizationSeeder {
  static async run () {
  	const orgs = await Database.table('organizations').insert([
          {id: 1, name: 'Cosine Systems'}
  	])
  	console.log('added orgs: ' + orgs)
        return orgs
  }
}

module.exports = OrganizationSeeder
