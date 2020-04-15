'use strict'

const Schema = use('Schema')

class ContactSchema extends Schema {
  up () {
    this.create('contacts', (table) => {
      table.increments()
      table.integer('user_id').unsigned().index('user_id')
      table.foreign('user_id').references('users.id').onDelete('cascade')
      table.string('name', 255)
      table.string('email', 255)
      table.string('phone', 255)
      table.enu('preferred_contact', ['Phone', 'Email'])
      table.timestamps()
    })
  }

  down () {
    this.drop('contacts')
  }
}

module.exports = ContactSchema
