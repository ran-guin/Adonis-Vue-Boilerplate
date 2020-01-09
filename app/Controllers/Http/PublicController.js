'use strict'
const { validate } = use('Validator')
const Validator = use('Validator')
const Database = use('Database')
const Env = use('Env')
const Message = use('App/Models/Message')

const api_url = Env.get('API_URL', 'http://localhost')

class PublicController {
	async message ({request, response}) {
    const {message, email, role, redirect} = request.all()
    const rules = {
      email: 'required|email',
      message: 'required'
    }

    const validation = await Validator.validateAll(request.all(), rules)
    if (validation.fails()) {
      var errors = validation.messages()
      var errMsg
      if (errors && errors.length) {
        errMsg = errors[0].message
      }
      console.log('Failed registration validation' + JSON.stringify(validation.messages()))
      if (redirect) {
        response.redirect('contactUs?error=' + errMsg)
      } else {
        response.json( { error: 'Failed Validation', validation_errors: errors, rules: rules} )
      }
    } else {
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

  		console.log('submit message')
      try {
        var Msg = new Message()
        Msg.message = message
        Msg.role = role
        Msg.email = email
        Msg.sent = timestamp

        await Msg.save()
        if (redirect) {
          response.redirect(redirect + '?message=Thanks for the message')
        } else {
          response.json({success: true, message: 'Thanks for the message'})
        }
      } catch (error) {
        console.log('Err: ' + JSON.stringify(error))
        var msg = 'Failed to save message: ' + error
        response.json({error: msg})
      }
    }
	}

  test ({request, response, view, params}) {
    console.log('Loaded test page...')
    const param = params.param
    return view.render('pages/test', {scope: 'Test', param: param})
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

    response.redirect('/#/Recover?' + suffix)
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
    console.log('direct to welcome page with login mode')
    
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
      response.redirect('/#/Recover?' + suffix)
    } else {
    // return view.render('pages/login', {mode: 'login'})
      response.redirect('/#/Login?' + suffix)
    }
  }

  sslogin ({request, response, view, params}) {
    // return view.render('pages/login')
    console.log('direct to welcome page with login mode')
    return view.render('pages/login', {mode: 'login', root_url: api_url})
  }

  register ({request, response, view, params}) {
    const token = params.token
    response.redirect('/#/SignUp', {token: token, root_url: api_url})
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
