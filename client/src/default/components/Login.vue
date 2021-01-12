<template lang='pug'>
  div.centred(style='background-color: white')
    EmbeddedMessage(:clear='clearOnToggle')

    div(v-if='nodeEnv==="demo" || nodeEnv=="local"')
      h4 Login to Demo Version as:
      v-container
        v-radio-group(v-model='demoRole')
          v-layout.justify-space-around
            v-radio(v-for='pwd, loginAs in demoLogins' :value='loginAs' :label='loginAs')
      v-btn.btn-primary(@click='demoLogin') Login to Demo Version
      p &nbsp;
    div(v-else)
      rgv-form.login-form(:form='form' :options='loginOptions' :remoteErrors='formErrors' :onCancel='cancel')
    hr
    a.text-sm(v-if='onRecover' @click='onRecover()') Forgot password ?
    br
    a.text-sm(v-if='onRegister' @click='onRegister()') Sign Up
    p.error(v-if='authError') {{authError}}
    p &nbsp;
</template>
<script>
    import Config from '@/config.js'

    // import { rgvForm } from '@ran-guin/forms'
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
        data() {
            return {
                demoRole: '',
                mode: '',
                noLogin: true, // hide login buttons when generating login page
                form: {
                    email: '',
                    password: ''
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
              
                noRefresh: true,
                redirect_default: Config.lpURL[process.env.NODE_ENV],
                rules: Config.rules,
                invitationRequired: false,
                redirect_uri: '',
                demoLogins: Config.demoLogins,
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
            },
            clearOnToggle: {
                type: Boolean
            }
        },
        async created () {
            if (this.onRegister) {
                this.$myConsole.debug('onRegister supplied')
            }
            if (this.onRecover) {
                this.$myConsole.debug('onRecover supplied')
            }

            var redirect_uri = this.redirect || this.$route.query.redirect || this.$route.query.redirect_uri
            if (redirect_uri) {
                this.setRedirect(redirect_uri)
            }          

            if (this.page === 'Logout') {
                console.log('logout')
                await this.logout()
                console.log('logged out')
                this.$router.push('/Public')
            } else {
                this.setup()
            }
        },
        updated: function () {
            this.$set(this.form, 'password', '')
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
                    if (val) {  this.$set(this.form, presets[i], val) }
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

                const delayed_redirect = this.$route.params.delayed_redirect || this.$route.query.delayed_redirect
                const message = this.$route.params.message || this.$route.query.message
                if (delayed_redirect) {
                    this.$myConsole.debug('redirecting to ' + delayed_redirect)
                    this.delayedRedirect(message, 'message', delayed_redirect)
                }

                this.$myConsole.debug('Route Path: ' + JSON.stringify(path) + '; Mode: ' + this.mode)
                this.loadEnv()
            },
            demoLogin: function () {
                var role = this.demoRole

                console.log('logging in as ' + JSON.stringify(role))
                var form = {
                    email: 'demo' + role + '@sparcmeup.com',
                    password: this.demoLogins[role]
                }

                this.login(form)
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
                this.clearMessages()
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
            clearMessages() {
                this.clearOnToggle = !this.clearOnToggle
            }
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
