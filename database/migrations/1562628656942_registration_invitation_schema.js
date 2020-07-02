'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RegistrationInvitationSchema extends Schema {
  up () {
    this.create('registration_invitations', (table) => {
      table.increments()
      table.string('email', 255).notNullable()
      table.string('token', 255).unique().index()
      table.integer('invitee').unsigned().index('invitee')
      table.foreign('invitee').references('users.id').onDelete('cascade')
      table.integer('host').unsigned().index('host')
      table.foreign('host').references('users.id').onDelete('cascade')
      table.timestamp('requested')
      table.date('sent')
      table.enu('status', ['requested', 'sent', 'accepted', 'expired', 'revoked']).notNullable().defaultTo('requested')
      table.timestamps()
    })
  }

  down () {
    this.drop('registration_invitations')
  }
}

module.exports = RegistrationInvitationSchema
