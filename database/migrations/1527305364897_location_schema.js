'use strict'

const Schema = use('Schema')

class LocationSchema extends Schema {
  up () {
    this.create('locations', (table) => {
      table.increments()
      table.string('name', 255)
      table.enu('type', ['Private Residence', 'Commercial Space', 'Public Space'])
      table.string('address', 255)
      table.string('postal_code', 255)
      table.string('city', 255)
      table.string('country', 255)
      table.string('latitude', 255)
      table.string('longitude', 255)
      table.text('formatted_address')
      table.timestamps()
    })
  }

  down () {
    this.drop('locations')
  }
}

module.exports = LocationSchema
