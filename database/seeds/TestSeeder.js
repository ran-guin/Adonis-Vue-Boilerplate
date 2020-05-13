'use strict';

const UserSeeder = require('./../test-seeds/UserSeeder')
const LocationSeeder = require('./../test-seeds/LocationSeeder')
const EventSeeder = require('./../test-seeds/EventSeeder')
const InterestSeeder = require('./../test-seeds/InterestSeeder')
const EventInterestSeeder = require('./../test-seeds/EventInterestSeeder')
const SkillSeeder = require('./../test-seeds/SkillSeeder')
const UserInterestSeeder = require('./../test-seeds/UserInterestSeeder')
const OrganizationSeeder = require('./../test-seeds/OrganizationSeeder')
const AgentSeeder = require('./../test-seeds/AgentSeeder')
const UserSettingSeeder = require('./../test-seeds/UserSettingSeeder')

class DatabaseSeeder {
  async run() {
    // Put yours seeders in the desired order
    await UserSeeder.run()
    await LocationSeeder.run()
    await EventSeeder.run()
    await InterestSeeder.run()
    await EventInterestSeeder.run()
    await SkillSeeder.run()
    await UserInterestSeeder.run()
    await OrganizationSeeder.run()
    await AgentSeeder.run()
    await UserSettingSeeder.run()
  }
}

module.exports = DatabaseSeeder
