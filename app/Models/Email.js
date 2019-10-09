'use strict'

const Model = use('Model')
const nodemailer = require("nodemailer");

const Env = use('Env')
const webUser = Env.get('EMAIL_USER', 'emailUser')
const webPass = Env.get('EMAIL_PASSWORD', 'emailPass')

const Messages = {
  recover: {
    from: 'no-reply@pgkyc.com',
    subject: 'PGKYC Password Recovery',
    text: "You have requested a password recover / reset.  Please click on the link below to reset your passord",
    html: "<a href='https://pgkyc.com/resetPassword'>Reset Password</a><p /><a href='https://pgkyc.com/fakeReset>I did not request a password reset!</a>"
  },
  welcome: {
      from: 'no-reply@pgkyc.com',
      subject: 'Welcome to PGKYC',
      text: "Thank you for registering with PGKYC.  Please click on the link below to complete your registration:",
      html: "<a href='https://pgkyc.com/confirmRegistration>Confirm Registration</a><p /><a href='https://pgkyc.com/cancelRegistration>Cancel Registration</a>"
  }
}

class Email extends Model {

  static async sendMessage (message) {
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
    }

    console.log('sendMessage: ' + JSON.stringify(thisMessage, null, 2))
    // create reusable transporter object using the default SMTP transport

    var auth = null
    if (webUser && webPass) {
      auth = {
        user: webUser,
        pass: webPass
      }
    }

    try {
      let transporter = nodemailer.createTransport({
        // host: "smtp.ethereal.email",
        host: "mail.pgkyc.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: auth,
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log('send message from ' + webUser)

      const from = thisMessage.from || 'default@pgkyc.com'
      const to = thisMessage.to || 'no-target@pgkyc.com'
      const subject = thisMessage.subject || 'No subject'
      const text = thisMessage.text || 'No body'
      const html = thisMessage.html || ''

      // send mail with defined transport object
      var info = await transporter.sendMail({
        from: from, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html // html body
      });

      console.log("Message sent: " + JSON.stringify(info));
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      return {success: true}
    } catch (err) {
      console.log('Error generating SMTP message: ' + err)
      return {success: false}
    }
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }

  static test (val) {
    console.log('test mailer: ' + val)

    return new Promise(function(resolve, reject) {
      resolve('returnvalue')
    })
  }
  // main().catch(console.error);
  // }
}

module.exports = Email
