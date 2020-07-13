const config = '@/config'

export default {
  zohoMail(Message) {
    // Requires config for: EMAIL_SOURCE (eg info@cosinesystems.org), EMAIL_SOURCE_PASSWORD
    var subject = Message.subject || 'Automated Message'
    var text = Message.text
    var html = Message.html
    var from = Message.from || config.EMAIL_SOURCE
    var to = Message.to
    var mailPwd = config.EMAIL_SOURCE_PASSWORD
    var from_alias = Message.alias || 'Cosine Systems'

    if (!(to && from)) {
      return Promise.reject(new Error('Missing source or target email address'));
    } else if (!mailPwd) {
      return Promise.reject(new Error('Email Password not defined'));
    } else if (!(text || html)) {
      return Promise.reject(new Error('Missing body'));
    } else {
      if (to && from (text || html)) {
        var transporter = nodemailer.createTransport({
          host: 'smtp.zoho.com',
          port: 465,
          secure: true, // use SSL
          auth: {
              user: from,
              pass: mailPwd
          }
        });
      
        // setup e-mail data, even with unicode symbols
        var mailOptions = {
            from: '"' + from_alias + '" ' + from, // sender address (who sends)
            to: to, // list of receivers (who receives)
            subject: subject, // Subject line
            text: text, // plaintext body
            html: html // html body
        };
        
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return Promise.reject(new Error(error));
            } else {
                return Promise.resolve('Message sent: ' + info.response)
            } 
        });      
      }
    }
  }
}
