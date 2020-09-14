<template lang='pug'>
  div.centred(style='background-color: white')
    EmbeddedMessage(:clear='clearOnToggle')

    h6.text-danger(v-if="$route.params.error || $route.query.error") {{$route.params.error || $route.query.error}} 
    h6.text-warning(v-if="$route.params.warning || $route.query.warning") {{$route.params.warning || $route.query.warning}} 
    h6.text-success(v-if="$route.params.message || $route.query.message") {{$route.params.message || $route.query.message}}

    rgv-form.Reset-form(:form='form' :options='resetOptions' :remoteErrors='formErrors' :onCancel='cancel')
    hr
    a.text-sm(v-if='onLogin' @click='onLogin') I already have an account
    br
    a.text-sm(v-if='onRegister' @click='onRegister') Register for account
    p.error(v-if='authError')
      span {{authError}}
  </template>

<script>
import Config from '@/config.js'
import EmbeddedMessage from '@/default/components/EmbeddedMessage'

import FormValidator from '@/default/mixins/FormValidator'
import Login from '@/default/mixins/Login'

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
      form: {
        email: '',
        token: ''
      },
      inviteToken: '',
      resetOptions: {
        access: 'append',
        fields: [
          { name: 'email', type: 'text', prompt: 'Email Address', rules: [Config.rules.email], icon: 'email' },
          { name: 'password', type: 'password', prompt: 'Password', rules: [Config.rules.min(8)], icon: 'lock'},
          { name: 'confirmPassword', type: 'password', prompt: 'Confirm Password', rules: [Config.rules.min(8)], icon: 'lock'},
          { name: 'token', type: 'text', prompt: 'Token', icon: 'lock' },
        ],
        submitButtonClass: 'btn-primary btn-lg',
        submitButton: 'Reset My Password',
        // buttonType: 'submit',
        header: 'Reset Password',
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
      formErrors: {},
      redirect_uri: ''
    }
  },
  props: {
    onRegister: {
        type: Function
    },
    onLogin: {
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
  created: function () {
    var email = this.$route.params.email || this.$route.query.email
    var token = this.$route.params.token || this.$route.query.token

    // this.$set(this.resetOptions.fields[0], 'value', email)
    this.$set(this.form, 'email', email)
    this.$set(this.form, 'token', token)

    console.log('using email: ' + email)
    if (this.onRegister) {
        this.$myConsole.debug('onRegister supplied')
    }
    if (this.onLogin) {
        this.$myConsole.debug('onLogin supplied')
    }
    this.redirect_uri = this.$route.query.redirect || this.$route.query.redirect_uri || this.redirect

    this.$myConsole.debug('Rules: ' + JSON.stringify(this.rules))
    this.$myConsole.debug('Reset options: ' + JSON.stringify(this.resetOptions))
    this.$set(this.resetOptions, 'onSubmit', this.resetPassword)
    this.$set(this.resetOptions, 'onBlur', this.checkInput)
    this.$set(this.resetOptions, 'onFocus', this.inputFocus)
    this.$set(this.resetOptions, 'onCancel', this.cancel)

    var presets = ['email']
    for (var i = 0; i < presets.length; i++) {
      var val = this.$route.params[presets[i]] || this.$route.query[presets[i]]
      if (val) {  this.form.$set(this.form, presets[i], val) }
    }

    this.$store.dispatch('clearMessages')
    this.$myConsole.debug('*** get url messages/warnings...')
    this.message = this.$route.query.message
    this.warning = this.$route.query.warning
    this.error = this.$route.query.error

    this.loadEnv()
  },
  computed: {
  },
  methods: {
    comparePasswords () {
      this.$myConsole.debug('compare passwords...')
      if (this.confirmPassword) {
        if (this.form.confirmPassword === this.form.password) {
          this.signupOptions.fields[2].icon = 'check_circle'
        } else {
          this.signupOptions.fields[2].icon = 'close'
        }
      }
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
    }
  },
  watch: {
  }
}
</script>

<style>
.error {
  font-weight: bold;
}
</style>
