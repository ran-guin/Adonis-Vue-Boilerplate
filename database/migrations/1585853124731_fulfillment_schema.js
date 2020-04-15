'use strict'

const Schema = use('Schema')

class FulfillmentSchema extends Schema {
  up () {
    this.create('fulfillments', (table) => {
      table.increments()
      table.integer('request_id').unsigned().notNullable().index('request')
      table.foreign('request_id').references('requests.id').onDelete('cascade')
      table.integer('offer_id').unsigned().notNullable().index('offer')
      table.foreign('offer_id').references('offers.id').onDelete('cascade')
      table.enu('type', ['Partial', 'Complete'])
      table.date('fulfillment_date')
      table.text('notes')
      table.integer('user_id').unsigned().notNullable().index('user_id')
      table.foreign('user_id').references('users.id').onDelete('cascade')
      table.timestamps()
    })
  }

  down () {
    this.drop('fulfillments')
  }
}

module.exports = FulfillmentSchema
