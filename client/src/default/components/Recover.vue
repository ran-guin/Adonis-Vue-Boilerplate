<template lang='pug'>
  div.centred(style='background-color: white')
    EmbeddedMessage(:clear='clearOnToggle')

    h6.text-danger.padded(v-if="$route.params.error || $route.query.error") {{$route.params.error || $route.query.error}} 
    h6.text-warning.padded(v-if="$route.params.warning || $route.query.warning") {{$route.params.warning || $route.query.warning}} 
    h6.text-success.padded(v-if="$route.params.message || $route.query.message") {{$route.params.message || $route.query.message}}
    
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
import EmbeddedMessage from '@/default/components/EmbeddedMessage'
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
    if (this.onRegister) {
        this.$myConsole.debug('onRegister supplied')
    }
    if (this.onLogin) {
        this.$myConsole.debug('onLogin supplied')
    }
    this.redirect_uri = this.$route.query.redirect || this.$route.query.redirect_uri || this.redirect

    this.$myConsole.debug('Rules: ' + JSON.stringify(this.rules))
    this.$myConsole.debug('Recover options: ' + JSON.stringify(this.recoverOptions))

    this.$set(this.recoverOptions, 'onSubmit', this.recover)
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

    this.loadEnv()
  },
  computed: {
  },
  methods: {
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
    recover: function (form) {
      this.recoverPassword(form) // mixin
      this.cancel()
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

.padded {
  padding: 2rem;
}

</style>
