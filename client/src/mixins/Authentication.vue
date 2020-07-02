<!--

Usage example.


 -->

<script>
import auth from '@/auth'
import Config from '@/config.js'

// import Issuer from 'openid-client'

export default {
  data () {
    return {
      auth_status: {},
      claims: {}
    }
  },
  mounted: function () {
    console.debug('** initiate authentication...')
    // console.log('existing auth ?')
    // const old = window.localStorage.getItem('auth')
    // console.log('old: ' + old)
    // const auth = JSON.parse(old || 'null')
    // console.log(JSON.stringify(auth))
    // this.auth_validate()
  },
  computed: {
    payload: function () {
      return this.$store.getters.payload || {}
    },
    authorization_status: function () {
      console.log('auth status: ' + JSON.stringify(this.auth_status))
      return this.auth_status
    }
  },
  methods: {
    auth_validate: function (provider) {
      console.log(provider + ' validate auth via mixin...')
      if (this.payload && this.payload.userid) {
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
      console.log(provider + ' redirect to standard login')
      this.$router.push('/login')
    },
    async auth_logout (context) {
      console.log('mixin logout ' + context)
      this.auth_status.payload = {}
      this.auth_status.loggedIn = false

      console.log('standard logout from: ' + JSON.stringify(this.payload))
      var loginId = this.payload.login_id
      console.log(loginId + ' logout via auth from Auth mixin ')

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
