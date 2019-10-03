'use strict'

const Schema = use('Schema')

class AgentSchema extends Schema {
  up () {
    this.create('agents', (table) => {
      table.increments()
      table.integer('user_id').unsigned().notNullable().index('user')
      table.foreign('user_id').references('users.id').onDelete('cascade')
      table.integer('organization_id').unsigned().notNullable().index('organization')
      table.foreign('organization_id').references('organizations.id').onDelete('cascade')
      table.string('phone')
      table.string('address')
      table.enu('role', ['Admin', 'Proxy', 'Tester']).notNullable()
      table.enu('status', ['active', 'inactive']).notNullable().defaultTo('active')
      table.timestamps()
    })
  }

  down () {
    this.drop('agents')
  }
}

module.exports = AgentSchema
