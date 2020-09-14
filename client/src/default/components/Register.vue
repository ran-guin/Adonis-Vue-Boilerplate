<template lang='pug'>
  div.centred(style='background-color: white')
    EmbeddedMessage(:clear='clearOnToggle')

    rgv-form.signup-form(:form='registrationForm' :options='signupOptions' :remoteErrors='formErrors' :onCancel='cancel')
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
import EmbeddedMessage from '@/default/components/EmbeddedMessage'

import FormValidator from '@/default/mixins/FormValidator'
import Login from '@/default/mixins/Login'

const loginType = {
  request: {
    // invitation required + no token
    prompt: 'Request access for Beta',
    button: 'Register for Beta Access',
    token: 'text',
    named: 'hidden',
    password: 'hidden',
    header: 'Request access for Beta Version'
  },
  guest: {
    // invitation required + no token
    prompt: 'Register as Guest',
    button: 'Register as Guest',
    token: 'text',
    named: 'text',
    password: 'password',
    header: 'Register as Guest'
  },
  token: {
    // token supplied
    prompt: 'Register by Invitation',
    button: 'Register',
    token: 'text',
    named: 'text',
    password: 'password',
    header: 'Register by Invitation'
  },
  default: {
    // no invitation required
    prompt: 'Register',
    button: 'Register',
    token: 'hidden',
    named: 'text',
    password: 'password',
    header: 'Register'
  }
}

export default {
  components: {
    EmbeddedMessage
  },
  mixins: [
    Login,
    FormValidator
  ],
  data () {
    return {
      registration: Shared.registration || {},
      confirmPassword: true,
      passwordsConfirmed: false,
      registrationForm: {
        email: ''
      },
      inviteToken: '',
      signupOptions: {
        access: 'append',
        fields: [
          { name: 'token', type: 'text', prompt: 'Promo Code', placeholder: 'leave blank to request beta access', icon: 'redeem'},
          { name: 'username', type: 'text', prompt: 'Preferred Username (optional)', icon: 'person' },
          { name: 'email', type: 'email', prompt: 'Email Address', rules: [Config.rules.email], icon: 'email' },
          { name: 'password', type: 'hidden', prompt: 'Password', rules: [Config.rules.min(8)], icon: 'lock'},
          { name: 'confirmPassword', type: 'hidden', prompt: 'Confirm Password', rules: [Config.rules.min(8)], icon: 'lock'}
        ],
        submitButtonClass: 'btn-primary btn-lg',
        submitButton: 'Request Beta access',
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
    },
    clearOnToggle: {
      type: Boolean
    }
  },
  created () {

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

    if (this.redirect_uri) {
      this.signupOptions.fields.push( { name: 'redirect_uri', type: 'hidden', value: this.redirect_uri } )
      this.setRedirect(this.redirect_uri)
    }          

    if (!this.registration.requires_invite) {
      this.$set(this.registrationForm, 'token', 'publicaccess') // promos should include this string as well to bypass invitation process...
    }
    this.updateForm()

    this.$store.dispatch('clearMessages')
    this.$myConsole.debug('*** get url messages/warnings...')
    this.message = this.$route.query.message
    this.warning = this.$route.query.warning
    this.error = this.$route.query.error
  },
  async updated () {
    // running after DOM is loaded over-rides auto-complete of email / password
    this.env = await this.loadEnv()

    var presets = ['email', 'password', 'token']
    for (var i = 0; i < presets.length; i++) {
      var val = this.$route.params[presets[i]] || this.$route.query[presets[i]] || ''
      this.$set(this.registrationForm, presets[i], val)
    }
  },
  computed: {
    hasToken: function () {
      return this.registrationForm.token ? true : false
    }
  },
  methods: {
    clearLocalMessages: function () {
      this.message = ''
      this.warning = ''
      this.error = ''
      this.authError = ''
      this.registrationFormErrors = {}
      this.$myConsole.debug('cleared local messages...')
      this.$store.dispatch('clearMessages')
    },
    initializeOptions: function (reset) {
      if (this.inviteToken) {
        this.$myConsole.debug('hide invitation token field')
        this.$set(this.signupOptions.fields[0], 'value', this.inviteToken)
      }

      if (this.confirmPassword) {
        this.$set(this.signupOptions.fields[4], 'onKeyup', this.comparePasswords)
      }

      if (this.env) {
        if (process.env.NODE_ENV !== 'production') {
          this.$set(this.signupOptions, 'header', this.signupOptions.header + ' (' + process.env.NODE_ENV + ' only)')
          this.$set(this.signupOptions, 'preForm', '(valid for today only)')
        }
      }

      this.$myConsole.debug('signup options: ')
      this.$myConsole.debug(JSON.stringify(this.signupOptions))

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
      }
    },
    comparePasswords () {
      this.$myConsole.debug('compare passwords...')
      if (this.confirmPassword) {
        if (this.registrationForm.confirmPassword === this.registrationForm.password) {
          this.$set(this.signupOptions.fields[4], 'icon', 'check_circle')
        } else {
          this.$set(this.signupOptions.fields[4], 'icon', 'close')
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
      if (this.onCancel) {
        this.onCancel()
      }
    },
    updateForm: function (token) {
      console.log('generate registration form')
      // Token provided: enable direct registration

      this.initializeOptions()

      var setup = loginType.default || {}
      if (this.registration.requires_invite) {
        if (this.registrationForm.token) {
          setup = loginType.token
        } else if (this.registration.for_guest) {
          setup = loginType.guest
        } else {
          setup = loginType.request
        }
      }
      
      this.signupOptions.header = setup.header
      this.$set(this.signupOptions.fields[0], 'type', setup.token)
      this.$set(this.signupOptions.fields[3], 'type', setup.password)

      if (this.confirmPassword) {
        this.$set(this.signupOptions.fields[4], 'type', setup.password)
      } else {
         this.$set(this.registrationForm, 'noConfirm', true)
      }
      
      this.$set(this.signupOptions, 'submitButton', setup.button)

      if (this.registration.with_name) {
        this.$set(this.signupOptions.fields[1], 'type', setup.named)
      } else {
        this.$set(this.signupOptions.field[1], 'type', 'hidden')
      }

      if (token) { this.$set(this.signupOptions.fields[0], 'value',  token) }
    },
    clearMessages() {
        this.clearOnToggle = !this.clearOnToggle
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
    },
    registrationForm: function () {
      console.log('form changed to ' + JSON.stringify(this.registrationForm))
    }
  }
}
</script>

<style>
.error {
  font-weight: bold;
}
</style>
