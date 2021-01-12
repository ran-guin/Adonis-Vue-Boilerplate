<template lang='pug'>
  div
    div.user-icon()
      rgv-dropdown.user-dropdown(:options='myUserMenu' :title='payload.username' width='100px')
      rgv-modal.user-modal(id='profile' type='data')
</template>
<script>
import auth from '@/auth'
import axios from 'axios'
import Config from '@/config.js'
import FormValidator from '@/default/mixins/FormValidator'

export default {
  data () {
    return {
      // We need to initialize the component with any
      // properties that will be used in it
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
    profile () {
      console.log('verify current profile')
    },
    async logout () {
      console.log('P: ' + JSON.stringify(this.payload))
      var loginId = this.payload.login_id
      console.log(loginId + ' logout via auth ')

      this.$store.dispatch('AUTH_LOGOUT')
      this.$store.dispatch('CACHE_KEYED_PAYLOAD', {payload: { access: 'public' }, key: Config.CLIENT_ID})
      var response = await auth.logout(this, loginId)
      console.log('Logout response:' + JSON.stringify(response))
      this.$router.push('/Home')
    },
    cancel () {
      this.$set(this, 'formErrors', {})
      console.log('cancel this form')
      this.authError = ''
    },
  }
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
