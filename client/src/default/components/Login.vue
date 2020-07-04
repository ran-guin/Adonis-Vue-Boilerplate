<template lang='pug'>
  div.centred(style='background-color: white')
    h6.text-danger(v-if="$route.params.error || $route.query.error") {{$route.params.error || $route.query.error}} 
    h6.text-warning(v-if="$route.params.warning || $route.query.warning") {{$route.params.warning || $route.query.warning}} 
    h6.text-success(v-if="$route.params.message || $route.query.message") {{$route.params.message || $route.query.message}}

    div(v-if='nodeEnv==="demo"')
      h4 Login to Demo Version as:
      v-container
        v-radio-group(v-model='demoRole')
          v-layout.justify-space-around
            v-radio(@change='demoLogin()' value='Member' label='Member') 
            v-radio(@change='demoLogin()' value='Driver' label='Driver')
            v-radio(@change='demoLogin()' value='Host' label='Host')
            v-radio(@change='demoLogin()' value='DemoAdmin' label='Admin')
      v-btn.btn-primary(@click='demoLogin') Login to Demo Version
    div(v-else) 
      rgv-form.login-form(:form='form' :options='loginOptions' :remoteErrors='formErrors' :onCancel='cancel')
    hr
    a.text-sm(v-if='onRecover' @click='onRecover') Forgot password ?
    br
    a.text-sm(v-if='onRegister' @click='onRegister') Sign Up
    p.error(v-if='authError') {{authError}}
    p &nbsp;
</template>
<script>
    import Config from '@/config.js'

    // import { rgvForm } from '@ran-guin/forms'
    import FormValidator from '@/default/mixins/FormValidator'
    import Login from '@/default/mixins/Login'

    export default {
        components: {
          // rgvForm
        },
        mixins: [
            Login,
            FormValidator
        ],
        data() {
            return {
                embeddedMessage: {
                    error: '',
                    warning: '',
                    message: ''
                },
                demoRole: '',
                mode: '',
                noLogin: true, // hide login buttons when generating login page
                form: {
                    email: ''
                },
                inviteToken: '',
                noFooter: false,
                noMobileHeader: false,
                env: {},
                authError: '',
                note: '',
                email: '',
                formErrors: {},
                myOptions: {},
                loginOptions: {
                    access: 'append',
                    fields: [
                        { name: 'email', type: 'email', prompt: 'Email', rules: [Config.rules.email], icon: 'email' },
                        { name: 'password', type: 'password', prompt: 'Password', rules: [Config.rules.min(8)], icon: 'lock' }
                    ],
                    submitButtonClass: 'btn-primary btn-lg',
                    // buttonType: 'submit',
                    header: '',
                    title: 'Login',
                },
                config: Config,
                apiURL: Config.apiURL[process.env.NODE_ENV],
                message: '',
                warning: '',
                error: '',
                noRefresh: true,
                redirect_default: Config.lpURL[process.env.NODE_ENV],
                rules: Config.rules,
                invitationRequired: false,
                redirect_uri: ''
            }
        },
        props: {
            onRegister: {
                type: Function
            },
            onRecover: {
                type: Function
            },
            onCancel: {
                type: Function
            },
            invitationToken: {
                type: String
            },
            page: {
                type: String,
                default: 'Login'
            },
            redirect: {
                type: String
            }
        },
        async created () {
            if (this.onRegister) {
                this.$myConsole.debug('onRegister supplied')
            }
            if (this.onRecover) {
                this.$myConsole.debug('onRecover supplied')
            }

            if (this.page === 'Logout') {
                console.log('logout')
                await this.logout()
                console.log('logged out')
                this.$router.push('/Public')
            } else {
                this.setup()
            }

            const error = this.$route.params.error || this.$route.query.error
            const warning = this.$route.params.warning || this.$route.query.warning
            const message = this.$route.params.message || this.$route.query.message

            this.$set(this.embeddedMessage, 'error', error)
            this.$set(this.embeddedMessage, 'warning', warning)
            this.$set(this.embeddedMessage, 'message', message)

            if (error || warning || error) {
                var mElement = document.getElementById('embeddedMessage')
                if (mElement) {
                    mElement.innerHTML = '<h3>MESSAGE<h3>'
                }
            }
        },
        computed: {
            nodeEnv: function () {
                if (process.env.NODE_ENV === 'prod') {
                    return 'production'
                } else {
                    return process.env.NODE_ENV
                }
            },
            payload: function () {
                return this.$store.getters.payload || {}
            },
            options: function () {
                if (this.mode === 'Login') {
                    this.$myConsole.debug('opt = ' + JSON.stringify(this.loginOptions))
                    return this.loginOptions
                } else {
                    console.debug('separate ' + this.mode + ' handling in different module')
                    return {}
                }
            }
        },
        methods: {
            setup: function () {
                this.redirect_uri = this.$route.query.redirect || this.$route.query.redirect_uri || this.redirect
                this.inviteToken = this.invitationToken || this.$route.params.token || this.$route.query.token
                this.$myConsole.debug('token supplied ? ' + this.$route.params.token + ' = ' + this.inviteToken)

                this.$myConsole.debug('url query ?: ' + JSON.stringify(this.$route.query))
                this.$myConsole.debug('url params ?: ' + JSON.stringify(this.$route.params))

                this.$myConsole.debug('Rules: ' + JSON.stringify(this.rules))
                this.$myConsole.debug('apiURL' + process.env.NODE_ENV + ' -> ' + this.apiURL)

                this.$myConsole.debug('Login options: ' + JSON.stringify(this.loginOptions))
                this.$set(this.loginOptions, 'onSubmit', this.login)
                this.$set(this.loginOptions, 'onBlur', this.checkInput)
                this.$set(this.loginOptions, 'onFocus', this.inputFocus)
                this.$set(this.loginOptions, 'onCancel', this.cancel)

                this.$myConsole.debug('initialized login options...')

                var path = this.$route.path.match(/\/?(\w+)/)

                var presets = ['email', 'token']
                for (var i = 0; i < presets.length; i++) {
                    var val = this.$route.params[presets[i]] || this.$route.query[presets[i]]
                    if (val) { this.form[presets[i]] = val }
                }
                // var email = this.$route.params.email || this.$route.query.email
                // if (email) {
                //   this.$myConsole.debug('*** preset email: ' + email)
                //   this.form.email = email
                // }

                if (this.page) {
                    this.mode = this.page
                    this.$myConsole.debug('Mode: ' + this.mode)
                } else if (this.$route.query.mode || this.$route.params.mode) {
                    this.mode = this.$route.query.mode || this.$route.params.mode
                    this.$myConsole.debug('input mode: ' + this.mode)
                } else if (!this.mode && path) {
                    this.$myConsole.debug('default mode to path: ' + path[1])
                    this.mode = path[1]
                } else {
                    this.$myConsole.debug('Default mode to Login')
                    this.mode = 'Login'
                }

                this.$store.dispatch('clearMessages')
                this.$myConsole.debug('*** get url messages/warnings...')
                this.message = this.$route.query.message
                this.warning = this.$route.query.warning
                this.error = this.$route.query.error

                this.$myConsole.debug('url message: ' + this.message)

                const delayed_redirect = this.$route.params.delayed_redirect || this.$route.query.delayed_redirect
                if (delayed_redirect) {
                    this.$myConsole.debug('redirecting to ' + delayed_redirect)
                    this.delayedRedirect(this.message, 'message', delayed_redirect)
                }

                this.$myConsole.debug('Route Path: ' + JSON.stringify(path) + '; Mode: ' + this.mode)
                this.loadEnv()
            },
            demoLogin: function () {
                var user = this.demoRole

                console.log('logging in as ' + JSON.stringify(user))
                var form = {
                    email: user + '@sparcmeup.com',
                    password: 'demoPassword'
                }

                this.login(form)
            },
            clearLocalMessages: function () {
                this.message = ''
                this.warning = ''
                this.error = ''
                this.authError = ''
                this.formErrors = {}
                this.$myConsole.debug('cleared local messages...')
                this.$store.dispatch('clearMessages')
            },
            setToLogin: function (reset) {
                this.mode = 'Login'
                this.clearLocalMessages()
                this.adjustForEnv()
                this.$myConsole.debug('set login options: ')
                this.$myConsole.debug(JSON.stringify(this.loginOptions))
                if (reset) { this.clearLocalMessages() }
            },
            adjustForEnv: function () {
                if (this.env) {
                    if (this.nodeEnv === 'demo') {

                        this.loginOptions.header += ' (' + process.env.NODE_ENV + ' only)'
                    }
                    if (this.nodeEnv !== 'production') {

                        this.loginOptions.header += ' (' + process.env.NODE_ENV + ' only)'

                        if (this.mode === 'Login') {
                            this.loginOptions.fields[0].prompt += ' - try  guest@' + Config.defaultEmailDomain
                            this.loginOptions.fields[1].prompt += ' - use \'demoPassword\' for guest access'
                        }
                    }
                } else {
                    this.$myConsole.debug('no env')
                }
            },
            checkInput(e) {
                this.$myConsole.debug('validate input')
                if (e && e.target) {
                    const parent = e.target.parentElement
                    parent.classList.add('has-error')
                    this.note = 'Failed Validation'
                }
            },
            onChange(e) {
                this.$myConsole.debug('on change')
                if (e && e.target) {
                    this.$myConsole.debug('val: ' + e.target.name + ' = ' + e.target.value)
                }
            },
            onKeyup(e) {
                this.$myConsole.debug('on change')
                if (e && e.target) {
                    this.$myConsole.debug('val: ' + e.target.name + ' = ' + e.target.value)
                }

                if (e && e.target && e.target.name === 'token') {
                    this.$myConsole.debug('reset: ' + e.target.name + ' = ' + e.target.value)
                }
            },
            inputFocus(e) {
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
            inputValidate(e) {
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
            },
            back: function () {
                this.cancel()
                this.$router.go(-1)
            },
        },
        watch: {
            mode: function () {
                this.$myConsole.debug('reset mode to ' + this.mode)
            }
        }
    }
</script>

<style>
.error {
  font-weight: bold;
}
</style>
