'use strict';

const UserSeeder = require('./../test-seeds/UserSeeder')
const LocationSeeder = require('./../test-seeds/LocationSeeder')
const OrganizationSeeder = require('./../test-seeds/OrganizationSeeder')
const AgentSeeder = require('./../test-seeds/AgentSeeder')
const UserSettingSeeder = require('./../test-seeds/UserSettingSeeder')

class DatabaseSeeder {
  async run() {
    // Put yours seeders in the desired order
    await UserSeeder.run()
    await LocationSeeder.run()
    await OrganizationSeeder.run()
    await AgentSeeder.run()
    await UserSettingSeeder.run()
  }
}

module.exports = DatabaseSeeder
