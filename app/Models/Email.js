'use strict'

const Model = use('Model')

const nodemailer = require("nodemailer");

const Config = use('Config')
const Custom = Config.get('custom')
const email = Custom.email || {}

var CustomEmail
try {
  CustomEmail = use('App/Models/CustomEmail')
  console.log('loaded custom email model...')
} catch (err) {
  console.log('Custom Email module not defined...' + err.message)
}

class Email extends Model {

  static sendMessage (message, options) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();
    console.log('generate email message')
    console.log(JSON.stringify(message))

    var thisMessage = message || {}
    if (CustomEmail) {
      const email = new CustomEmail()

      thisMessage = email.Messages(message) || message
      console.log('Std: ' + JSON.stringify(thisMessage))

      if (message.constructor === Object) {
        var keys = Object.keys(message)
        for (var i = 0; i < keys.length; i++) {
          thisMessage[keys[i]] = message[keys[i]]
        }
  
        if (options) {
          console.debug('add options: ' + JSON.stringify(options))
        }
      }

      var subject = thisMessage.subject || 'Automated Message'
      var text = thisMessage.text || thisMessage.message
      var html = thisMessage.html
      var from = thisMessage.from || Config.EMAIL_SOURCE
      var to = thisMessage.to || thisMessage.forward

      var from_alias = thisMessage.alias 
      if (from_alias) { from = '"' + from_alias + '" <' + from + ">" }

      console.log('sendMessage: ' + JSON.stringify(thisMessage, null, 2))

      const transport = email.transporter() || {}

      console.log('defined transport settings...')
      console.debug('transport: ' + JSON.stringify(transport))

      var transporter = nodemailer.createTransport(transport)

      // send mail with defined transport object
      var mailOptions = {
        from: from, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html // html body
      }
      console.debug('Mail options: ' + JSON.stringify(mailOptions))
      if (! transporter) {
        return Promise.reject(new Error('rejected '))
      }
      // try {
      return transporter.sendMail(mailOptions)
    } else {
      console.log('Custom email not defined')
      return {success: false, message: 'No CustomEmail module defined'}
    }
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
