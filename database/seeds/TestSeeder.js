'use strict';

const UserSeeder = require('./../test-seeds/UserSeeder')
const OrganizationSeeder = require('./../test-seeds/OrganizationSeeder')
const AgentSeeder = require('./../test-seeds/AgentSeeder')

class DatabaseSeeder {
  async run() {
    // Put yours seeders in the desired order
    await UserSeeder.run()
    await OrganizationSeeder.run()
    await AgentSeeder.run()
  }
}

module.exports = DatabaseSeeder
