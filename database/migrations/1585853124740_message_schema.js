'use strict'

const Schema = use('Schema')

class MessageSchema extends Schema {
  up () {
    this.create('messages', (table) => {
      table.increments()
      table.integer('contact_id').unsigned().index('contact_id')
      table.foreign('contact_id').references('contacts.id').onDelete('cascade')
      table.string('role', 255)
      table.timestamp('sent').notNullable().default(this.fn.now())
      table.text('message')
      table.timestamps()
    })
  }

  down () {
    this.drop('messages')
  }
}

module.exports = MessageSchema
