<!--

Usage example.


 -->

<script>
import IdvpnService from '@/services/IdvpnService'
import auth from '@/auth'
import Config from '@/config.js'
const oidcService = new IdvpnService()

// import Issuer from 'openid-client'

export default {
  data () {
    return {
      auth_status: {},
      claims: {},
      oidc: false
    }
  },
  mounted: function () {
    console.debug('** initiate authentication...')
    if (oidcService && oidcService.loaded) {
      this.oidc = true
      // this.auth_validate()
    }
    // console.log('existing auth ?')
    // const old = window.localStorage.getItem('auth')
    // console.log('old: ' + old)
    // const auth = JSON.parse(old || 'null')
    // console.log(JSON.stringify(auth))
    // this.auth_validate()
  },
  computed: {
    payload: function () {
      return this.$store.getters.payload
    },
    authorization_status: function () {
      return this.auth_status
    }
  },
  methods: {
    auth_user: function () {
      oidcService.getUser()
        .then((user) => {
          console.log('call auth_user: ' + JSON.stringify(user))
        })
    },
    auth_validate: function (provider) {
      console.log('validate auth via mixin...')
      if (oidcService && oidcService.loaded) {
        console.log('idvpn loaded...')

        const _this = this
        oidcService.getUser()
          .then((user) => {
            var error = null
            var loggedIn = true

            if (!user) {
              error = 'no defined user'
              loggedIn = false
            } else if (user.error) {
              console.debug('access user error: ' + user.error)
              error = user.error
              loggedIn = false
            }

            console.log('auth user: ' + JSON.stringify(user))
            // const payload = { userid: 1234567, username: 'TBD' }
            _this.auth_status = {
              type: 'oidc',
              source: provider, 
              loggedIn: loggedIn,
              // payload: payload,
              profile: user.profile,
              error: error
            }

            console.log('AUTH_STATUS: ' + JSON.stringify(_this.auth_status))
          })
          .catch((err) => {
            console.log('no user: ' + err)
          })
        // console.log('login status: ' + JSON.stringify(this.auth_status))
        // if (!this.auth_status.loggedIn) {
        //   this.auth_login()
        // }
      } else if (this.payload && this.payload.userid) {
        console.log('standard payload loaded...' + JSON.stringify(this.payload))
        this.auth_status = {
          type: 'payload',
          source: 'payload',
          loggedIn: true,
          payload: this.payload,
        }
      } else {
        console.log('not logged in... ')
        this.auth_status = { type: null, loggedIn: false, payload: {} }
      }
      return this.auth_status
    },
    auth_login: function (provider) {
      // const _this = this
      if (!provider) { provider = 'default' }

      if (this.oidc) {
        console.log('load oidc ' + provider)
        // const state = 'bce23967420544de897b0f09f46283d7'
        oidcService.login() // {state: state}
          // .then((info) => {
          //     console.log('login: ' + JSON.stringify(info))
          // })
          // .catch((err) => {
          //   console.log('oidc login error: ' + err)
          //   this.$store.dipatch('logError', 'Sorry - we cannot log into the OIDC service provider at this time: ' + provider)
          //   return {}
          // })
      } else {
        console.log('redirect to standard login')
        this.$router.push('/login')
      }
    },
    async auth_logout (context) {
      console.log('mixin logout ' + context)
      this.auth_status.payload = {}
      this.auth_status.loggedIn = false
      if (this.oidc) {
        console.log('oidc logout...')
        oidcService.logout()
      }

      console.log('standard logout from: ' + JSON.stringify(this.payload))
      var loginId = this.payload.login_id
      console.log(loginId + ' logout via auth ')

      this.$store.dispatch('AUTH_LOGOUT')
      this.$store.dispatch('CACHE_KEYED_PAYLOAD', {payload: { access: 'public' }, key: Config.CLIENT_ID})
      var response = await auth.logout(this, loginId)
      console.log('Logout response:' + JSON.stringify(response))
      // this.$router.push('/public')

      return this.auth_status
    }
  }
}
</script>
