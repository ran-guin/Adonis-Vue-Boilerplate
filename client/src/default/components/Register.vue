<template lang='pug'>
  div.centred(style='background-color: white')
    h6.text-danger.padded(v-if="$route.params.error || $route.query.error") {{$route.params.error || $route.query.error}} 
    h6.text-warning.padded(v-if="$route.params.warning || $route.query.warning") {{$route.params.warning || $route.query.warning}} 
    h6.text-success.padded(v-if="$route.params.message || $route.query.message") {{$route.params.message || $route.query.message}}

    rgv-form.signup-form(:form='form' :options='signupOptions' :remoteErrors='formErrors' :onCancel='cancel')
    hr
    a.text-sm(v-if='onLogin' @click='onLogin') I already have an account
    br
    a.text-sm(v-if='onRecover' @click='onRecover') Forgot password ?

    p.error(v-if='authError')
      span {{authError}}
  </template>

<script>
import Config from '@/config.js'
import Shared from '@/config.shared.js'

import FormValidator from '@/default/mixins/FormValidator'
import Login from '@/default/mixins/Login'

const loginType = {
  request: {
    // invitation required + no token
    prompt: 'Request access for Beta',
    button: 'Register for Beta Access',
    token: 'text',
    name: 'hidden',
    password: 'hidden',
    header: 'Request access for Beta Version'
  },
  guest: {
    // invitation required + no token
    prompt: 'Register as Guest',
    button: 'Register as Guest',
    token: 'text',
    name: 'text',
    password: 'password',
    header: 'Register as Guest'
  },
  token: {
    // token supplied
    prompt: 'Register by Invitation',
    button: 'Register',
    token: 'text',
    name: 'text',
    password: 'password',
    header: 'Register by Invitation'
  },
  default: {
    // no invitation required
    prompt: 'Register',
    button: 'Register',
    token: 'hidden',
    name: 'text',
    password: 'password',
    header: 'Register'
  }
}

export default {
  components: {
  },
  mixins: [
    Login,
    FormValidator
  ],
  data () {
    return {
      registration: Shared.registration || {},
      form: {
        email: ''
      },
      inviteToken: '',
      signupOptions: {
        access: 'append',
        fields: [
          { name: 'token', type: 'text', prompt: 'Promo Code', placeholder: 'leave blank to request beta access', icon: 'redeem'},
          { name: 'username', type: 'text', prompt: 'Preferred Username (optional)', rules: [Config.rules.email], icon: 'person' },
          { name: 'email', type: 'email', prompt: 'Email Address', rules: [Config.rules.email], icon: 'email' },
          { name: 'password', type: 'hidden', prompt: 'Password', rules: [Config.rules.min(8)], icon: 'lock'},
          { name: 'confirm_password', type: 'hidden', prompt: 'Confirm Password', rules: [Config.rules.min(8)], icon: 'lock'}
        ],
        submitButtonClass: 'btn-primary btn-lg',
        submitButton: 'Request Beta Access',
        header: 'Request access to Beta version',
        title: ''
      },
      config: Config,
      apiURL: Config.apiURL[process.env.NODE_ENV],
      message: '',
      warning: '',
      error: '',
      rules: Config.rules,
      authError: '',
      formErrors: {},
      redirect_uri: ''
    }
  },
  props: {
    onLogin: {
        type: Function
    },
    onRecover: {
        type: Function
    },
    onCancel: {
      type: Function
    },

    invitationToken: {
      type: String
    },
    redirect: {
      type: String
    }
  },
  async created () {

    if (this.onRecover) {
        this.$myConsole.debug('onRecover supplied')
    }
    if (this.onLogin) {
        this.$myConsole.debug('onLogin supplied')
    } else {
        this.$myConsole.debug('onLogin NOT (?) supplied')
    }

    this.redirect_uri = this.$route.query.redirect || this.$route.query.redirect_uri || this.redirect

    this.$myConsole.debug('Rules: ' + JSON.stringify(this.rules))
    this.$myConsole.debug('Signup options: ' + JSON.stringify(this.signupOptions))
    this.$set(this.signupOptions, 'onSubmit', this.signup)
    this.$set(this.signupOptions, 'onBlur', this.checkInput)
    this.$set(this.signupOptions, 'onFocus', this.inputFocus)
    this.$set(this.signupOptions, 'onCancel', this.cancel)

    if (!this.registration.requires_invite) {
      this.form.token = 'publicaccess' // promos should include this string as well to bypass invitation process...
    }
    this.updateForm()

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

    this.env = await this.loadEnv()
  },
  computed: {
    hasToken: function () {
      return this.form.token ? true : false
    }
  },
  methods: {
    clearLocalMessages: function () {
      this.message = ''
      this.warning = ''
      this.error = ''
      this.authError = ''
      this.formErrors = {}
      this.$myConsole.debug('cleared local messages...')
      this.$store.dispatch('clearMessages')
    },
    initializeOptions: function (reset) {
      if (this.inviteToken) {
        this.$myConsole.debug('hide invitation token field')
        this.signupOptions.fields[0].value = this.inviteToken
      }

      this.clearLocalMessages()
      this.$myConsole.debug('signup options: ')
      this.$myConsole.debug(JSON.stringify(this.signupOptions))
      if (this.env) {
        if (process.env.NODE_ENV !== 'production') {
          this.signupOptions.header += ' (' + process.env.NODE_ENV + ' only)'
          // this.signupOptions.fields[0].prompt += ' - (' + process.env.NODE_ENV + ' mode)'
          // this.signupOptions.header = this.signupOptions.header
          this.signupOptions.preForm = '(valid for today only)'
        }
      }
      if (reset) { this.clearLocalMessages() }
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
        const newToken = e.target.value // form reset on field change below so keep track of value
        this.$myConsole.debug('reset: ' + e.target.name + ' = ' + e.target.value)

        this.updateForm(newToken)

        // Adjust form options for invites vs beta request
        // if (this.mode === 'SignUp' && e.target.value) {
        //   this.changeToRegister(hold)
        // } else {
        //   this.changeToRequest(hold)
        // }
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
      if (this.onCancel) {
        this.onCancel()
      }
    },
    // changeToRequest: function (hold) {
    //   console.log('change to request for ' + this.mode)
    //   // No token provided: enable request for access

    //   if (this.registration.for_guest) {
    //       setup = loginType.guest
    //   // Note; fields (in order) are: promo/token, email, password
    //   this.$myConsole.debug('exclude password from form')
    //   this.signupOptions.fields[0].value = hold
    //   this.signupOptions.fields[0].type = loginType.request.token
    //   this.signupOptions.fields[3].type = loginType.request.password
    //   this.signupOptions.header = loginType.request.header
    //   this.signupOptions.submitButton = loginType.request.button

    // },
    updateForm: function (token) {
      console.log('change to registration for ' + this.mode)
      // Token provided: enable direct registration

      var setup = loginType.default || {}
      if (this.registration.requires_invite) {
        if (this.form.token) {
          setup = loginType.token
        } else if (this.registration.for_guest) {
          setup = loginType.guest
        } else {
          setup = loginType.request
        }
      }
      
      this.signupOptions.header = setup.header
      this.signupOptions.fields[0].type = setup.token
      this.signupOptions.fields[3].type = setup.password
      this.signupOptions.submitButton = setup.button

      if (this.registration.with_name) {
        this.signupOptions.fields[1].type = setup.name
      } else {
        this.signupOptions.field[1].type = 'hidden'
      }

      if (token) { this.signupOptions.fields[0].value = token }
    }    
  },
  watch: {
    hasToken: function () {
      this.$myConsole.debug('token specified...')
      this.updateForm()

      // if (this.hasToken) {
      //   this.changeToRegister()
      // } else {
      //   this.changeToRequest()
      // }
    }
  }
}
</script>

<style>
.error {
  font-weight: bold;
}
</style>
