'use strict'

const Schema = use('Schema')

class OrganizationSchema extends Schema {
  up () {
    this.create('organizations', (table) => {
      table.increments()
      table.string('name').index('name')
      table.timestamps()
    })
  }

  down () {
    this.drop('organizations')
  }
}

module.exports = OrganizationSchema
