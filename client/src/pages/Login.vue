<template lang='pug'>
 div.fullscreen
    PageLayout(:noRefresh=noRefresh :noMobileHeader='noMobileHeader' :noLogin='noLogin')
      div.myContainer(style='height: 100%')
        Messaging(:msg='message' :warn='warning' :err='error' :clear='clearLocalMessages')
        p &nbsp;
        div(v-if="mode==='Login'")
          div.centred
            div.smallBox.darkShadow(style='background-color: white')
              VForm.login-form(:form='form' :options='loginOptions' :remoteErrors='formErrors')
              router-link(to='/Recover') Forgot Password ?
              p.error(v-if='authError') {{authError}}
              //- p(v-if='env.codeVersion && !env.codeVersion.match(/prod/)') &nbsp;
              //-   span(style='float:right') v{{env.codeVersion}}
        div(v-else-if="mode==='SignUp'")          <!-- explicit registration page -->
          div.centred
            div.smallBox.darkShadow(style='background-color: white')
              VForm.signup-form(:form='form' :options='signupOptions' :remoteErrors='formErrors')
              p.error(v-if='authError')
                span {{authError}}
              //- p(v-if='env.codeVersion && !env.codeVersion.match(/prod/)') &nbsp;
              //-   span(style='float:right') v{{env.codeVersion}}
        div(v-else-if="mode==='Recover'")
          div.centred
            div.smallBox.darkShadow(style='background-color: white')
              VForm.recover-form(:form='form' :options='recoverOptions' :remoteErrors='formErrors')
              p.error(v-if='authError')
                span {{authError}}
        div(v-else-if="mode==='Construction'")
          Modal.signup-modal(type='record' id='construction-modal' title='Under Construction' :options='constructionOptions')
        div(v-else)
          span.wasSmallScreen
            Modal(type='record' :sub_options='loginOptions')
            br
            Modal(type='record' :sub_options='signupOptions')
            p.error(v-if='authError')
              span {{authError}}
        //- Modal.wideScreen.login-signup(type='record' :id='myId' :error='authError' :options='myOptions' :note='note' :remoteErrors='formErrors')
        p &nbsp;

</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import Messaging from '@/components/Standard/Messaging'
import VForm from '@/components/Standard/Vuetify/VForm'
import Modal from '@/components/Standard/Modal'
import Config from '@/config.js'
import axios from 'axios'
import auth from '@/auth'

import FormValidator from '@/components/Standard/mixins/FormValidator'

export default {
  components: {
    Messaging,
    PageLayout,
    VForm,
    Modal
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

    this.redirect_uri = this.$route.query.redirect || this.$route.query.redirect_uri || this.redirect_default
    this.inviteToken = this.invitationToken || this.$route.params.token || this.$route.query.token
    console.log('token supplied ? ' + this.$route.params.token + ' = ' + this.inviteToken)

    console.log('url query ?: ' + JSON.stringify(this.$route.query))
    console.log('url params ?: ' + JSON.stringify(this.$route.params))

    console.log('Rules: ' + JSON.stringify(this.rules))
    console.log('apiURL' + process.env.NODE_ENV + ' -> ' + this.apiURL)

    console.log('Login options: ' + JSON.stringify(this.loginOptions))
    this.$set(this.loginOptions, 'onSubmit', this.login)
    this.$set(this.loginOptions, 'onBlur', this.checkInput)
    this.$set(this.loginOptions, 'onFocus', this.inputFocus)
    this.$set(this.loginOptions, 'onCancel', this.cancel)

    console.log('initialized login options...')

    console.log('Signup options: ' + JSON.stringify(this.signupOptions))
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
    console.log('Recovery options: ' + JSON.stringify(this.recoverOptions))
    this.$set(this.recoverOptions, 'onSubmit', this.recoverPassword)
    this.$set(this.recoverOptions, 'onFocus', this.inputFocus)
    this.$set(this.recoverOptions, 'onCancel', this.cancel)
    console.log('Connection: ' + JSON.stringify(this.request))
    this.$store.dispatch('AUTH_LOGOUT')

    var path = this.$route.path.match(/\/?(\w+)/)

    var presets = ['email', 'token']
    for (var i = 0; i < presets.length; i++) {
      var val = this.$route.params[presets[i]] || this.$route.query[presets[i]]
      if (val) { this.form[presets[i]] = val }
    }
    // var email = this.$route.params.email || this.$route.query.email
    // if (email) { 
    //   console.log('*** preset email: ' + email)
    //   this.form.email = email
    // }

    if (this.page) {
      this.mode = this.page
      console.log('Mode: ' + this.mode)
    } else if (this.$route.query.mode || this.$route.params.mode) {
      this.mode = this.$route.query.mode || this.$route.params.mode
      console.log('input mode: ' + this.mode)
    } else if (!this.mode && path) {
      console.log('default mode to path: ' + path[1])
      this.mode = path[1]
    } else {
      console.log('Default mode to Login')
      this.mode = 'Login'
    }

    this.$store.dispatch('clearMessages')
    console.log('*** get url messages/warnings...')
    this.message = this.$route.query.message
    this.warning = this.$route.query.warning
    this.error = this.$route.query.error

    console.log('url message: ' + this.message)

    const delayed_redirect = this.$route.params.delayed_redirect || this.$route.query.delayed_redirect
    if (delayed_redirect) {
      console.log('redirecting to ' + delayed_redirect)
      this.delayedRedirect(this.message, 'message', delayed_redirect)
    }

    console.log('Route Path: ' + JSON.stringify(path) + '; Mode: ' + this.mode)
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
        console.log('opt = ' + JSON.stringify(this.loginOptions))
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
    loadEnv () {
      var _this = this
      console.log('env: ' + process.env.NODE_ENV)
      console.log(JSON.stringify(Config.apiURL))
      console.log('axios: get env from ' + this.apiURL)
      axios.get(this.apiURL + '/env')
        .then(function (response) {
          if (response.data && response.data.codeVersion) {
            console.log('*** env: ')
            console.log(JSON.stringify(response.data))
            _this.env = response.data
            _this.initializeOptions()
          } else {
            console.log('*** no env detected: ' + JSON.stringify(response))
          }
        })
        .catch(function (err) {
          console.log('Error retrieving env: ' + err)
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
      console.log('cleared local messages...')
      this.$store.dispatch('clearMessages')
    },
    setToLogin: function (reset) {
      this.mode = 'Login'
      this.clearLocalMessages()
      this.adjustForEnv()
      console.log('set login options: ')
      console.log(JSON.stringify(this.loginOptions))
      if (reset) { this.clearLocalMessages() }
    },
    setToSignup: function (reset) {
      this.mode = 'SignUp'
      this.clearLocalMessages()
      this.adjustForEnv()
      console.log('signup options: ')
      console.log(JSON.stringify(this.signupOptions))
      if (reset) { this.clearLocalMessages() }
    },
    setToRecover: function (reset) {
      this.clearLocalMessages()
      this.adjustForEnv()
      this.mode = 'Recover'
      console.log('set recover options: ')
      console.log(JSON.stringify(this.recoverOptions))
      if (reset) { this.clearLocalMessages() }
    },
    initializeOptions: function () {
      if (this.inviteToken) {
        console.log('hide invitation token field')
        this.signupOptions.fields[0].value = this.inviteToken
      }

      if (this.mode === 'Recover') {
        this.setToRecover()
      } else if (this.mode === 'Login') {
        this.setToLogin()
      } else if (this.mode === 'SignUp') {
        this.setToSignup()
      } else {
        console.log('unrecognized mode: ' + this.mode)
        this.myOptions = {}
        this.adjustForEnv()
      }
    },
    adjustForEnv: function () {
      if (this.env) {
        if (process.env.NODE_ENV !== 'production') {
          if (this.mode === 'Login') {
            this.loginOptions.fields[0].prompt += ' - try  guest@' + this.defaultDomain
            this.loginOptions.fields[1].prompt += ' - use \'demoPassword\' for guest access'
          } else if (this.mode === 'SignUp') {
            this.signupOptions.fields[1].prompt += ' - (' + process.env.NODE_ENV + ' mode)'
            this.signupOptions.header = this.signupOptions.header + '(this will enable login for the remainder of the day)'
            this.signupOptions.fields[2].prompt += ' - (valid for today only)'        
          }
          console.log('adjusted options: ' + JSON.stringify(this.loginOptions))
          console.log('adjust titles for ' + process.env.NODE_ENV + ' : ' + this.env.codeVersion + ' / ' + this.env.db)
        }
      } else {
        console.log('no env')
      }
    },
    async login (form) {
      var credentials = {
        email: form.email,
        password: form.password
      }
      console.log('login ' + form.email)
      try {
        delete axios.defaults.headers.common['Authorization']
        var response = await auth.login(this, credentials)
        if (response && response.expired) {
          this.$store.dispatch('logWarning', 'Session Expired.  Please log in again.')
        }
        console.log('Login response:' + JSON.stringify(response))
      } catch (err) {
        console.log('caught login error: ' + err)
        if (err === 'Network Error') {
          this.$store.dispatch('logError', 'Connection temporarily unavailable...')
        }
        this.$store.dispatch('logError', 'Error encountered during log in ... Please try again')
      }
      return this.initializeSession(response)
    },
    async logout () {
      var loginId = this.payload.login_id
      console.log('logout via auth...')
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

      console.log('Signing up with credentials: ')
      // this.$store.dispatch('logMessage', 'Submitting registration request...')
      try {
        var response = await auth.signup(this, credentials)
        console.log('SignUp call:' + JSON.stringify(response))

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
          console.log('redirect ? ' + this.redirect_uri)
          if (this.redirect_uri) {
            console.log('** redirecting to ' + this.redirect_uri)
            this.delayedRedirect('Submitting registration request', 'message', this.redirect_uri)
          } else {
            console.log('no redirect..')
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
      console.log('Form: ' + JSON.stringify(form))
      const email = form.email
      console.log('recover my password via ' + this.apiURL + '/recoverPassword ... for ' + email)
      var _this = this
      axios.post(this.apiURL + '/recoverPassword', {email: email})
        .then(function (response) {
          if (response && response.data && response.data.validation_errors) {
            console.log('get service response')
            var val = _this.validateResponse(response)
            if (val.formErrors) { _this.$set(_this, 'formErrors', val.formErrors) }
            return response.data
          } else if (response && response.error) {
            _this.$store.dispatch('logError', response.error)
            return response
          } else if (response && response.data) {
            console.log('recover response: ' + JSON.stringify(response))
            _this.setToLogin(1)

            _this.delayedRedirect('Password recovery link sent to \'' + email + '\' (if account exists)')
            return response
          }
      })
      .catch(function (err) {
        _this.error = 'Problem generating recovery mail (?)  Please contact us directly.'
        console.log('Error Generating Password Recovery ' + err)
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
      // console.log('initialize session for ' + response)
      if (response && response.data && response.data.validation_errors) {
        console.log('get service response')
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
            console.log('token cached: ' + response.data.token)
            console.log('refresh token: ' + refreshToken)
            this.$store.dispatch('AUTH_TOKEN', {token: response.data.token, refreshToken: refreshToken})

            var pass = 'Bearer ' + response.data.token
            axios.defaults.headers.common['Authorization'] = pass
            // auth.updateToken()
            console.log('updated token...')
          }
          if (onSuccess) { alert(onSuccess) }
          if (this.redirect_uri) {
            console.log('** reroute to ' + this.redirect_uri)
            window.location = this.redirect_uri
          } else {
            this.$router.push('/Home?message=' + onSuccess)
          }
          if (onSuccess) {
            console.log('dispatch log message: ' + onSuccess)
            this.$store.dispatch('logMessage', onSuccess)
          }
          if (response.data.payload) {
            console.log('initialized payload: ' + JSON.stringify(response.data.payload))
            this.$store.dispatch('CACHE_PAYLOAD', response.data.payload)
            this.$router.push('/Home')
            // this.$set(this, 'payload', response.data.payload) this should be redundant (?)
          }
          return { success: true }
        } else if (response.data.message) {
          console.log('log message error: ' + response.data.message)
          this.$set(this, 'authError','Sorry - Authorization Failed')
          return { error: response.data.message }
        } else if (response.data.error) {
          console.log('log error: ' + response.data.error)
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
      console.log('validate input')
      if (e && e.target) {
        const parent = e.target.parentElement
        parent.classList.add('has-error')
        this.note = 'Failed Validation'
      }
    },
    onChange (e) {
      console.log('on change')
      if (e && e.target) {
        console.log('val: ' + e.target.name + ' = ' + e.target.value)
      }
    },
    onKeyup (e) {
      console.log('on change')
      if (e && e.target) {
        console.log('val: ' + e.target.name + ' = ' + e.target.value)
      }

      if (e && e.target && e.target.name === 'token') {
        const hold = e.target.value // form reset on field change below so keep track of value
        console.log('reset: ' + e.target.name + ' = ' + e.target.value)

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
        console.log('checkinput')
      } else {
        console.log('no e-target to focus on')
      }
    },
    inputValidate (e) {
      this.note = ''
      if (e && e.target) {
        const parent = e.target.parentElement
        parent.classList.add('has-success')
        console.log('validated')
      } else {
        console.log('no e-target to validate')
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
      console.log('cancel this form')
      this.authError = ''
      this.mode = 'Login'
      this.$router.push('/Home')
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
        console.log('exclude password from form')
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
        console.log('include password in form')
        this.signupOptions.fields[0].value = hold
        this.signupOptions.submitButton = 'Register'
      }
    }    
  },
  watch: {
    mode: function () {
      console.log('reset mode to ' + this.mode)
    },
    hasToken: function () {
      console.log('token specified...')
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
