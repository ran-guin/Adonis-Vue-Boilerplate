'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PromoSchema extends Schema {
  up () {
    this.create('promo_codes', (table) => {
      table.increments()
      table.string('code','15')
      table.string('description','255') // description of context if applicable
      table.enu('status', ['active', 'revoked']).notNullable().defaultTo('active')
      table.integer('quota').unsigned()
      table.integer('used').unsigned().defaultTo(0)
      table.integer('group_id').unsigned().index('group')
      table.foreign('group_id').references('groups.id').onDelete('cascade')
      table.date('expiry')
      table.timestamps()
    })
  }

  down () {
    this.drop('promo_codes')
  }
}

module.exports = PromoSchema
