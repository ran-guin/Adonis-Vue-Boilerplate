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
const defaultEmail = Email.domain || Env.get('EMAIL_DEFAULT', 'no-reply')
const defaultDomain = Email.default || Env.get('EMAIL_DOMAIN', '@sparcmeup.com')
const defaultCC = Email.default || Env.get('EMAIL_CC')

const url = Custom.url || 'https://sparc.idvpn.ca'

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
        const domain = input.domain || defaultDomain
        var from = input.from || defaultEmail
        const appName = input.appName || Custom.appName
        const myUrl = input.url || url
        const token = input.token

        if ( !from.match(/@/) ) {
            from = from + domain
        }

        switch (input.type) {
            case "recover": return {
                from: from,
                subject: this.appName + ' Password Recovery',
                html: "You have requested a password recover / reset.  Please click on the link below to reset your passord"
                    + "<a href='" + myUrl + "/resetPassword" + "?token=" + token + "'>Reset Password</a>"
                    + "<p /><a href='" + myUrl + "/fakeReset" + "?token=" + token + "'>I did not request a password reset!</a>",
                cc: defaultCC
            }
            case "welcome": return {
                from: from,
                subject: 'Welcome to ' + appName,
                html: "Thank you for registering with " + appName + ".  Please click on the link below to complete your registration:"
                    + "<a href='" + myUrl + "/confirmRegistration" + "?token=" + token + "'>Confirm Registration</a>"
                    + "<p /><a href='" + myUrl + "/cancelRegistration" + "?token=" + token + "'>Cancel Registration</a>",
                cc: defaultCC
                }
            case "invitation": return {
                from: from,
                subject: 'Invitation to join SPARC',
                html: 'You have been invited to join SPARC - (' + myUrl + ')<P>SPARC is a non-commercial community platform to participate in and host local community events/activities of all kinds'
                    + "<a href='" + myUrl + "/#/Register" + "?token=" + token + "'>Register</a>"
                    + "<p /><a href='" + myUrl + "/#/AboutSparc'>Find out more</a>",
                cc: defaultCC               
            }
            case "reminder": return {
                from: from,
                subject: 'Another Invitation to join SPARC',
                html: 'You have been invited again to join SPARC - (' + myUrl + ')<P>SPARC is a non-commercial community platform to participate in and host local community events/activities of all kinds'
                    + "<a href='" + myUrl + "/#/Register" + "?token=" + token + "'>Register</a>"
                    + "<p /><a href='" + myUrl + "/#/AboutSparc'>Find out more</a>",
                cc: defaultCC
                }
            default: return null
        } 
    }
}

module.exports = CustomEmail
