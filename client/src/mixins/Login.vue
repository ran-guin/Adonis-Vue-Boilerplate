<!--

Usage example.


 -->

<script>
import auth from '@/auth'
import Config from '@/config.js'
import axios from 'axios'

export default {
    data () {
        return {

        }
    },
    mounted: function () {
    
    },
    computed: {
        payload: function () {
            return this.$store.getters.payload || {}
        },
    },
    methods: {
        async login (form) {
            var credentials = {
            email: form.email,
            password: form.password
            }
            this.$myConsole.debug('login ' + form.email)
            try {
            delete axios.defaults.headers.common['Authorization']
            console.debug('login via axios...')
            var response = await auth.login(this, credentials)
            console.log('got response...' + JSON.stringify(response))
            if (response && response.expired) {
                this.$store.dispatch('logWarning', 'Session Expired.  Please log in again.')
            }
            this.$myConsole.debug('Login response:' + JSON.stringify(response))
            } catch (err) {
            this.$myConsole.debug('caught login error: ' + err)
            if (err === 'Network Error') {
                this.$store.dispatch('logError', 'Connection temporarily unavailable...')
            }
            this.$store.dispatch('logError', 'Error encountered during log in ... Please try again')
            }
            return this.initializeSession(response)
        },
        async logout () {
            var loginId = this.payload.login_id
            this.$myConsole.debug('logout via auth...')
            auth.logout(this, loginId)
        },
        initializeSession (response, onSuccess) {
            console.debug('initialize session...')
            if (response && response.data && response.data.validation_errors) {
                this.$myConsole.debug('get service response')
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
                            this.$myConsole.debug('token cached: ' + response.data.token)
                            this.$myConsole.debug('refresh token: ' + refreshToken)
                            this.$store.dispatch('AUTH_TOKEN', {token: response.data.token, refreshToken: refreshToken})

                            var pass = 'Bearer ' + response.data.token
                            axios.defaults.headers.common['Authorization'] = pass
                            // auth.updateToken()
                            this.$myConsole.debug('updated token...')
                        } else {
                            this.$myConsole.debug('no token in response' + JSON.stringify(response.data))            
                        }

                        if (onSuccess) { alert(onSuccess) }

                        if (this.redirect_uri) {
                            this.$myConsole.debug('** reroute to ' + this.redirect_uri)
                            window.location = this.redirect_uri
                        } else {
                        if (onSuccess) {
                            this.$myConsole.debug('dispatch log message: ' + onSuccess)
                            this.$store.dispatch('logMessage', onSuccess)
                        }
                        if (response.data.payload) {
                            this.$myConsole.debug('initialized payload: ' + JSON.stringify(response.data.payload))
                            this.$store.dispatch('CACHE_KEYED_PAYLOAD', {payload: response.data.payload, key: Config.CLIENT_ID})
                            this.$router.push('/Dashboard?message=' + onSuccess)
                            // this.$set(this, 'payload', response.data.payload) this should be redundant (?)
                        }
                    }
                    return { success: true }
                } else if (response.data.message) {
                    this.$myConsole.debug('log message error: ' + response.data.message)
                    this.$set(this, 'authError','Sorry - Authorization Failed')
                    return { error: response.data.message }
                } else if (response.data.error) {
                    this.$myConsole.debug('log error: ' + response.data.error)
                    this.$set(this, 'authError', 'Sorry - Authorization Failed')
                    return { error: response.data.error }
                } else {
                    this.$store.dispatch('logWarning', 'unrecognized data response')
                    return 'no recognized response...'
                }
            } else {
                this.$store.dispatch('logWarning', 'unrecognized response')
                return {warning: 'unrecognized response'}
            }
        }
    }
}
</script>
