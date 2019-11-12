<template lang='pug'>
  div
    div(v-if='!payload.userid')
      div(v-if="$route.path==='/Login'")
        div.smallScreen
          h3 Login
          rgv-form.login-form(:options='loginOptions' :onSave='login' :remoteErrors='formErrors' :onCancel='back')
          p &nbsp;
          p.error(v-if='authError') {{authError}}
        div.wideScreen
          rgv-modal.login-modal(type='record' id='login-modal' :error='authError' :title='loginTitle' :options='loginOptions' :note='note' :remoteErrors='formErrors')
          span &nbsp; &nbsp;
          rgv-modal.signup-modal(type='record' id='register-modal' :error='authError' :title='regTitle' :options='registerOptions' :note='note' :remoteErrors='formErrors')
            p &nbsp;
      div(v-else-if="$route.path==='/SignUp'")
        div.smallScreen
          h3 Register
          rgv-form.signup-form(:options='registerOptions' :onSave='register' :onCancel='back')
          p &nbsp;
          p.error(v-if='authError') {{authError}}
        div.wideScreen
          rgv-modal.login-modal(type='record' id='login-modal' :error='authError' :title='loginTitle' :options='loginOptions' :note='note' :remoteErrors='formErrors')
          span &nbsp; &nbsp;
          rgv-modal.signup-modal(type='record' id='register-modal' :error='authError' :title='regTitle' :options='registerOptions' :note='note' :remoteErrors='formErrors')
            p &nbsp;
      div(v-else-if="$route.path==='Construction'")
        rgv-modal.signup-modal(type='record' id='construction-modal' title='Under Construction' :options='constructionOptions')
      div(v-else)
        <!-- Default if not explicitly set to login or register page -->
        span.smallScreen
          button.login-button.btn.btn-primary.btn-lg(v-on:click="$router.push('/Login')") Login
          br
          button.signup-button.btn.btn-primary.btn-lg(v-on:click="$router.push('/Register')") Register
          br
          p &nbsp;
          p.error(v-if='authError') {{authError}}

        span.wideScreen
          rgv-modal.login-modal(type='record' id='login-modal' :error='authError' :title='loginTitle' :options='loginOptions' :note='note' :remoteErrors='formErrors')
          span &nbsp; &nbsp;
          rgv-modal.signup-modal(type='record' id='register-modal' :error='authError' :title='regTitle' :options='registerOptions' :note='note' :remoteErrors='formErrors')
            p &nbsp;
    span.vwideScreen.nav-path(v-if="path.length > 1")
      <!-- Breadcrumb -->
      div(style='display:inline-block' v-for='page, i in path')
        br
        a(v-on:click='$router.push(path[i])') {{page}}
        span(v-if='i < path.length - 1') &nbsp; > &nbsp;
</template>
<script>
import auth from '@/auth'
import axios from 'axios'
import Config from '@/config.js'
import FormValidator from '@/mixins/FormValidator'

export default {
  data () {
    return {
      env: 'undef',
      credentials: {
        username: '',
        password: ''
      },
      error: '',
      authError: '',
      note: 'asldfj',
      formErrors: {},
      // userMenu: [],
      initMenu: [
        // may supply custom versions in place of this ...
        { label: 'Logout', onClick: this.logout }
      ],
      status: 'initialized'
    }
  },
  mixins: [
    FormValidator
  ],
  components: {
  },
  props: {
    mode: {
      type: String
    },
    path: {
      type: Array,
      default () { return [] }
    },
    onPick: { type: Function },
    demo: {
      type: Object,
      default: null
    },
    noConfirm: {
      type: Boolean,
      default: false
    },
    add2Menu: {
      type: Array,
      default () { return [] }
    },
    testInput: {
      type: Boolean,
      default: false
    }
  },
  created: function () {
    this.loadEnv()
  },
  computed: {
    payload: function () {
      return this.$store.getters.payload || {access: 'public'}
    },
    registerMode: function () {
      if (this.mode === 'Register') {
        console.log('reg mode')
        return true
      } else if (this.$route.params.mode === 'Register') {
        console.log('found mode param')
        return true
      } else {
        return false
      }
    },
    loginMode: function () {
      if (this.mode === 'Login') {
        console.log('login mode')
        return true
      } else if (this.$route.params.mode === 'Login') {
        console.log('found login mode param')
        return true
      } else {
        console.log('NOT login mode: ' + this.mode)
        return false
      }
    },
    constructionMode: function () {
      if (this.mode === 'Register') {
        console.log('construction mode')
        return true
      } else {
        return false
      }
    },
    myUserMenu: function () {
      if (this.add2Menu) {
        console.log('add2menu...')
        var menu = []
        // menu.push(this.initMenu[0])
        for (var i = 0; i < this.add2Menu.length; i++) {
          menu.push(this.add2Menu[i])
        }
        menu.push(this.initMenu[0])
        return menu
      } else {
        return this.initMenu
      }
    },
    userid: function () {
      if (this.payload && this.payload.userid) {
        return this.payload.userid
      } else {
        return null
      }
    },
    loginTitle: function () {
      return 'Login'
    },
    regTitle: function () {
      return 'Register'
    },
    loginOptions: function () {
      var opt = {
        show: this.loginMode,
        modalID: 'login-modal',
        openButton: 'Log in',
        access: 'append',
        fields: Config.loginFields,
        onSave: this.login,
        onBlur: this.checkInput,
        onFocus: this.inputFocus,
        submitButton: 'Log In',
        wideOnMobile: true,
        onCancel: this.cancel,
        buttonClass: Config.defaultButtonClass,
        submitButtonClass: 'btn-primary btn-lg',
        noClose: true,
        buttonType: 'submit',
        header: 'Login',
        title: ''
      }
      if (this.env !== 'production') {
        opt.title = 'Note:  You are logging into the ' + this.env + ' mode'
        opt.header = 'Login - ' + this.env + ' mode'
      }
      return opt
    },
    registerOptions: function () {
      var opt = {
        show: this.registerMode,
        openButton: 'Sign up',
        access: 'append',
        fields: Config.registrationFields,
        onSave: this.register,
        onBlur: this.checkInput,
        onFocus: this.inputFocus,
        submitButton: 'Register',
        wideOnMobile: true,
        onCancel: this.cancel,
        buttonClass: Config.defaultButtonClass,
        submitButtonClass: 'btn-primary btn-lg',
        noClose: true,
        buttonType: 'submit',
        header: 'Registration',
        title: ''
      }
      if (this.env !== 'production') {
        opt.title = 'Note:  You are only registering for the ' + this.env + ' mode'
        opt.header += 'Registration - ' + this.env + ' mode'
      }
      return opt
    },
    constructionOptions: function () {
      var opt = {
        show: this.constructionMode,
        modalID: 'construction-modal',
        header: 'We are currently updating our site.... Thanks for your patience',
        title: 'Under Construction'
      }
      return opt
    },
    apiURL: function () {
      if (process.env.NODE_ENV && Config.apiURL) {
        return Config.apiURL[process.env.NODE_ENV]
      } else {
        console.log("** Error: require apiURL specification in config.js file")
        return 'http://localhost'
      }
    }
  },
  methods: {
    profile () {
      console.log('verify current profile')
    },
    loadEnv () {
      var _this = this
      console.log('load apiURL from env: ' + this.apiURL)
      axios.get(this.apiURL + '/env')
        .then(function (response) {
          if (response.data && response.data.codeVersion) {
            console.log('*** env: ')
            _this.env = response.data.codeVersion

            console.log(JSON.stringify(response.data))

            if (_this.env !== 'production') {
              _this.loginOptions.title = 'Note:  You are logging into the ' + _this.env + ' system'
              _this.loginOptions.header += ' - ' + _this.env + ' mode'
            }
          } else {
            console.log('*** no env detected: ' + JSON.stringify(response))
          }
        })
        .catch(function (err) {
          console.log('Error checking environment: ' + err)
        })
    },
    adjustForEnv: function (env) {
      this.env = env
      if (env !== 'production') {
        this.loginOptions.title = 'Note:  You are logging into the ' + env + ' system'
        this.registerOptions.title = 'Note:  You are only registering for the ' + env + ' mode'

        this.loginOptions.header += ' - ' + env + ' mode'
        this.registerOptions.header += ' - ' + env + ' mode'
      }
    },
    async register (form) {
      var fields = this.registerOptions.fields
      var credentials = {}
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i]
        credentials[f.name] = form[f.prompt] || form[f.name]
      }
      delete axios.defaults.headers.common['Authorization']

      if (!credentials.username) { credentials.username = credentials.email }
      if (this.noConfirm) {
        credentials.confirmPassword = credentials.password
      }
      console.log('Registering with credentials: ')
      var response = await auth.signup(this, credentials)
      console.log('Register call:' + JSON.stringify(response))
      return this.initializeSession(response, 'Created Account')
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
        this.$store.dispatch('logError', 'Error encountered during log in ... Please try again')
      }
      return this.initializeSession(response)
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
          this.$router.push('/Home')
          if (onSuccess) {
            this.$store.dispatch('logMessage', onSuccess)
          }
          if (response.data.payload) {
            console.log('payload: ' + JSON.stringify(response.data.payload))
            this.$store.dispatch('CACHE_PAYLOAD', response.data.payload)
            // this.$set(this, 'payload', response.data.payload) this should be redundant (?)
          }
          return { success: true }
        } else if (response.data.error) {
          console.log('log error: ' + response.data.error)
          this.$set(this, 'authError', response.data.error)
          // this.$store.dispatch('logError', response.data.error)
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
    loadDemo (template) {
      if (this.demo && this.demo[template]) {
        var cred = this.demo[template]
        this.login(cred)
      } else {
        console.log(template + ' demo template not defined')
        console.log(JSON.stringify(this.demo))
      }
    },
    async logout () {
      console.log('P: ' + JSON.stringify(this.payload))
      var loginId = this.payload.login_id
      console.log(loginId + ' logout via auth ')

      this.$store.dispatch('AUTH_LOGOUT')
      this.$store.dispatch('CACHE_PAYLOAD', { access: 'public' })
      var response = await auth.logout(this, loginId)
      console.log('Logout response:' + JSON.stringify(response))
      this.$router.push('/Home')
    },
    makeAuth () {
      this.note = 'Register failed'
    },
    checkInput () {
      console.log('validate input')
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
    cancel () {
      this.$set(this, 'formErrors', {})
      console.log('cancel this form')
      this.authError = ''
    },
    back () {
      this.$set(this, 'formErrors', {})
      console.log('go back')
      this.authError = ''
      this.$router.go(-1)
    }
  }
  // watch: {
  //   note () {
  //     console.log('note changed...')
  //     const note = document.querySelector('.note')
  //     if (this.note.length) {
  //       note.classList.add('note--up')
  //     } else {
  //       note.classList.remove('note--up')
  //       note.classList.add('note--down')
  //     }
  //   }
  // }
}
</script>

<style scoped>
.error {
  padding: 10%;
  text-align: center;
  font-weight: bold;
}

.user-icon {
  position: absolute;
  top: 3rem;
  right: 2rem;
}

.login-modal, .signup-modal {
  display: inline-block;
  padding-top: 0;
}

.login-button, .signup-button {
  margin-top: 10%;
  width: 100%;
}

@media screen and (max-width: 767px) {
  .login-modal, .signup-modal {
    width: 100%;
    padding-top: 30%;
  }
  .login-form, .signup-form {
    width: 100%;
    padding-top: 10%;
  }
}

.login-box {
  padding: 1rem;
  border: solid black 1px;
  text-align: center;
}
.note {
  background: #FF9E80;
  padding: 0.75rem 1.5rem;
  box-sizing: border-box;
  position: relative;
  bottom: 100%;
  z-index: 0;
  width: 100%;
  transition: all .5s ease-out;
}
.note-mask {
  background: #FFFFFF;
  padding: 0.75rem 1.5rem;
  box-sizing: border-box;
  position: relative;
  bottom: 100%;
  z-index: 0;
  transition: all .5s ease-out;
}
.note--down {
  transform: translateY(100%);
}

.note--up {
  transform: translateY(0);
}
.nav-path {
  position: relative;
  top: 30px;
}
</style>
