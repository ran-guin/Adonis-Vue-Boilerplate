'use strict'

const Model = use('Model')
const Hash = use('Hash')
const ENV = use('Env')

const Database = use('Database')
const Login = use('App/Models/Login')
const Config = use('Config')

const Custom = Config.get('custom')

const Env = process.env.NODE_ENV || ENV.get('NODE_Env', 'undef')
const db = ENV.get('DB_DATABASE', 'undef')
const db_user = ENV.get('DB_USER', 'undef')
const app_name = ENV.get('APP_NAME', 'appname')
const app_ext  = ENV.get('APP_EXT', '.ca')
const url = ENV.get('API_URL', 'https://' + app_name + app_ext)
var codeVersion = ENV.get('CODE_VERSION', 'undef')

var context
var testMatch = /app_name\_(\w+)/
if (db === app_name) {
  codeVersion += ' (production)'
} else if (context = db.match(testMatch)) {
  codeVersion += ' (' + context[1] + ')'
} else {
  codeVersion += ' (custom)'
}
console.log("*** Version: " + codeVersion)

const authenticator = Config.get('auth.authenticator')

const payloadContent = Custom.payloadContent


const defaultPayload = {
  Env: Env,
  db: db,
  db_user: db_user,
  codeVersion: codeVersion
}

class User extends Model {
  static boot () {
    super.boot()

    /**
     * A hook to bash the user password before saving
     * it to the database.
     *
     * Look at `app/Models/Hooks/User.js` file to
     * check the hashPassword method
     */
    // this.addHook('beforeCreate', 'User.hashPassword')

    this.addHook('beforeCreate', async (userInstance) => {
      userInstance.password = await Hash.make(userInstance.password)
    })
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens () {
    return this.hasMany('App/Models/Token')
  }

  Env () {
    return {
      Env: Env,
      db: db,
      db_user: db_user,
      codeVersion: codeVersion
    }
  }

  IP (request) {
    console.log('get remote connection information')
    if (request && request.connection) {
      return request.connection.remoteAddress
    } else if (request && request.request && request.request.connection) {
      return request.request.connection.remoteAddress
    } else {      
      return 'undefined'
    }
  }

  async login (email, include) {
    console.log('login user')
    const user = await Database
      .select(
        'users.id',
        'users.username',
        'users.email',
        'users.UUID',
        'agents.role',
        'users.status',
        'organizations.name'
      )
      .from('users')
      .leftJoin('agents', 'user_id', 'users.id')
      .leftJoin('organizations', 'organization_id', 'organizations.id')
      .where('users.email', 'like', email)

    try {
      if (user && user.length) {
        console.log('retrieved user: ' + JSON.stringify(user))

        var login = new Login()
        login.user_id = user[0].id

        if (include) {
          var keys = Object.keys(include)
          for (var i = 0; i < keys.length; i++) {
            login[keys[i]] = include[keys[i]]
            console.log('include ' + keys[i] + ': ' + include[keys[i]])
          }
        }

        await login.save()

        var settings = []
        console.log('Add settings to payload: ' + JSON.stringify(payloadContent.settings)) 
        if (payloadContent.settings) {
          const payloadSettings = Object.values(payloadContent.settings)
          console.log('retrieve settings: ' + payloadSettings.join(', '))
          const getSettings = await Database
            .select(payloadSettings)
            .from('user_settings')
            .where('user_id', 'like', user[0].id)

          if (getSettings) {
            settings = getSettings[0]
          }
          console.log('include: ' + JSON.stringify(settings))
        } 
        
        console.log(login.id + ': Login: ' + JSON.stringify(login))
        var payload = this.buildPayload({
          user: user[0],
          login: login,
          settings: settings,
          default: defaultPayload
        })

        if (!user[0].role) { 
          console.log('default to User role')
          payload.role = 'User'
        }

        var hash = {
          success: 'Logged in successfully',
          mode: authenticator,
          payload: payload
        }
        console.log('generated login: ' +JSON.stringify(hash))
        return new Promise(function (resolve) {
          resolve(hash)
        })
      } else {
        return {success: false, error: 'User not found'}
      }
    } catch (err) {
      return {success: false, error: err}     
    }
  }

  buildPayload (input) {
    // var models = Object.keys(input)
    // for (var i = 0; i < models.length; i++) {
    // }
    console.log('build payload...')

    var payload = input.default || {}
    var loginAtts = payloadContent.login || {}

    var scopes = ['user', 'login', 'settings']
    for (var si = 0; si < scopes.length; si++) {
      var s = scopes[si]
      console.log(s + ' data: ' + JSON.stringify(input[s]))
      if (payloadContent[s] && input[s]) {
        const Atts = Object.keys(payloadContent[s])
        for (var ai = 0; ai < Atts.length; ai++) {
          var key = Atts[ai]
          var field = payloadContent[s][Atts[ai]]
          payload[key] = input[s][field]
          if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
            console.log('set to default if applicable...')
            payload[key] = payloadContent.default[key]
          }
        }
      } else {
        console.log('no ' + s + ' attributes in payload...')
      }
    }
    console.log('built payload: ' + JSON.stringify(payload, null, 2))
    // userid: reloaded.id,
    // username: reloaded.username,
    // email: reloaded.email,
    // role: 'User',
    // access: reloaded.access,
    // login_id: login.id,
    // Env: Env,
    // db: db,
    // db_user: db_user,
    // codeVersion: codeVersion
    // }
    return payload
  }
}

module.exports = User
