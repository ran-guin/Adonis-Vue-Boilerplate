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

const prompts = require('prompts');
var Install = {}
const Seeds = [
  UserSeeder,
  OrganizationSeeder,
  AgentSeeder,
  LocationSeeder,
  EventSeeder,
  InterestSeeder,
  EventInterestSeeder,
  SkillSeeder,
  UserInterestSeeder

  // Add more Seed files here to customize ... (also need to define above)
]

class DatabaseSeeder {
  async run() {

    const response = await prompts({
      type: 'confirm',
      name: 'all',
      message: 'Install Everything ?',
    });

    var Messages = []
    for (var i = 0; i < Seeds.length; i++) {
      var install = true
      message = 'Installing ' + Seeds[i].name

      if (!response.all) {
        var confirm = await prompts({
          type: 'confirm',
          name: 'thisFile',
          message: 'Install ' + Seeds[i].name + ' ?'
        })

        install = confirm.thisFile
      }

      if (install) {
        var message = 'seed ' + Seeds[i].name
        try {
          const added = await Seeds[i].run()
          console.log(JSON.stringify(added))
          message = 'Seeded using ' + Seeds[i].name + ': ' + added
        } catch (err) {
          message = 'Error installing ' + Seeds[i].name + ' (' + err.message + ')'
          console.log('error encountered: ' + err);
        }
      } else {
        console.log('skipping ' + Seeds[i].name)
        message = 'manually skipped ' + Seeds[i].name
      }
      Messages.push(message)
    }

    console.log('\ndone...\n')
    for (var j = 0; j < Messages.length; j++) {
      console.log('- ' + Messages[j])
    }
  }

}

module.exports = DatabaseSeeder
