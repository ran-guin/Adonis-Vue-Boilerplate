'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RegistrationInvitationSchema extends Schema {
  up () {
    this.create('registration_invitations', (table) => {
      table.increments()
      table.string('email', 255).notNullable()
      table.string('token', 255).unique().index()
      table.integer('user_id').unsigned().index('user')
      table.foreign('user_id').references('users.id').onDelete('cascade')
      table.integer('host_id').unsigned().index('host')
      table.foreign('host_id').references('users.id').onDelete('cascade')
      table.integer('group_id').unsigned().index('group')
      table.foreign('group_id').references('groups.id').onDelete('cascade')
      table.timestamp('requested')
      table.integer('quota').unsigned().defaultTo(1)
      table.integer('used').unsigned().defaultTo(0)
      table.date('sent')
      table.date('expiry')
      table.enu('status', ['requested', 'sent', 'accepted', 'expired', 'revoked', 'promo code']).notNullable().defaultTo('requested')
      table.timestamps()
    })
  }

  down () {
    this.drop('registration_invitations')
  }
}

module.exports = RegistrationInvitationSchema
