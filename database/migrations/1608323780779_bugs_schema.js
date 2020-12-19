'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BugsSchema extends Schema {
  up () {
    this.create('bugs', (table) => {
      table.text('description')
      table.enu('type', ["Bug", 'Suggestion'])
      table.enu('urgency', ['Fatal', 'Critical', 'Prioritized', 'ToDo', 'Wish list', 'Will not fix'])
      table.enu('status', ['Submitted', 'Categorized', 'In Process', 'Addressed', 'Deferred', 'Ignored'])
      table.enu('category', ['Bug', 'Improvement', 'User Error', 'Duplicate', 'By Design', ''])
      table.text('notes')
      table.integer('user_id').unsigned().index('user_id')
      table.foreign('user_id').references('users.id').onDelete('cascade')
      table.increments()
      table.timestamps()
    })
  }

  down () {
    this.drop('bugs')
  }
}

module.exports = BugsSchema
