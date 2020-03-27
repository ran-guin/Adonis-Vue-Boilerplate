<template lang='pug'>
  div.centred(style='background-color: white')
    rgv-form.login-form(:form='form' :options='loginOptions' :remoteErrors='formErrors')
    router-link.text-sm(to='/Recover') Forgot Password ?
    br
    a.text-sm(@click='registerMe()') Sign Up
    p.error(v-if='authError') {{authError}}
    p &nbsp;
</template>

<script>
import Config from '@/config.js'
import axios from 'axios'
import auth from '@/auth'

import FormValidator from '@/mixins/FormValidator'

export default {
  components: {
  },
  mixins: [
    FormValidator
  ],
  data () {
    return {
      mode: '',
      noLogin: true, // hide login buttons when generating login page
      form: {
        email: ''
      },
      inviteToken: '',
      noFooter: false,
      noMobileHeader: false,
      env: {},
      authError: '',
      note: '',
      email: '',
      formErrors: {},
      myOptions: {},
      loginOptions: {
        access: 'append',
        fields: [
          { name: 'email', type: 'email', prompt: 'Email', rules: [Config.rules.email], icon: 'email' },
          { name: 'password', type: 'password', prompt: 'Password', rules: [Config.rules.min(8)], icon: 'lock' }
        ],
        submitButtonClass: 'btn-primary btn-lg',
        // buttonType: 'submit',
        header: '',
        title: 'Login',
      },
      signupOptions: {
        access: 'append',
        fields: [
          { name: 'token', type: 'text', prompt: 'Promo Code', placeholder: 'leave blank to request beta access', icon: 'redeem'},
          { name: 'email', type: 'email', prompt: 'Email', rules: [Config.rules.email], icon: 'email' },
          { name: 'password', type: 'hidden', prompt: 'Password', rules: [Config.rules.min(8)], icon: 'lock'}
        ],
        submitButtonClass: 'btn-primary btn-lg',
        submitButton: 'Request Beta Access',
        // buttonType: 'submit',
        header: 'Request access to Beta version',
        title: ''
      },
      recoverOptions: {
        access: 'append',
        fields: [
          {
            name: 'email', 
            prompt: 'Email', 
            placeholder: 'Registered email address', 
            type: 'email', 
            // mandatory: true,
            rules: [Config.rules.email]
          }
        ],
        submitButton: 'Reset Password',
        submitButtonClass: 'btn-primary btn-lg',
        // noClose: true,
        buttonType: 'submit',
        header: 'Password Recovery',
        title: ''
      },
      config: Config,
      apiURL: Config.apiURL[process.env.NODE_ENV],
      message: '',
      warning: '',
      error: '',
      noRefresh: true,
      redirect_default: Config.lpURL[process.env.NODE_ENV],
      rules: Config.rules,
      invitationRequired: false
    }
  },
  props: {
    onRegister: {
      type: Function
    },
    onCancel: {
      type: Function
    },
    invitationToken: {
      type: String
    },
    page: {
      type: String,
      default: 'Login'
    }
  },
  created: function () {
    if (this.page === 'Logout') {
      this.logout()
      this.page = 'Login'
    }

    this.redirect_uri = this.$route.query.redirect || this.$route.query.redirect_uri
    this.inviteToken = this.invitationToken || this.$route.params.token || this.$route.query.token
    this.$myConsole.debug('token supplied ? ' + this.$route.params.token + ' = ' + this.inviteToken)

    this.$myConsole.debug('url query ?: ' + JSON.stringify(this.$route.query))
    this.$myConsole.debug('url params ?: ' + JSON.stringify(this.$route.params))

    this.$myConsole.debug('Rules: ' + JSON.stringify(this.rules))
    this.$myConsole.debug('apiURL' + process.env.NODE_ENV + ' -> ' + this.apiURL)

    this.$myConsole.debug('Login options: ' + JSON.stringify(this.loginOptions))
    this.$set(this.loginOptions, 'onSubmit', this.login)
    this.$set(this.loginOptions, 'onBlur', this.checkInput)
    this.$set(this.loginOptions, 'onFocus', this.inputFocus)
    this.$set(this.loginOptions, 'onCancel', this.cancelLogin)

    this.$myConsole.debug('initialized login options...')

    this.$myConsole.debug('Signup options: ' + JSON.stringify(this.signupOptions))
    this.$set(this.signupOptions, 'onSubmit', this.signup)
    this.$set(this.signupOptions, 'onBlur', this.checkInput)
    this.$set(this.signupOptions, 'onFocus', this.inputFocus)
    this.$set(this.signupOptions, 'onCancel', this.cancel)

    if (!this.invitationRequired) {
      this.form.token = 'publicaccess' // promos should include this string as well to bypass invitation process...
      this.changeToRegister('publicAccess')
    } else if (this.inviteToken) {
      this.changeToRegister()
    } else {
      this.changeToRequest()
    }
    this.$myConsole.debug('Recovery options: ' + JSON.stringify(this.recoverOptions))
    this.$set(this.recoverOptions, 'onSubmit', this.recoverPassword)
    this.$set(this.recoverOptions, 'onFocus', this.inputFocus)
    this.$set(this.recoverOptions, 'onCancel', this.cancel)
    this.$myConsole.debug('Connection: ' + JSON.stringify(this.request))
    this.$store.dispatch('AUTH_LOGOUT')

    var path = this.$route.path.match(/\/?(\w+)/)

    var presets = ['email', 'token']
    for (var i = 0; i < presets.length; i++) {
      var val = this.$route.params[presets[i]] || this.$route.query[presets[i]]
      if (val) { this.form[presets[i]] = val }
    }
    // var email = this.$route.params.email || this.$route.query.email
    // if (email) { 
    //   this.$myConsole.debug('*** preset email: ' + email)
    //   this.form.email = email
    // }

    if (this.page) {
      this.mode = this.page
      this.$myConsole.debug('Mode: ' + this.mode)
    } else if (this.$route.query.mode || this.$route.params.mode) {
      this.mode = this.$route.query.mode || this.$route.params.mode
      this.$myConsole.debug('input mode: ' + this.mode)
    } else if (!this.mode && path) {
      this.$myConsole.debug('default mode to path: ' + path[1])
      this.mode = path[1]
    } else {
      this.$myConsole.debug('Default mode to Login')
      this.mode = 'Login'
    }

    this.$store.dispatch('clearMessages')
    this.$myConsole.debug('*** get url messages/warnings...')
    this.message = this.$route.query.message
    this.warning = this.$route.query.warning
    this.error = this.$route.query.error

    this.$myConsole.debug('url message: ' + this.message)

    const delayed_redirect = this.$route.params.delayed_redirect || this.$route.query.delayed_redirect
    if (delayed_redirect) {
      this.$myConsole.debug('redirecting to ' + delayed_redirect)
      this.delayedRedirect(this.message, 'message', delayed_redirect)
    }

    this.$myConsole.debug('Route Path: ' + JSON.stringify(path) + '; Mode: ' + this.mode)
    this.loadEnv()
  },
  computed: {
    payload: function () {
      return this.$store.getters.payload || {}
    },
    myId: function () {
      if (this.mode === 'Login') {
        return 'login-modal'
      } else if (this.mode === 'Recover') {
        return 'recover-modal'
      } else {
        return 'signup-modal'
      }
    },
    options: function () {
      if (this.mode === 'Login') {
        this.$myConsole.debug('opt = ' + JSON.stringify(this.loginOptions))
        return this.loginOptions
      } else if (this.mode === 'Recover') {
        return this.recoverOptions
      } else {
        return this.signupOptions
      }
    },
    hasToken: function () {
      return this.form.token ? true : false
    }
  },
  methods: {
    cancelLogin: function () {
      this.onCancel()
    },
    registerMe: function () {
      console.log('launch registration')
      if (this.onRegister) {
        this.onRegister()
      } else {
        console.log('no registration action supplied')
      }
    },
    loadEnv () {
      var _this = this
      this.$myConsole.debug('env: ' + process.env.NODE_ENV)
      this.$myConsole.debug(JSON.stringify(Config.apiURL))
      this.$myConsole.debug('axios: get env from ' + this.apiURL)
      axios.get(this.apiURL + '/env')
        .then(function (response) {
          if (response.data && response.data.codeVersion) {
            _this.$myConsole.debug('*** env: ')
            _this.$myConsole.debug(JSON.stringify(response.data))
            _this.env = response.data
            _this.initializeOptions()
          } else {
            _this.$myConsole.debug('*** no env detected: ' + JSON.stringify(response))
          }
        })
        .catch(function (err) {
          _this.$myConsole.debug('Error retrieving env: ' + err)
          // _this.$store.dispatch('logError', 'Problem connecting to server.  Please try again later.')
          _this.delayedRedirect('Problem connecting to server.  Please try again later.', 'error')
        })
    },
    clearLocalMessages: function () {
      this.message = ''
      this.warning = ''
      this.error = ''
      this.authError = ''
      this.formErrors = {}
      this.$myConsole.debug('cleared local messages...')
      this.$store.dispatch('clearMessages')
    },
    setToLogin: function (reset) {
      this.mode = 'Login'
      this.clearLocalMessages()
      this.adjustForEnv()
      this.$myConsole.debug('set login options: ')
      this.$myConsole.debug(JSON.stringify(this.loginOptions))
      if (reset) { this.clearLocalMessages() }
    },
    setToSignup: function (reset) {
      this.mode = 'SignUp'
      this.clearLocalMessages()
      this.adjustForEnv()
      this.$myConsole.debug('signup options: ')
      this.$myConsole.debug(JSON.stringify(this.signupOptions))
      if (reset) { this.clearLocalMessages() }
    },
    setToRecover: function (reset) {
      this.clearLocalMessages()
      this.adjustForEnv()
      this.mode = 'Recover'
      this.$myConsole.debug('set recover options: ')
      this.$myConsole.debug(JSON.stringify(this.recoverOptions))
      if (reset) { this.clearLocalMessages() }
    },
    initializeOptions: function () {
      if (this.inviteToken) {
        this.$myConsole.debug('hide invitation token field')
        this.signupOptions.fields[0].value = this.inviteToken
      }

      if (this.mode === 'Recover') {
        this.setToRecover()
      } else if (this.mode === 'Login') {
        this.setToLogin()
      } else if (this.mode === 'SignUp') {
        this.setToSignup()
      } else {
        this.$myConsole.debug('unrecognized mode: ' + this.mode)
        this.myOptions = {}
        this.adjustForEnv()
      }
    },
    adjustForEnv: function () {
      if (this.env) {
        if (process.env.NODE_ENV !== 'production') {
          
          this.signupOptions.header += ' (' + process.env.NODE_ENV + ' only)'
          this.loginOptions.header += ' (' + process.env.NODE_ENV + ' only)'

          if (this.mode === 'Login') {
            this.loginOptions.fields[0].prompt += ' - try  guest@' + Config.defaultEmailDomain
            this.loginOptions.fields[1].prompt += ' - use \'demoPassword\' for guest access'
          } else if (this.mode === 'SignUp') {
            this.signupOptions.fields[1].prompt += ' - (' + process.env.NODE_ENV + ' mode)'
            // this.signupOptions.header = this.signupOptions.header
            this.signupOptions.preForm = '(valid for today only)'
          }
        }
      } else {
        // this.$myConsole.debug('no env')
      }
    },
    async login (form) {
      var credentials = {
        email: form.email,
        password: form.password
      }
      this.$myConsole.debug('login ' + form.email)
      try {
        delete axios.defaults.headers.common['Authorization']
        console.debug('login via axios...')
        var response = await auth.login(this, credentials)
        console.log('got response...' + JSON.stringify(response))
        if (response && response.expired) {
          this.$store.dispatch('logWarning', 'Session Expired.  Please log in again.')
        }
        this.$myConsole.debug('Login response:' + JSON.stringify(response))
      } catch (err) {
        this.$myConsole.debug('caught login error: ' + err)
        if (err === 'Network Error') {
          this.$store.dispatch('logError', 'Connection temporarily unavailable...')
        }
        this.$store.dispatch('logError', 'Error encountered during log in ... Please try again')
      }
      return this.initializeSession(response)
    },
    async logout () {
      var loginId = this.payload.login_id
      this.$myConsole.debug('logout via auth...')
      auth.logout(this, loginId)
    },
    async signup (form) {
      var fields = this.signupOptions.fields
      var credentials = { shortForm: true }
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i]
        credentials[f.name] = form[f.prompt] || form[f.name]
      }
      delete axios.defaults.headers.common['Authorization']

      if (!credentials.username) { credentials.username = credentials.email }
      if (this.noConfirm) {
        credentials.confirmPassword = credentials.password
      }
      
      if (this.redirect_uri) {
        credentials.redirect_uri = this.redirect_uri
      }

      this.$myConsole.debug('Signing up with credentials: ')
      // this.$store.dispatch('logMessage', 'Submitting registration request...')
      try {
        var response = await auth.signup(this, credentials)
        this.$myConsole.debug('SignUp call:' + JSON.stringify(response))

        if (response.data.error) {
          this.$set(this.formErrors, 'form', response.data.error)
          console.error(response.data.error)

          if (response.data.validation_errors && response.data.validation_errors[0].message === 'unique validation failed on email') {
            this.delayedRedirect('Looks like you are already registered... redirecting you to recover password', 'warning', this.apiURL + '/recover?email=' + this.form.email)
            // this.warning = 'Looks like you are already registered... redirecting you to recover password'

            // var _this = this
            // setTimeout(function () {
            //   _this.setToRecover()
            // }, 2000); //will call the function after 2 secs.
          }
        } else {
          this.$myConsole.debug('redirect ? ' + this.redirect_uri)
          if (this.redirect_uri) {
            this.$myConsole.debug('** redirecting to ' + this.redirect_uri)
            this.delayedRedirect('Submitting registration request', 'message', this.redirect_uri)
          } else {
            this.$myConsole.debug('no redirect..')
            const message = response.data.message || 'Created Account'
            return this.initializeSession(response, message)
          }
        }
      } catch (err) {
        console.debug('Failed to sign up...')
        return 
      }
    },
    async recoverPassword (form) {
      this.message = 'Generating Recovery Email...'
      this.$myConsole.debug('Form: ' + JSON.stringify(form))
      const email = form.email
      this.$myConsole.debug('recover my password via ' + this.apiURL + '/recoverPassword ... for ' + email)
      var _this = this
      axios.post(this.apiURL + '/recoverPassword', {email: email})
        .then(function (response) {
          if (response && response.data && response.data.validation_errors) {
            this.$myConsole.debug('get service response')
            var val = _this.validateResponse(response)
            if (val.formErrors) { _this.$set(_this, 'formErrors', val.formErrors) }
            return response.data
          } else if (response && response.error) {
            _this.$store.dispatch('logError', response.error)
            return response
          } else if (response && response.data) {
            this.$myConsole.debug('recover response: ' + JSON.stringify(response))
            _this.setToLogin(1)

            _this.delayedRedirect('Password recovery link sent to \'' + email + '\' (if account exists)')
            return response
          }
      })
      .catch(function (err) {
        _this.error = 'Problem generating recovery mail (?)  Please contact us directly.'
        _this.$myConsole.debug('Error Generating Password Recovery ' + err)
      })
    },
    delayedRedirect: function (message, type, path) {
      if (type === 'error') {
        this.error = message
      } else if (type === 'warning') {
        this.warning = message
      } else {
        this.message = message
      }
      var _this = this

      setTimeout(function () {
        _this.message = ''
        _this.warning = ''
        _this.error = ''

        if (path && path.match(/^http/)) {
          window.location = path
        } else if (path) {
          _this.$router.push(path)
        } else {
          _this.$router.push('/')
        }
      }, 2000); //will call the function after 2 secs.
    },
    initializeSession (response, onSuccess) {
      console.debug('initialize session...')
      if (response && response.data && response.data.validation_errors) {
        this.$myConsole.debug('get service response')
        var val = this.validateResponse(response)
        if (val.formErrors) { this.$set(this, 'formErrors', val.formErrors) }
        return response.data
      } else if (response && response.error) {
        this.$store.dispatch('logError', response.error)
        return response
      } else if (response && response.data) {
        if (response.data.success) {
          if (response.data.token) {
            var refreshToken = response.data.refreshToken
            this.$myConsole.debug('token cached: ' + response.data.token)
            this.$myConsole.debug('refresh token: ' + refreshToken)
            this.$store.dispatch('AUTH_TOKEN', {token: response.data.token, refreshToken: refreshToken})

            var pass = 'Bearer ' + response.data.token
            axios.defaults.headers.common['Authorization'] = pass
            // auth.updateToken()
            this.$myConsole.debug('updated token...')
          } else {
            this.$myConsole.debug('no token in response' + JSON.stringify(response.data))            
          }

          if (onSuccess) { alert(onSuccess) }

          if (this.redirect_uri) {
            this.$myConsole.debug('** reroute to ' + this.redirect_uri)
            window.location = this.redirect_uri
          } else {
            if (onSuccess) {
              this.$myConsole.debug('dispatch log message: ' + onSuccess)
              this.$store.dispatch('logMessage', onSuccess)
            }
            if (response.data.payload) {
              this.$myConsole.debug('initialized payload: ' + JSON.stringify(response.data.payload))
              this.$store.dispatch('CACHE_KEYED_PAYLOAD', {payload: response.data.payload, key: Config.CLIENT_ID})
              this.$router.push('/Dashboard?message=' + onSuccess)
              // this.$set(this, 'payload', response.data.payload) this should be redundant (?)
            }
          }
          return { success: true }
        } else if (response.data.message) {
          this.$myConsole.debug('log message error: ' + response.data.message)
          this.$set(this, 'authError','Sorry - Authorization Failed')
          return { error: response.data.message }
        } else if (response.data.error) {
          this.$myConsole.debug('log error: ' + response.data.error)
          this.$set(this, 'authError', 'Sorry - Authorization Failed')
          return { error: response.data.error }
        } else {
          this.$store.dispatch('logWarning', 'unrecognized data response')
          return 'no recognized response...'
        }
      } else {
        this.$store.dispatch('logWarning', 'unrecognized response')
        return {warning: 'unrecognized response'}
      }
    },

    checkInput (e) {
      this.$myConsole.debug('validate input')
      if (e && e.target) {
        const parent = e.target.parentElement
        parent.classList.add('has-error')
        this.note = 'Failed Validation'
      }
    },
    onChange (e) {
      this.$myConsole.debug('on change')
      if (e && e.target) {
        this.$myConsole.debug('val: ' + e.target.name + ' = ' + e.target.value)
      }
    },
    onKeyup (e) {
      this.$myConsole.debug('on change')
      if (e && e.target) {
        this.$myConsole.debug('val: ' + e.target.name + ' = ' + e.target.value)
      }

      if (e && e.target && e.target.name === 'token') {
        const hold = e.target.value // form reset on field change below so keep track of value
        this.$myConsole.debug('reset: ' + e.target.name + ' = ' + e.target.value)

        // Adjust form options for invites vs beta request
        if (this.mode === 'SignUp' && e.target.value) {
          this.changeToRegister(hold)
        } else {
          this.changeToRequest(hold)
        }
      }
    },
    inputFocus (e) {
      this.note = ''
      this.authError = ''
      if (e && e.target) {
        const parent = e.target.parentElement
        parent.classList.remove('has-error')
        this.$myConsole.debug('checkinput')
      } else {
        this.$myConsole.debug('no e-target to focus on')
      }
    },
    inputValidate (e) {
      this.note = ''
      if (e && e.target) {
        const parent = e.target.parentElement
        parent.classList.add('has-success')
        this.$myConsole.debug('validated')
      } else {
        this.$myConsole.debug('no e-target to validate')
      }
    },
    launchLogin: function () {
      if (this.mode === 'Login') {
        this.loginOptions.show = true
      }
      // if (this.env !== 'production') {
      //   opt.title = 'Note:  You are logging into the ' + this.env + ' system'
      //   opt.header = 'Login - ' + this.env + ' mode'
      // }
      this.$set(this, 'myOptions', this.loginOptions)
      this.$store.dispatch('toggleModal', this.myId)
    },
    launchSignUp: function () {
      if (this.mode === 'SignUp') {
        this.signupOptions.show = true
      }
      // if (this.env !== 'production') {
      //   opt.title = 'Note:  You are signuping in the ' + this.env + ' system'
      //   opt.header = 'SignUp - ' + this.env + ' mode'
      // }

      this.$set(this, 'myOptions', this.signupOptions)
      this.$store.dispatch('toggleModal', this.myId)
    },
    cancel: function () {
      this.$set(this, 'formErrors', {})
      this.$myConsole.debug('cancel this form')
      this.authError = ''
      this.mode = 'Login'
      this.$router.push('/Dashboard')
      // this.$router.go(-1)
      this.$store.dispatch('toggleModal', this.myId)
    },
    back: function () {
      this.cancel()
      this.$router.go(-1)
    },
    changeToRequest: function (hold) {
      if (this.mode === 'SignUp') {
        // No token provided: enable request for access

        // Note; fields (in order) are: promo/token, email, password
        this.$myConsole.debug('exclude password from form')
        this.signupOptions.fields[0].value = hold
        this.signupOptions.fields[2].type = 'hidden'
        this.signupOptions.header = 'Request access to Beta version'
        this.signupOptions.submitButton = 'Request Beta Access'
      }
    },
    changeToRegister: function (hold) {
      if (this.mode === 'SignUp') {
        // Token provided: enable direct registration
        if (this.invitationRequired) {
          this.signupOptions.header = 'Register for Beta version'
          this.signupOptions.fields[0].type = 'text'
        } else {
          this.signupOptions.header = 'Register'
          this.signupOptions.fields[0].type = 'hidden'
        }
        this.signupOptions.fields[2].type = 'password'
        
        // Note: fields (in order) are: promo/token, email, password
        this.$myConsole.debug('include password in form')
        this.signupOptions.fields[0].value = hold
        this.signupOptions.submitButton = 'Register'
      }
    }    
  },
  watch: {
    mode: function () {
      this.$myConsole.debug('reset mode to ' + this.mode)
    },
    hasToken: function () {
      this.$myConsole.debug('token specified...')
      if (this.hasToken) {
        this.changeToRegister()
      } else {
        this.changeToRequest()
      }
    }
  }
}
</script>

<style>
.error {
  font-weight: bold;
}
</style>