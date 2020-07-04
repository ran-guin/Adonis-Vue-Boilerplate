'use strict'

const { config } = require("process")
const Model = use('Model')

const Config = use('Config')
const Custom = Config.get('custom') || {}
const Email = Custom.email || {}

const Env = use('Env')

const mailDriver = Env.get('MAIL_DRIVER', 'zoho')
const emailDomain = Env.get('EMAIL_DOMAIN', '@cosinesystems.org')

const webUser = Env.get('EMAIL_USER', 'emailUser')
const webPass = Env.get('EMAIL_PASSWORD', 'emailPass')
const url = Custom.url

const MailHosts = {
    zoho: 'smtp.zoho.com',
    gmail: 'smtp.gmail.com'
}

class CustomEmail extends Model {
    transporter (driver) {
        var host = MailHosts[driver || mailDriver]
        var auth = {
            user: webUser,
            pass: webPass
        }
        console.log('transport host: ' + host)
        console.log('transport auth: ' + JSON.stringify(auth))
        return {
            host: host,
            port: 465,
            secure: true, // use SSL
            auth: auth
        }
    }

    Messages (input) {
        console.log('custom messages...')
        console.log(JSON.stringify(input))
        if (!input) { input = {} }
        else if (input.constructor === String) {
            input = {type: input}
        }

        const type = input.type
        const domain = input.domain || Email.defaultDomain
        const appName = input.appName || Custom.appName
        const url = input.url || Custom.url

        switch (input.type) {
            case "recover": return {
                from: 'no-reply' + domain,
                subject: this.appName + ' Password Recovery',
                text: "You have requested a password recover / reset.  Please click on the link below to reset your passord",
                html: "<a href='" + url + "/resetPassword'>Reset Password</a><p /><a href='" + url + "/fakeReset>I did not request a password reset!</a>"
            }
            case "welcome": return {
                from: 'no-reply' + domain,
                subject: 'Welcome to ' + appName,
                text: "Thank you for registering with " + appName + ".  Please click on the link below to complete your registration:",
                html: "<a href='" + url + "/confirmRegistration>Confirm Registration</a><p /><a href='" + url + "/cancelRegistration>Cancel Registration</a>"
            }
            case "invitation": return {
                from: 'no-replay' + domain,
                subject: 'Invitation to join SPARC',
                text: 'You have been invited to join SPARC - a non-commercial community platform to participate in and host local community events/activities of all kinds',
                html: "<a href='" + url + "/#/Register>Register</a><p /><a href='" + url + "/#/AboutSparc>Find out more</a>"
                
            }
            default: return null
        } 
    }
}

module.exports = CustomEmail
