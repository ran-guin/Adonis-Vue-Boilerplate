'use strict'

const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('UUID', 255)
      table.string('username', 80)
      table.string('email', 255).notNullable().unique()
      table.string('password', 255)
      table.enu('status', ['registered', 'active', 'inactive', 'suspended']).notNullable().defaultTo('registered')
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
