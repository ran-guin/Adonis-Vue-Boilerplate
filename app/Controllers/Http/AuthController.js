'use strict'
const Hash = use('Hash')
const Database = use('Database')
const User = use('App/Models/User')
const Invitation = use('App/Models/Invitation')
const Promo = use('App/Models/Promo')
const Recovery = use('App/Models/PasswordRecovery')
const Login = use('App/Models/Login')
const { validate } = use('Validator')
const Validator = use('Validator')
const Env = use('Env')

// const uuidv4 = require('uuid/v4');
const Email = use('App/Models/Email')

const uuidv4 = require('uuid/v4');

var Config = use('Config')
// Customizations:

const url = Env.get('API_URL')
const app_name = Env.get('APP_NAME')
const email_domain = Env.get('EMAIL_DOMAIN')

const welcomeMessage = `
  <P><B>Welcome to ` + app_name + `<B></P>

  <P>Thank you for registering with us.</P>
  <P>Please click on the following link to activate your registration and confirm your email address:</P>
`
const pendingMessage = `
  <P><B>Thanks for pre-registering with ` + app_name + `<B></P>

  <P>We will keep you posted and send you an invitation when we are ready to launch the beta version.</P>
`

const maxRecover = 10*60*1000 // recovery link valid for 10 minutes
const maxInvite = 5*24*60*60*1000 // recovery link valid for 5 days
const passwordRecoveryMessage = `
  <P><B>Password Recovery Request<B></P>

  <P>You have requested a password recover / reset.</P>  
  <P>Please click on the link below to reset your passord</P>
`

// End Custommizations

class AuthController {
  env ({response}) {
    var user = new User()
    var env = user.Env()
    console.log('env: ' + JSON.stringify(env))
    return response.json(env)
  }

  header (request, scope) {
    const header = request.headers
    if (! header && request.request) {
      header = request.request.headers
    }

    if (header && header.authorization && (scope === 'token' || scope === 'payload')) {
      const auth = header.authorization
      // console.log('header: ' +JSON.stringify(header))
      // console.log('auth: ' +JSON.stringify(auth))
      const specs = auth.match(/Bearer (.+)$/)
      if (specs && scope === 'token') {
        // console.log('found token...')
        return {scheme: 'bearer', token: specs[1]}
      } else if (specs && scope === 'payload') {
        var payload = jwt.decode(specs[1]) // , process.env.IDVPN_SECRET, 'HS256')
        console.log('decoded ' + specs[1] + ' -> ' + JSON.stringify(payload))
        return payload
      } else { return null }
    
    } else if (scope) { 
      return header[scope]
    } else { return header }
  }

  async confirmRegistration ({auth, params, view, request, response}) {
    var {token, message, warning, error} = request.all()
    var uuid = params.token || token
    const rules = {
      uuid: 'required'
    }

    console.log('confirm registration')
    var user = await User.findBy('uuid', uuid)

    if (user) {
      console.log('confirm registration')
      if (user.status === 'registered') {
        user.status = 'active'
        await user.save()

      return response.redirect('/login?message=Thanks for confirming your email address !')
      // return view.render('/login?message=Thanks for confirming your email address !')

        // return response.json({success: true, message: 'Thanks for confirming your email address !'})
      } else {
        console.log('already registered...')
        return response.redirect('/login?message=You are already registered !')
        // return response.json({success: true, message: 'Already Registered'})
      }
    } else {
      return response.redirect('/login?message=Invalid registration link')
    }
  }

  async cancelRegistration ({auth, request, response}) {
    console.log('cancel registration')
  }

  async recoverPassword ({auth, request, response}) {
    const {email} = request.all()
    // Generate email to recover password and add entry to password_recovery table
    const rules = {
      email: 'required|email'
    }

    const validation = await Validator.validateAll(request.all(), rules)
    if (validation.fails()) {
      var fails = validation.messages()
      console.log('Failed Password Recovery' + JSON.stringify(fails))
      response.json( { error: 'Valid Email Required', validation_errors: fails, rules: rules } )
    } else {
      var user = await User.findBy('email', email)

      var warning = ''
      if (user && user.id) {
        console.log('found user: ' + user.id)

        const timestamp = new Date()
        console.log('time: ' + timestamp)
        var reset_token = uuidv4()
        console.log('token: ' + reset_token)

        var source = new User()

        var recovery = new Recovery()
        console.log('new recovery')
        recovery.requested = timestamp
        recovery.user_id = user.id
        recovery.token = reset_token
        recovery.status = 'initialized'
        recovery.ip = source.IP(request.request)

        console.log('.. save')
        await recovery.save()

        console.log('saved recovery...')
        const fakelink = "<a href='" + url + "/accessResetPasswordFlag/" + email + "'> I did not request a reset password </a>"

        console.log('send Password recovery message to ' + user.email)
        const link = "<BR><BR><a href='" + url + "/accessResetPassword/" + reset_token + "'> Reset Password"

        const Message = {
          from: 'no-reply@' + email_domain,
          to: user.email,
          subject: app_name + 'Password Recovery',
          html: passwordRecoveryMessage + link
        }
        console.log('launch password recovery message')
        await Email.sendMessage(Message)
        .catch (err => {
          warning = err.message
        })
      } else {
        console.log('no user found with email: ' + email)
      }
      return response.json({success: true, message: 'Password recovery request acknowledged', warning: warning})
    }
  }

  async accessResetPasswordFlag ({auth, view, params, request, response}) {
    const {email} = request.all()
    var user = await User.findBy('email', email)

    if (user) {
      var Failure = new Recovery()
      Failure.status = 'failed'
      Failure.user_id = user.user_id
      Failure.ip = user.IP(request.request)
      Failure.note = 'no recovery requested by ' + email

      await Failure.save()
    }
    return response.redirect('/login?message=Thanks for letting us know.')
  }

  async accessResetPassword ({auth, view, params, request, response}) {
    // Accessed password recovery (via email recovery request)
    var {token, message, warning, error} = request.all()
    var accessToken = params.token || token
    const rules = {
      accessToken: 'required'
    }

    console.log('resetting password')
    var recovery = await Recovery.findBy('token', accessToken)

    if (recovery) {
      const now = new Date()
      const then = new Date(recovery.requested)
      const timediff = now.getTime() - then.getTime()
      console.log('time diff = ' + timediff/1000/60 + ' minutes')
      if (timediff > maxRecover) {
        console.log('expired')
        return response.redirect('/login?error=Recovery Link has expired.  Please regenerate recovery link if required.')
      }
      else if (recovery.status === 'initialized') {
        console.log('initialized')
        return view.render('pages/recoverPassword', {token: accessToken, message: message, warning: warning, error: error})

      } else if (recovery && recovery.status) {
        console.log('recovered, but status is already ' + recovery.status)
	
	      var user = new User()
        var Failure = new Recovery()
        Failure.status = 'failed'
        Failure.user_id = recovery.user_id
        Failure.note = 'already ' + recovery.status
        Failure.ip = user.IP(request.request)
        await Failure.save()

        return view.render('pages/recoverPassword', {token: accessToken, message: message, warning: warning, error: error})
      }
    } else {
      console.log('invalid token')

      var user = new User()
      var Failure = new Recovery()
      Failure.status = 'failed'
      Failure.note = 'invalid token'
      Failure.ip = user.IP(request.request)
      await Failure.save()
      return response.redirect('/login?error=Invalid recovery link')
    }
  }
  async resetPassword ({auth, view, request, response}) {
    // Perform password reset
    const resetExpiry = 10 * 1000
    const {token, password, confirmPassword, delay} = request.all()
    const rules = {
      password: 'required|min:8'
    }

    const validation = await Validator.validateAll(request.all(), rules)
    if (validation.fails()) {
      var errors = validation.messages()
      return response.redirect('/accessResetPassword/' + token + '?warning=Password must be at least 8 characters')
    } else {
      console.log('resetting password')
      var recovery = await Recovery.findBy('token', token)
      if (recovery) {
        // Valid toek found ...
        const timediff = new Date().getTime() - new Date(recovery.requested).getTime()
        console.log('time diff = ' + timediff)
        if (timediff > maxRecover) {
          console.log('expired')
          return response.redirect('/login?error=Recovery Link has expired.  Please regenerate recovery link if required.')
        } else if (recovery.status === 'initialized') {
          if (password === confirmPassword) {
            console.log('RESET Password for ' + recovery.user_id)
            var user = await User.findBy('id', recovery.user_id)
            user.password = await Hash.make(password)
            await user.save()

            recovery.status = 'reset'
            await recovery.save()

            console.log('new password saved')
            return response.redirect('/login?message=Password has been Reset.  Please login again')
          } else {
            console.log('passwords do not match')
            return response.redirect('/accessResetPassword/' + token + '?warning=Password mismatch')
          }
        } else if (recovery && recovery.status) {
          var user = new User()

          var Failure = new Recovery()
          Failure.status = 'failed'
          Failure.token = token
          Failure.note = 'already ' + recovery.status
          Failure.requested = recovery.requested
          Failure.user_id = recovery.user_id
          Failure.ip = user.IP(request.request)

          await Failure.save()
          return response.redirect('/login?error=This link has already been used.  Please try again.')
          // return response.json({success: false, status: recovery.status})
        }
      } else {
        var user = new User()
        var Failure = new Recovery()
        Failure.status = 'failed'
        Failure.note = 'invalid token'
        Failure.ip = user.IP(request.request)
        await Failure.save()
        return response.redirect('/login?error=Invalid recovery link')
      }
    }
  }

  async register ({auth, request, response}) {
    const {username, email, password, confirmPassword, shortForm, source, token} = request.all()
    const rules = {}

    const invitation_required = Config.get('custom.invitation_required')

    rules.password = 'required|min:8'
    rules.email = 'required|email|unique:users,email'

    if (!shortForm) {
      rules.username = 'required'
      rules.confirmPassword = 'required'
    }

    var failed = '' // FAilure message if applicable ... 
    // Note: confirmPassword may be bypassed on client side explicitly by simply copying password input to confirmPassword prior to posting

    console.log('attempt registration for ' + email)
    const validation = await Validator.validateAll(request.all(), rules)
    if (validation.fails()) {
      var errors = validation.messages()
      console.log('Failed registration validation' + JSON.stringify(validation.messages()))
      
      if (source === 'server') {
        console.log('detected server side registration')
        console.log(errors)
        response.redirect('/register')
      } else {
        var errmsg = 'Failed Validation'
        if (errors.length && errors[0].message && errors[0].message.match(/unique validation/)) {
          errmsg = 'Already Registered'
        }
        response.json( { error: errmsg, validation_errors: errors, rules: rules} )
      }
    } else {
      const authenticator = Config.get('auth.authenticator')
      console.log(authenticator + ' signup attempt for ' + email)

      var invitation
      if (token) {
        // invitation token
        console.log('checking registration token: ' + token)
        try {
          invitation = await Invitation.findBy('token', token)
          var promo = await Promo.findBy('code', token)
          var invite_id

          if (promo) {
            console.log('promo: ' + JSON.stringify(promo))
            if (promo.status !== 'active') {
              console.log('promo code status is ' + promo.status)
              failed = 'promo code ' + promo.status
            } else {
              invitation = new Invitation()
              invitation.token = token
              invitation.email = email
              invitation.requested = new Date()

              console.log('generated invitation record for promo usage')
            }
          } else if (invitation) {
            console.log('invite: ' + JSON.stringify(invitation))
            if (invitation.status !== 'sent') {
              failed = 'Invitation status ' + invitation.status
            } else {
              const now = new Date()
              const timediff = now.getTime() - then.getTime()
              console.log('time diff = ' + timediff/1000/60 + ' minutes')
              if (timediff > maxInvite) {
                console.log('expired invitation')
                invitation.status = 'expired'

                failed = 'Invitation link has expired.  You must request another invite'
              } else {
                invite_id = invitation.id
              }
            }
          } else if ( !invitation_required ) {
            console.debug('no invitation / promo code required...')
          } else {
            console.log('no promo or invitation...')
            failed = 'invalid invitation token'
          }
        } catch (err) {
          console.log('problem checking for invitations / promo codes')
          response.json({success: false})
        }
      } else if (invitation_required) {
        var invite = new Invitation()
        invite.email = email
        invite.requested = new Date()

        await invite.save()
        console.log('registered request')

        const Message = {
          from: 'no-reply@' + email_domain,
          to: invite.email,
          subject: 'Thanks for pre-registering for ' + app_name,
          html: pendingMessage
        }
        await Email.sendMessage(Message)
        response.json({ success: true, message: 'Request acknowledged' })
      }

      // either invite_id defined OR fialed defined by this stage... 
      if (failed) {
        console.log('failed registration process...')
        console.log(failed)
        response.json({success: false, error: failed })
        // return response.redirect('/signUp?error=' + failed)
      } else if (invitation || !invitation_required) {
        console.log('registration proceeding...')
        const uuid = uuidv4()
        var user = new User()
        user.username = username
        user.email = email
        user.password = password
        user.UUID = uuid
        if (password && password.length && (shortForm || (password === confirmPassword))) {
          try {
            await user.save()

            var reloaded = await User.findBy('email', email)
            console.log('new user: ' + JSON.stringify(reloaded))

            const timestamp = new Date()
            var login = new Login()
            login.user_id = reloaded.id
            login.login = timestamp
            login.ip = user.IP(request.request)

            await login.save()

            if (invitation) {
              // should always be defined as long as invites are required
              invitation.user_id = reloaded.id
              invitation.status = 'accepted'
              invitation.save()
            }

            console.log('login: ' + JSON.stringify(login))

            const payload = user.buildPayload({
              user: reloaded, 
              login: login, 
              default: user.defaultPayload
            })

            console.log('payload: ' + JSON.stringify(payload))
            var returnval = {
              success: true,
              message: 'Registration Successful',
              mode: authenticator, // eg jwt or session authentication
              payload: payload
            }
            console.log('response: ' + JSON.stringify(returnval))

            const welcomeLink = "<BR><BR><a href='" + url + "/confirmRegistration/" + user.UUID + "'> Confirm Registration"
            const Message = {
              from: 'no-reply' + email_domain,
              to: user.email,
              subject: 'Welcome to ' + app_name,
              html: welcomeMessage + welcomeLink
            }
            await Email.sendMessage(Message)
              .then( response => {
                console.log('Welcome message response: ' + JSON.stringify(response))
                returnval.message = returnval.message + ' ' + response.message
              })
              .catch ( err => {
                console.debug('Warning sending welcome message: ' + err.message)
                returnval.message = returnval.message + ' (' + err.message + ')'
              })

            if (authenticator === 'jwt') {
              // add token to response if jwt authentication is being used
              const access = await auth
                .withRefreshToken()
                .attempt(email, password)
              const jwtToken = access.token

              console.log('generated token: ' + JSON.stringify(jwtToken))
              returnval.token = jwtToken
            }
            response.json(returnval)
          } catch (error) {
              var msg = 'Failed to register'
              console.log('caught registration error: ' + error)
              response.json({error: msg})
          }
        } else {
          console.log('passwords did not match')
          response.json({error: 'Password Error'})
        }
      }
    }
  }

  async resendWelcome ({request, response}) {
    var payload = this.header(request, 'payload')
    console.log('p ?' + JSON.stringify(payload))

    if (payload && payload.userid) {
      const welcomeLink = "<BR><BR><a href='" + url + "/confirmRegistration/" + user.UUID + "'> Confirm Email Address"

      const Message = {
        from: 'no-reply' + email_domain,
        to: user.email,
        subject: 'Welcome to ' + app_name,
        html: welcomeMessage + welcomeLink
      }
      await Email.sendMessage(Message)
    } else {
      return response.json({success: false, error: 'no payload or userid'})
    }
  }

  async login ({auth, request, response}) {
    console.log('auth login')
    const {email, password} = request.all()
      const rules = {
        email: 'required|email',
        password: 'required'
      }
    const validation = await Validator.validateAll(request.all(), rules)

    if (validation.fails()) {
      var fails = validation.messages()
      console.log('Failed login validation' + JSON.stringify(fails))
      response.json( { error: 'Failed Validation', validation_errors: fails, rules: rules } )
    } else {
      console.log('got email + password ')
      const authenticator = Config.get('auth.authenticator')
      console.log(authenticator + ' login attempt for ' + email)
      try {
        // var logged_in = await auth.check()
        // console.log("logged in already ? " + JSON.stringify(logged_in))
        // await auth.logout()
        var token = null
        var payload = null
        var refresh_token = null

        if (authenticator === 'jwt') {
          console.log('get my token...')
          const access = await auth
            .withRefreshToken()
            .attempt(email, password)
          console.log('got access...')
          token = access.token
          console.log('Access: ' + JSON.stringify(access))
          refresh_token = access.refreshToken
        } else {
          console.log('authenticator: ' + authenticator)
        }

        var user = new User()
        var ip = user.IP(request.request)
        const login = await user.login(email, { ip: ip, login: new Date() })
        login.token = token || 'no token. Using ' + authenticator
        login.refresh_token = refresh_token

        console.log('Server side login response: ' + JSON.stringify(login))

        if (login) {
          response.json(login)
          // return login
        } else {
          console.log('user not found')
          response.json({error: 'Authorization Failed'})
        }          
      } catch (err) {
        var msg = 'Attempting Login: ' + err
        console.log(msg)
        response.json({error: 'Login Error', message: msg})        
      }
    }
  }

  async logout({request, response, auth}) {  
    const {login_id} = request.all()
    // var logged_in = await auth.check()
    // console.log('logged in ?' + JSON.stringify(logged_in))
    console.log('logging out from ' + login_id)
    const timestamp = new Date()
    console.log('at: ' + timestamp)
    var update = Database
      .table('logins')
      .where('id', login_id)
      .update('logout', timestamp)
 
    try {
       const ok = await update
       console.log(ok + ' logged out successfully: ' + timestamp)
       response.json({success: 'Logged Out'})
     } catch (err) {
       console.log('error tracking logout: ' + err)
       response.json({error: 'Logout Error'})
     }
  }

  async check({auth, request, response}) {
    console.log('verifying token status.. ')
    try {
      console.log('check status')
      var ok = await auth.check()
      console.log('ok: ' + ok)
      response.send({logged_in: ok})
    } catch (error) {
      console.log('Error: ' + error)
      console.log('name: ' + error.name)
      console.log('msg: ' + error.message)
      if (error.name === 'ExpiredJwtToken') {
        response.send({logged_in: false, message: 'Expired Session'})
      } else {
        response.send({logged_in: false, message: 'Missing or invalid jwt token'})
      }
    }
  }

  async refresh({request, response, auth}) {
    // not implemented yet, but would be something like ...
    console.log('refresh if applicable...')
    // console.log(JSON.stringify(request._header))
    // console.log(JSON.stringify(response.request._header))
    try {
      var loggedIn = await auth.check()
      console.log('logged in ? ' + loggedIn)
      console.log('AUTH :' + request.header('Authorization'))
      if (loggedIn) {
        console.log('still logged in ... refresh')
        const refreshToken = request.input('refresh_token')
        var access = await auth.generateForRefreshToken(refreshToken)
        response.json({token: access.token})
      } else {
        console.log('not logged in...')
        response.json({message: 'not logged in'})
      }
    } catch (error) {
      console.log('refresh error: ' + error)
      response.json({expired: true})
    }
  }

  async getUser({ response, auth }) {
      // not implemented yet, but would be something like ...
      try {
          const user = await auth.getUser()

          // I personally do not want to return the full user object here
          return {
              id: user.id,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email
          }
      } catch (error) {
          response.status(401).send(error)
      }
  }

  async thirdPartyAuthentication({ request, response, auth }) {
      // not implemented yet ... 
    const {target} = request.all() // eg 'facebook'

    await ally.driver(target).redirect()
  }

  async thirdPartyUser({ request, response, auth }) {
      // not implemented yet ... 
    const {target} = request.all() // eg 'facebook'

    var fields = []; // may vary by target app... eg: ['username', 'email', 'profile_pic']
    await ally
      .driver(target)
      .fields(fields)
      .getUser()
  }

  async remoteRegister ({request, response}) {
    const req = request.all()
    console.log('Remote registration: ')
    console.log(JSON.stringify(req))
    response.json(req)
  }
}

module.exports = AuthController
