'use strict'

/*
|--------------------------------------------------------------------------
| LocationSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Factory = use('Factory')
const Database = use('Database')

class LocationSeeder {
  static async run () {
  	const locations = await Database.table('locations').insert([
          {id: 1, name: 'TBD', latitude: '', longitude: ''},
          {id: 2, name: 'Toronto', latitude: '43.6532', longitude: '79.3832W'},
          {id: 3, name: 'Vancouver', latitude: '49.2827N', longitude: '123.1207W'}

    ])
    return locations
  }
}

module.exports = LocationSeeder
