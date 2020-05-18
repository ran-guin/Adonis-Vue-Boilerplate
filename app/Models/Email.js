'use strict'

const Model = use('Model')
const nodemailer = require("nodemailer");

const Env = use('Env')

const mailDriver = Env.get('MAIL_DRIVER', 'zoho')
const webUser = Env.get('EMAIL_USER', 'emailUser')
const webPass = Env.get('EMAIL_PASSWORD', 'emailPass')
const emailDomain = Env.get('EMAIL_DOMAIN', '@cosinesystems.org')

const appName = Env.get('APP_NAME', 'Cosine')
const url = Env.get('BASE_URL', 'https://cosinesystems.ca')

const Config = use('Config')
const Custom = Config.get('custom')

const Messages = {
  recover: {
    from: 'no-reply' + emailDomain,
    subject: appName + ' Password Recovery',
    text: "You have requested a password recover / reset.  Please click on the link below to reset your passord",
    html: "<a href='" + url + "/resetPassword'>Reset Password</a><p /><a href='" + url + "/fakeReset>I did not request a password reset!</a>"
  },
  welcome: {
      from: 'no-reply' + emailDomain,
      subject: 'Welcome to ' + appName,
      text: "Thank you for registering with " + appName + ".  Please click on the link below to complete your registration:",
      html: "<a href='" + url + "/confirmRegistration>Confirm Registration</a><p /><a href='" + url + "/cancelRegistration>Cancel Registration</a>"
  }
}

const MailHosts = {
  zoho: 'smtp.zoho.com',
  gmail: 'smtp.gmail.com'
}

class Email extends Model {

  static sendMessage (message) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();
    console.log('generate email message')
    console.log(JSON.stringify(message))

    var thisMessage = message
    if (message.constructor === Object && message.type) {
      console.log('use standard ' + message.type + ' Message')
      const type = message.type
      thisMessage = Messages[type]

      if (message.to) {
        thisMessage.to = message.to
      }
    } else {
      thisMessage = message
    }

    var subject = thisMessage.subject || 'Automated Message'
    var text = thisMessage.text || thisMessage.message
    var html = thisMessage.html
    var from = thisMessage.from || Config.EMAIL_SOURCE
    var to = thisMessage.to || thisMessage.forward

    var from_alias = thisMessage.alias 
    if (from_alias) { from = '"' + from_alias + '" <' + from + ">" }

    console.log('sendMessage: ' + JSON.stringify(thisMessage, null, 2))
    // create reusable transporter object using the default SMTP transport

    var auth = null
    if (webUser && webPass) {
      auth = {
        user: webUser,
        pass: webPass
      }
    }

    const transport = Custom.email_transporter || {
      host: MailHosts[mailDriver],
      port: 465,
      secure: true, // use SSL
      auth: auth
    }

    var transporter = nodemailer.createTransport(transport)

    // send mail with defined transport object
    var mailOptions = {
      from: from, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html // html body
    }

    console.log('defined transport settings...')
    // send mail with defined transport object

    if (! transporter) {
      return Promise.reject(new Error('rejected '))
    }
    // try {
    return transporter.sendMail(mailOptions)
      //   if(error) {
      //     console.log("error sending message: " + error.message)
          
      //     return Promise.reject(new Error(error.message))

      //     // throw new Error(error.message)
      //     // return new Promise((resolve, reject) => {
      //     //   reject(new Error(error.message));
      //     // });

      //   } else {
      //     // Preview only available when sending through an Ethereal account
      //     // if (nodemailer.getTestMessageUrl) {
      //     //   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
      //     // }
      //     console.log("message sent: " + info.response)
      //     return Promise.resolve('Message sent: ' + info.response)
      //   }
      // })
    // } catch (err) {
    //   console.log('failed to send mail via transporter ' + err.message)
    //   return Promise.reject("Failed transport delivery " + err.message)
    // }
  }

  static test (val) {
    console.log('test mailer: ' + val)

      return Promise.resolve({message: 'returnvalue'})
    // return new Promise(function(resolve, reject) {
    //   resolve({message: 'returnvalue'})
    // })
  }
  static failtest (val) {
    console.log('test mailer: ' + val)

    return Promise.reject(new Error('rejected '))
  }
  // main().catch(console.error);
  // }
}

module.exports = Email
