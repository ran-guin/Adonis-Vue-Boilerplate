<template lang='pug'>
  div.centred(style='background-color: white')
    rgv-form.recover-form(:form='form' :options='recoverOptions' :remoteErrors='formErrors' :onCancel='cancel')
    hr
    a.text-sm(v-if='onLogin' @click='onLogin') I already have an account
    br
    a.text-sm(v-if='onRegister' @click='onRegister') Register for account
    p.error(v-if='authError')
      span {{authError}}
  </template>

<script>
import Config from '@/config.js'

import FormValidator from '@/default/mixins/FormValidator'
import Login from '@/default/mixins/Login'

export default {
  components: {
  },
  mixins: [
    Login,
    FormValidator
  ],
  data () {
    return {
      form: {
        email: ''
      },
      inviteToken: '',
      recoverOptions: {
        access: 'append',
        fields: [
          { name: 'email', type: 'email', prompt: 'Email Address', rules: [Config.rules.email], icon: 'email' }
        ],
        submitButtonClass: 'btn-primary btn-lg',
        submitButton: 'Send Password Recovery Link',
        // buttonType: 'submit',
        header: 'Recover Password',
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
    }
  },
  created: function () {
    if (this.onRegister) {
        this.$myConsole.debug('onRegister supplied')
    }
    if (this.onLogin) {
        this.$myConsole.debug('onLogin supplied')
    }
    this.redirect_uri = this.$route.query.redirect || this.$route.query.redirect_uri || this.redirect

    this.$myConsole.debug('Rules: ' + JSON.stringify(this.rules))
    this.$myConsole.debug('Recover options: ' + JSON.stringify(this.recoverOptions))
    this.$set(this.recoverOptions, 'onSubmit', this.recoverPassword)
    this.$set(this.recoverOptions, 'onBlur', this.checkInput)
    this.$set(this.recoverOptions, 'onFocus', this.inputFocus)
    this.$set(this.recoverOptions, 'onCancel', this.cancel)

    var presets = ['email']
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
