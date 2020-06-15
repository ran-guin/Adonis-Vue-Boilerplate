'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSettingSchema extends Schema {
  up () {
    this.create('user_settings', (table) => {
      table.increments()
      table.integer('user_id').unsigned().notNullable().index('user')
      table.foreign('user_id').references('users.id').onDelete('cascade')
      table.integer('invites_available').defaultTo(0)
      table.integer('invites_used').defaultTo(0)
      table.string('latitude', 255)
      table.string('longitude', 255)
      table.decimal('range_in_km')
      table.enu('validation_status', ['New', 'Validated', 'Vetted']).default('New')
      table.enu('access', ['Guest', 'Member', 'Collaborator', 'Driver', 'Host', 'Manager', 'Vendor', 'Admin']).default('Member')
      table.timestamps()
    })
  }

  down () {
    this.drop('user_settings')
  }
}

module.exports = UserSettingSchema
