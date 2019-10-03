'use strict';

const UserSeeder = require('./UserSeeder')
const AgentSeeder = require('./AgentSeeder')
const OrganizationSeeder = require('./OrganizationSeeder')

class DatabaseSeeder {
  async run() {
    // Put yours seeders in the desired order
    await UserSeeder.run()
    await OrganizationSeeder.run()
    await AgentSeeder.run()
    await DocumentTypeSeeder.run()
    await DocumentTypeAttributeSeeder.run()
    await ScopeSeeder.run()
    await ClaimSeeder.run()
    await ScopeClaimSeeder.run()
    await AppSeeder.run()
    await AppScopeSeeder.run()
  }
}

module.exports = DatabaseSeeder