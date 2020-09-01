'use strict'
const { validate } = use('Validator')
const Validator = use('Validator')
const Database = use('Database')
const Env = use('Env')
const Message = use('App/Models/Message')
const Notification = use('App/Models/Notification')
const Contact = use('App/Models/Contact')
const Email = use('App/Models/Email')
const User = use('App/Models/User')

const api_url = Env.get('API_URL', 'http://localhost')

class PublicController {

  async sendMessage ({request, response}) {
    const input = request.all()
    const {message, user_id, from, to, cc, forward, subject, cache, type} = input

    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (from && !to) {
      forward = 'ran.guin+cosine@gmail.com'
    }

    var emailResponse
    var status
    await Email.sendMessage(input)
    .then (resp => {
      console.log('email sent: ' + JSON.stringify(resp))
      emailResponse = resp
      status = 'sent'
    })
    .catch (err => {
      console.log("err: " + err.message)
      emailResponse = err.message
      response.json({success: false, message: err.message})
      status = 'failed'
    })

    if (cache) {
      console.log('cache message')
      var warning
      try {
        var Notice = new Notification()
        Notice.message = message
        Notice.sent = timestamp
        Notice.user_id = user_id
        Notice.status = status

        await Notice.save()
        message = 'sent notification and cached messaged'
      } catch (error) {
        console.log('Err: ' + JSON.stringify(error))
        warning = 'Failed to cache message: ' + error.message
      }
    }    
    response.json({success: true, message: message, warning: warning})
	}

	async receiveMessage ({request, response}) {
    const input = request.all()
    const {message, email, to, forward, subject, phone, role, redirect, cache} = input
  
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (!to && !forward) {
      input.forward = 'ran.guin+forward@gmail.com'
    }
    delete input.from

    var emailResponse
    await Email.sendMessage(input)
    .then (resp => {
      console.log('email sent: ' + JSON.stringify(resp))
      emailResponse = resp
    })
    .catch (err => {
      console.log("err: " + err.message)
      emailResponse = err.message
    })

    if (cache  && email) {
      console.log('cache received message')

      var warning
      var msg
      try {
        var oldContact = await Contact.findBy('email', email)
        var oldUser = await User.findBy('email', email)

        var contact_id
        if (oldContact) {
          contact_id = oldContact.id
          console.log('found existing contact: ' + contact_id)
        } else {
          var contact = new Contact()
          contact.email = email
          contact.phone = phone

          if (oldUser) {
            contact.user_id = existing.id
            console.log('using existing user ' + existing.id)
          } else {
            var anon = await User.findBy('username', 'Anonymous')
            contact.user_id = anon.id
            console.log('using anonymous user ' + anon.id)
          }
          console.log('saving contact: ' + JSON.stringify(contact))
          await contact.save()
          contact_id = contact.id
        }

        var Msg = new Message()
        Msg.message = message
        Msg.role = role
        Msg.sent = timestamp
        Msg.contact_id = contact_id

        await Msg.save()
        msg = 'sent email and cached messaged'
      } catch (error) {
        console.log('Err: ' + JSON.stringify(error))
        warning = 'Failed to save message: ' + error.message
      }

      if (!msg) { msg = 'Thanks for the message'}

      if (redirect) {
        response.redirect(redirect + '?message=' + msg)
      } else {
        response.json({success: true, message: msg, warning: warning})
      }
    } else {
      console.log('message not cached...')
      response.json({success: true, message: 'Thank you for your message', response: emailResponse})
    }
	}

  test ({request, response, view, params}) {
    console.log('Loaded test page...')
    const param = params.param
    // return view.render('pages/test', {scope: 'Test', param: param})
    return response.json({ page: 'pages/test', scope: 'Test', param: param })
  }

  landingPage ({request, response, view, params}) {
    const {source, message, error} = request.all()
    const target = params.target || 'user'
    console.log('Loaded landing page with message: ' + message + ': ' + error)

    var atts = ''
    if (message) {
      atts = atts + 'message=' + message + '&'
    }
    if (error) {
      atts = atts + 'error=' + error
    }

    if (target === 'test') {
      return view.render('pages/testPage', {root_url: api_url })      
    } else if (target === 'investor') {
      return view.render('pages/investor', { root_url: api_url })
    } else {
      return view.render('pages/landingPage', { message: message, error: error, root_url: api_url })
    }
  }

  faqs ({request, response, view, params}) {
    const {payload} = request.all()
    const faq = params.faq
    const p2 = params.payload
    console.log('faqs payload: ' + payload + ' or ' + p2)
    console.log(JSON.stringify(p2))
    if (faq) {
      console.log('FAQ: ' + faq)
    }
    return view.render('pages/faqs', {faq: faq, root_url: api_url})
  }

  team ({request, response, view, params}) {
    const member = params.member
    if (member) {
      console.log('Member: ' + member)
    }
    return view.render('pages/team', {member: member, root_url: api_url})
  }

  contactUs ({request, response, view, params}) {
    const {from, message, error} = request.all()
    // const from = params.from
    if (from) {
      console.log('From: ' + from)
    }
    return view.render('pages/contactUs', {from: from, message: message, error: error, root_url: api_url})
  }

  investors ({request, response, view, params}) {
    const {payload} = request.all()
    return view.render('pages/investor', {root_url: api_url})
  }
  
  recoverPassword ({request, response, view, params}) {
    const {message, warning, error} = request.all()
    
    var suffix = 'launch=Recover'
    if (message) {
      suffix = suffix + 'message=' + message + '&'
    }
    if (warning) {
      suffix = suffix + 'warning=' + warning + '&'
    }
    if (error) {
      suffix = suffix + 'error=' + error + '&'
    }

    response.redirect('/#/Public?' + suffix)
  }
  
  public ({request, response, view, params}) {
    // return view.render('pages/public') // server side page
      response.redirect('/#/Public')
  }
  about ({request, response, view, params}) {
    // return view.render('pages/about') // server side page
      response.redirect('/#/About')
  }
  contact ({request, response, view, params}) {
    // return view.render('pages/about') // server side page
      response.redirect('/#/Contact')
  }

  login ({request, response, view, params}) {
    const {message, warning, error} = request.all()
    const type = params.type
    // return view.render('pages/login')
    console.log('direct to welcome page with login mode ' + type)
    
    var suffix = ''
    if (message) {
      suffix = suffix + 'message=' + message + '&'
    }
    if (warning) {
      suffix = suffix + 'warning=' + warning + '&'
    }
    if (error) {
      suffix = suffix + 'error=' + error + '&'
    }

    if (type === 'Recover') {
      response.redirect('/#/Public?launch=Recover&' + suffix)
    } else if (type === 'ResetPassword') {
      console.log('launch reset...')
      response.redirect('/#/Public?launch=ResetPassword&' + suffix)
    } else {
      // return view.render('pages/login', {mode: 'login'})
      console.log('launch login page...')
      response.redirect('/#/Public?launch=Login&' + suffix)
    }
  }

  sslogin ({request, response, view, params}) {
    // return view.render('pages/login')
    console.log('direct to welcome page with login mode')
    return view.render('pages/login', {mode: 'login', root_url: api_url})
  }

  register ({request, response, view, params}) {
    const token = params.token
    response.redirect('/#/Login?launch=Register&token=' + token)
    // return view.render('pages/register') - requires way to pass payload & token to client
  }

  newsletter ({request, response, view, params}) {
    return view.render('pages/newsletter', {root_url: api_url})
  }

  construction ({request, response, view, params}) {
    return view.render('pages/construction')
  }

}
module.exports = PublicController
