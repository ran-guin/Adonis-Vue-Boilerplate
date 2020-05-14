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
                console.log('got response to login attempt: ' + JSON.stringify(response))
                var userError = /UserNotFound/
                
                if ( form.registerNewEmail && response.data && response.data.message && response.data.message.match(userError) ) {
                    console.log('auto-register first...')
                    await this.signup(form)
                    response = await auth.login(this, credentials)
                }

                if (response && response.expired) {
                    console.log('Found expiry error')
                    this.$store.dispatch('logWarning', 'Session Expired.  Please log in again.')
                } else if (response && response.data && response.data.error === 'Login Error') {
                    var passwordError = /Password/i
                    console.log('Found Login Error: ' + response.data.message)
                    if (response.data.message.match(passwordError)) {
                        console.log('Password Failure')
                        return {success: false, message: 'Login Failure'}                  
                    } else if (response.data.message.match(userError)) {
                        // var tried = response.data.message.match(/Cannot find user with email as (.*)/i)
                        console.log('User not found: ')
                        // if (form.registerNewEmail) {
                        //     console.log('attempt signup...')
                        //     const secondary_response = await this.signup(form)
                        //     return this.initializeSession(secondary_response)
                        // } else {
                        return {success: false, message: 'User not found'}
                        // }
                    } else {
                        console.log('Other error ?' + response.data.message)
                    }
                } else if (response && response.data && response.data.error) {
                    console.log("response error: " + response.data.error)
                    console.log("response nessage: " + response.data.message)
                    return {success: false, message: response.data.message, error: response.data.error}
                } else {
                    console.log('Message: ' + response.data.message)
                }
                this.$myConsole.debug('Login response:' + JSON.stringify(response))
            } catch (err) {
                this.$myConsole.debug('caught login error: ' + err)
                if (err === 'Network Error') {
                    this.$store.dispatch('logError', 'Connection temporarily unavailable...')
                }
                this.$store.dispatch('logError', 'Error encountered during log in ... Please try again')
                console.log(err.message)
                return {success: false, message: err.message}
            }
            return this.initializeSession(response)
        },
        async logout () {
            var loginId = this.payload.login_id
            this.$myConsole.debug('logout via mixin...')
            auth.logout(this, loginId)
        },
        async signup (form) {
            var credentials = { 
                shortForm: form.shortForm ? true : false,
                password: form.password,
                confirmPassword: form.noConfirm ? form.password : form.confirmPassword,
                email: form.email,
                username: form.username || form.email,
                redirect_uri : form.redirect_uri
            }
            console.log('signup for ' + credentials.email)
            delete axios.defaults.headers.common['Authorization']

            this.$myConsole.debug('Signing up with credentials: ')
            // this.$store.dispatch('logMessage', 'Submitting registration request...')
            try {
                console.log('call auth.signup...')
                var response = await auth.signup(this, credentials)
                this.$myConsole.debug('SignUp call:' + JSON.stringify(response))
                console.log('returned from signup...')
                if (response.data.error) {
                    this.$set(this.formErrors, 'form', response.data.error)
                    console.error(response.data.error)

                    if (response.data.validation_errors && response.data.validation_errors[0].message === 'unique validation failed on email') {
                        this.delayedRedirect('Looks like you are already registered... redirecting you to recover password', 'warning', this.apiURL + '/recover?email=' + this.form.email)
                        // this.warning = 'Looks like you are already registered... redirecting you to recover password'

                        // var _this = this
                        // setTimeout(function () {
                        //   _this.setToRecover()
                        // }, 2000); //will call the function after 2 secs.
                    }
                } else {
                    this.$myConsole.debug('redirect ? ' + this.redirect_uri)
                    if (this.redirect_uri) {
                        this.$myConsole.debug('** redirecting to ' + this.redirect_uri)
                        this.delayedRedirect('Submitting registration request', 'message', this.redirect_uri)
                    } else {
                        this.$myConsole.debug('no redirect..')
                        const message = response.data.message || 'Created Account'
                        return this.initializeSession(response, message)
                    }
                }
            } catch (err) {
                console.debug('Failed to sign up...' + err.message)
                return 
            }
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
