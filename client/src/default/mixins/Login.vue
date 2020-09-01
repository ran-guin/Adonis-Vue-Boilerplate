<!--
  Package to manage basic Registration / Login / Recover Password actions

Usage example.

<template>
    ... 

    v-dialog(v-model='showLogin' max-width='500px')
        Login(:onCancel='cancelRequest' :onRegister='register' :onRecover='recover')
    v-dialog(v-model='showRegistration' max-width='500px')
        Register(:onCancel='cancelRequest' :onLogin='login')
    v-dialog(v-model='showRecover' max-width='500px')
        Recover(:onCancel='cancelRequest' :onLogin='login' :onRegister='register')

</template>

<script>
const Login = () => import('@/default/components/Login')
const Register = () => import('@/default/components/Register')
const Recover = () => import('@/default/components/Recover')

export default {
  components: {
    Login,
    Register,
    Recover
  }
  ...
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
            this.$myConsole.debug('logout via login mixin...')
            return await auth.logout(this, loginId)
        },
        async signup (form) {
            this.clearMessages()
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
            try {
                console.log('call auth.signup...')
                var response = await auth.signup(this, credentials)
                this.$myConsole.debug('SignUp call:' + JSON.stringify(response))
                console.log('returned from signup...')
                if (response.data.error) {
                    this.$set(this.formErrors, 'form', response.data.error)
                    console.error(response.data.error)

                    if (response.data.validation_errors && response.data.validation_errors[0].message === 'unique validation failed on email') {
                        this.delayedRedirect('Looks like you are already registered... redirecting you to recover password', 'warning', this.apiURL + '/recover?message=Already Registered&email=' + this.form.email)
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
        async recoverPassword(form) {
            this.message = 'Generating Recovery Email...'
            const email = form.email
            this.$myConsole.debug('recover my password via ' + this.apiURL + '/recoverPassword ... for ' + email)
            axios.post(this.apiURL + '/recoverPassword', { email: email })
                .then( response => {
                    if (response && response.data && response.data.validation_errors) {
                        this.$myConsole.debug('get service response')
                        var val = this.validateResponse(response)
                        if (val.formErrors) { this.$set(this, 'formErrors', val.formErrors) }
                        return response.data
                    } else if (response && response.error) {
                        this.$store.dispatch('logError', response.error)
                        return response
                    } else if (response && response.data) {
                        this.$myConsole.debug('recover response: ' + JSON.stringify(response))
                        // this.setToLogin(1)

                        this.delayedRedirect('Password recovery link sent to \'' + email + '\' (if account exists)', 'message', this.apiURL + '/login?message=Recovery Link Sent')
                        return response
                    }
                })
                .catch( err => {
                    this.error = 'Problem generating recovery mail (?)  Please contact us directly.'
                    this.$myConsole.debug('Error Generating Password Recovery ' + err)
                })
        },
        async resetPassword(form) {
            this.message = 'Resetting Password...'
            const reset = {
                email: form.email,
                password: form.password,
                confirmPassword: form.confirmPassword,
                token: form.token
            }
            var url = this.apiURL + '/resetPassword'
            this.$myConsole.debug('reset my password via ' + url + ' ... for ' + form.email)

            axios.post(url, reset)
                .then( response => {
                    if (response && response.data && response.data.validation_errors) {
                        this.$myConsole.debug('get service response')
                        var val = this.validateResponse(response)
                        if (val.formErrors) { this.$set(this, 'formErrors', val.formErrors) }
                        return response.data
                    } else if (response && response.error) {
                        this.$store.dispatch('logError', response.error)
                        return response
                    } else if (response && response.data) {
                        this.$myConsole.debug('recover response: ' + JSON.stringify(response))

                        this.delayedRedirect('Password reset for \'' + form.email + '\' (if account exists)', 'message', this.apiURL + '/login?message=Password Reset&email=' + form.email)
                        return response
                    }
                })
                .catch( err => {
                    this.error = 'Problem resetting password.'
                    this.$myConsole.debug('Error Resetting Password: ' + err)
                })
        },
        delayedRedirect: function (message, type, path) {
            if (type === 'error') {
                this.error = message
            } else if (type === 'warning') {
                this.warning = message
            } else {
                this.message = message
            }

            var _this = this
            setTimeout(function () {
                _this.message = ''
                _this.warning = ''
                _this.error = ''

                if (path && path.match(/^http/)) {
                    window.location = path
                } else if (path) {
                    _this.$router.push(path)
                } else {
                    _this.$router.push('/')
                }
            }, 2000); //will call the function after 2 secs.
        },

        async loadEnv() {
            this.$myConsole.debug('env: ' + process.env.NODE_ENV)
            this.$myConsole.debug(JSON.stringify(Config.apiURL))
            this.$myConsole.debug('axios: get env from ' + this.apiURL)
            return axios.get(this.apiURL + '/env')
                .then( response => {
                    if (response.data) {
                        this.$myConsole.debug('*** env: ')
                        this.$myConsole.debug(JSON.stringify(response.data))
                        return Promise.resolve(response.data)
                    } else {
                        this.$myConsole.debug('*** no env detected: ' + JSON.stringify(response))
                        return Promise.resolve({})
                    }
                })
                .catch( err => {
                    this.$myConsole.debug('Error retrieving env: ' + err)
                    this.delayedRedirect('Problem connecting to server.  Please try again later.', 'error')
                    return Promise.resolve({})
                })
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
        },
        // setToLogin: function (reset) {
        //     // this.mode = 'Login'
        //     this.clearLocalMessages()
        //     this.adjustForEnv()
        //     this.$myConsole.debug('set login options: ')
        //     this.$myConsole.debug(JSON.stringify(this.loginOptions))
        //     if (reset) { this.clearLocalMessages() }
        // },
        // setToSignup: function (reset) {
        // // this.mode = 'SignUp'
        // this.clearLocalMessages()
        // this.adjustForEnv()
        // this.$myConsole.debug('signup options: ')
        // this.$myConsole.debug(JSON.stringify(this.signupOptions))
        // if (reset) { this.clearLocalMessages() }
        // },
        // setToRecover: function (reset) {
        // this.clearLocalMessages()
        // this.adjustForEnv()
        // // this.mode = 'Recover'
        // this.$myConsole.debug('set recover options: ')
        // this.$myConsole.debug(JSON.stringify(this.recoverOptions))
        // if (reset) { this.clearLocalMessages() }
        // },
        // adjustForEnv: function () {
        //     if (this.env) {
        //         if (this.nodeEnv === 'demo') {

        //             this.loginOptions.header += ' (' + process.env.NODE_ENV + ' only)'
        //         }
        //         if (this.nodeEnv !== 'production') {

        //             this.loginOptions.header += ' (' + process.env.NODE_ENV + ' only)'

        //             if (this.mode === 'Login') {
        //                 this.loginOptions.fields[0].prompt += ' - try  guest@' + Config.defaultEmailDomain
        //                 this.loginOptions.fields[1].prompt += ' - use \'demoPassword\' for guest access'
        //             }
        //         }
        //     } else {
        //         this.$myConsole.debug('no env')
        //     }
        // },
    }
}
</script>
