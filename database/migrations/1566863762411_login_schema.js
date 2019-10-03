'use strict'

const Schema = use('Schema')

class LoginSchema extends Schema {
  up () {
    this.create('logins', (table) => {
      table.increments()
      table.integer('user_id').notNullable().unsigned().index('user_id')
      table.foreign('user_id').references('users.id').onDelete('cascade')
      table.timestamp('login').defaultTo(this.fn.now())
      table.timestamp('logout').nullable().defaultTo(null)
      table.string('ip',16)
      table.timestamps()
    })
  }

  down () {
    this.drop('logins')
  }
}

module.exports = LoginSchema
