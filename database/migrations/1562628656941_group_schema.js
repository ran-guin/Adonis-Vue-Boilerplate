'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class GroupSchema extends Schema {
  up () {
    this.create('groups', (table) => {
      table.increments()
      table.string('name')
      table.integer('user_id').unsigned().notNullable().index('user')
      table.foreign('user_id').references('users.id').onDelete('cascade')
      table.enu('type', ['Private', 'Hosted', 'Public'])
      table.timestamps()
    })
  }

  down () {
    this.drop('groups')
  }
}

module.exports = GroupSchema
