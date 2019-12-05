<!--

Usage example.


 -->

<script>
import IdvpnService from '@/services/IdvpnService'
import auth from '@/auth'
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
    }
    // this.auth_validate()
  },
  computed: {
    payload: function () {
      return this.$store.getters.payload
    }
  },
  methods: {
    auth_validate: function (provider) {
      console.log('validate via mixin...')
      if (oidcService && oidcService.loaded) {
        console.log('idvpn loaded...')

        const _this = this
        oidcService.getUser()
          .then((user) => {
            console.log('user: ' + JSON.stringify(user))
            _this.auth_status = {
              type: 'oidc',
              source: provider, 
              loggedIn: true,
              payload: user
            }

            console.log('get claims ...')
            // oidcService.getClaims(window.location.href)
          })
          .catch((err) => {
            console.log('no user: ' + err)
          })
        console.log('login status: ' + JSON.stringify(this.auth_status))
        if (!this.auth_status.loggedIn) {
          this.auth_login()
        }
      } else if (this.payload && this.payload.userid) {
        console.log('payload loaded...' + JSON.stringify(this.payload))
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
      const _this = this
      if (!provider) { provider = 'default' }

      console.log('load oidc ' + provider)
      const state = 'abc123' // random ... Fix this (temp only)   
      
      oidcService.login(state)
        .then((info) => {
            console.log('auth_status login: ' + JSON.stringify(info))
            _this.auth_validate(provider)
            _this.$router.push('/dashboard')
        })
        .catch((err) => {
          console.log('oidc login error: ' + err)
          return {}
        })
    },
    async auth_logout (context) {
      console.log('mixin logout ' + context)
      this.auth_status.payload = {}
      this.auth_status.loggedIn = false
      if (oidcService.loaded) {
        console.log('oidc logout...')
        oidcService.logout()
      }

      console.log('standard logout from: ' + JSON.stringify(this.payload))
      var loginId = this.payload.login_id
      console.log(loginId + ' logout via auth ')

      this.$store.dispatch('AUTH_LOGOUT')
      this.$store.dispatch('CACHE_PAYLOAD', { access: 'public' })
      var response = await auth.logout(this, loginId)
      console.log('Logout response:' + JSON.stringify(response))
      // this.$router.push('/public')

      return this.auth_status
    }
  }
}
</script>
