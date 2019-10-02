// src/auth/index.js

// import {router} from '../router/'
// import router from '../router/index.js'
import axios from 'axios'
import config from '@/config'
const apiURL = config.apiURL[process.env.NODE_ENV]

export default {

  // User object will let us check authentication status
  user: {
    authenticated: false
  },
  // call api to login and return token
  login (context, creds, redirect) {
    console.log('get auth.index.login for ' + process.env.NODE_ENV + ' : ' + apiURL)
    console.log('redirect to: ' + redirect)
    return axios.post(apiURL + '/login', creds)
  },
  // call api to register new user
  signup (context, creds, redirect) {
    console.log('post auth.index.signup ' + apiURL)
    console.log('redirect to: ' + redirect)
    return axios.post(apiURL + '/register', creds)
  },

  validate () {
    console.log('validate connection...')
    return axios.post(apiURL + '/check')
      .then(function (response) {
        console.log('validate: ' + JSON.stringify(response))
        return response
      })
      .catch(function (err) {
        console.log('validate error: ' + JSON.stringify(err))
        return {error: err}
      })
  },
  refresh () {
    console.log('refresh token in auth......')
    const refreshToken = localStorage.getItem('refresh-token')
    var data = {refresh_token: refreshToken}
    if (refreshToken) {
      console.log('POST: ' + apiURL + '/refreshToken')
      console.log('data: ' + JSON.stringify(data))
      return axios.post(apiURL + '/refreshToken', data)
    } else {
      console.log('no refresh token')
      return new Promise(function (resolve) {
        resolve({message: 'no refresh token'})
      })
    }
  },
  updateToken () {
    console.log('update token if required')
    const token = localStorage.getItem('user-token')
    console.log('token: ' + token)
    if (token) {
      var pass = 'Bearer ' + token
      axios.defaults.headers.common['Authorization'] = pass
      console.log('using auth token: ' + pass)
      return token
    } else {
      console.log('no current token')
      return null
    }
  },

  // To log out, we just need to remove the token
  logout (context, loginId) {
    console.log('logging out...')
    localStorage.removeItem('user-token')
    this.user.authenticated = false

    var data = {
      login_id: loginId
    }
    location.href = apiURL
    console.log('client side redirect to homepage')
    return axios.post(apiURL + '/logout', data)
  },
  // just update local authenticated flag
  checkAuth () {
    // var jwt = localStorage.getItem('id_token')
    // if (jwt) {
    //   this.user.authenticated = true
    // } else {
    //   this.user.authenticated = false
    // }
    console.log('check authentication... (under construction)')
  },

  // The object to be passed as a header for authenticated requests
  getAuthHeader () {
    return {
      'Authorization': 'Bearer ' + localStorage.getItem('access_token')
    }
  }
}
