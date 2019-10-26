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
  login (context, creds) {
    console.debug('get auth.index.login for ' + process.env.NODE_ENV + ' : ' + apiURL)
    return axios.post(apiURL + '/login', creds)
  },
  // call api to register new user
  signup (context, creds) {
    console.debug('post auth.index.signup ' + apiURL)
    return axios.post(apiURL + '/register', creds)
  },

  async validate (root) {
    console.debug('validate connection...' + apiURL)
    var _this = this
    return axios.post(apiURL + '/check')
      .then(function (response) {
        console.debug('validate connection status: ' + JSON.stringify(response))
        if (response && response.data && response.data.logged_in) {
          console.debug('still logged in...')
        } else {
          _this.logout(root, 'expired')
        }
        return response
      })
      .catch(function (err) {
        console.debug('validate error: ' + JSON.stringify(err))
        return {error: err}
      })
  },
  refresh () {
    console.debug('refresh token in auth......')
    const refreshToken = localStorage.getItem('refresh-token')
    var data = {refresh_token: refreshToken}
    if (refreshToken) {
      console.debug('POST: ' + apiURL + '/refreshToken')
      console.debug('data: ' + JSON.stringify(data))
      return axios.post(apiURL + '/refreshToken', data)
    } else {
      console.debug('no refresh token')
      return new Promise(function (resolve) {
        resolve({message: 'no refresh token'})
      })
    }
  },
  updateToken () {
    console.debug('update token if required')
    const token = localStorage.getItem('user-token')
    console.debug('token: ' + token)
    if (token) {
      var pass = 'Bearer ' + token
      axios.defaults.headers.common['Authorization'] = pass
      console.debug('using auth token: ' + pass)
      return token
    } else {
      console.debug('no current token')
      return null
    }
  },

  // To log out, we just need to remove the token
  logout (root, context) {
    try {
      var loginId
      if (root.payload && root.payload.login_id) {
        loginId = root.payload.login_id
      }
  
      if (loginId) {
        var data = {
          login_id: loginId,
          note: context
        }
        // location.href = apiURL
        axios.post(apiURL + '/logout', data)
        root.$store.dispatch('AUTH_LOGOUT')
      }
    } catch (err) {
      console.log('logout error:' + err)
    }
    // this.$store.dispatch('AUTH_LOGOUT')
  },
  // just update local authenticated flag
  checkAuth () {
    // var jwt = localStorage.getItem('id_token')
    // if (jwt) {
    //   this.user.authenticated = true
    // } else {
    //   this.user.authenticated = false
    // }
    console.debug('check authentication... (under construction)')
  },

  // The object to be passed as a header for authenticated requests
  getAuthHeader () {
    return {
      'Authorization': 'Bearer ' + localStorage.getItem('access_token')
    }
  }
}
