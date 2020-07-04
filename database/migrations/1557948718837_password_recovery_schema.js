'use strict'

const Schema = use('Schema')

class PasswordRecoverySchema extends Schema {
  up () {
    this.create('password_recoveries', (table) => {
      table.increments()
      table.integer('user_id').unsigned().index('user')
      table.foreign('user_id').references('users.id')
      table.string('token', 254)
      table.timestamp('requested')
      table.enu('status', ['initialized', 'failed', 'expired', 'accessed', 'reset']).notNullable().defaultTo('initialized')
      table.string('ip', 15)
      table.string('note', 254)
      table.timestamps()
    })
  }

  down () {
    this.drop('password_recoveries')
  }
}

module.exports = PasswordRecoverySchema
