<template lang='pug'>
  div.centred(style='background-color: white')
    rgv-form.signup-form(:form='form' :options='signupOptions' :remoteErrors='formErrors')
    p.error(v-if='authError')
      span {{authError}}
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
      form: {
        email: ''
      },
      inviteToken: '',
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
      config: Config,
      apiURL: Config.apiURL[process.env.NODE_ENV],
      message: '',
      warning: '',
      error: '',
      rules: Config.rules,
      invitationRequired: Config.invitationRequired || false,
      authError: '',
      formErrors: {}
    }
  },
  props: {
    invitationToken: {
      type: String
    }
  },
  created: function () {
    this.$myConsole.debug('Rules: ' + JSON.stringify(this.rules))
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

    var presets = ['email', 'token']
    for (var i = 0; i < presets.length; i++) {
      var val = this.$route.params[presets[i]] || this.$route.query[presets[i]]
      if (val) { this.form[presets[i]] = val }
    }

    this.$store.dispatch('clearMessages')
    this.$myConsole.debug('*** get url messages/warnings...')
    this.message = this.$route.query.message
    this.warning = this.$route.query.warning
    this.error = this.$route.query.error

    this.loadEnv()
  },
  computed: {
    hasToken: function () {
      return this.form.token ? true : false
    }
  },
  methods: {
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
          // _this.delayedRedirect('Problem connecting to server.  Please try again later.', 'error')
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
    initializeOptions: function () {
      if (this.inviteToken) {
        this.$myConsole.debug('hide invitation token field')
        this.signupOptions.fields[0].value = this.inviteToken
      }

      this.setToSignup()
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
        this.note = 'Failed Input Validation'
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
    cancel: function () {
      this.$set(this, 'formErrors', {})
      this.$myConsole.debug('cancel this form')
      this.authError = ''
      this.mode = 'Login'
      this.$router.push('/Dashboard')
      // this.$router.go(-1)
      this.$store.dispatch('toggleModal', this.myId)
    },
    changeToRequest: function (hold) {
      console.log('change to request for ' + this.mode)
      // No token provided: enable request for access

      // Note; fields (in order) are: promo/token, email, password
      this.$myConsole.debug('exclude password from form')
      this.signupOptions.fields[0].value = hold
      this.signupOptions.fields[2].type = 'hidden'
      this.signupOptions.header = 'Request access to Beta version'
      this.signupOptions.submitButton = 'Request Beta Access'
    },
    changeToRegister: function (hold) {
      console.log('change to registration for ' + this.mode)
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
