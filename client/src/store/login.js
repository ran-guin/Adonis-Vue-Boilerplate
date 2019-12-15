import Vue from 'vue'
import Vuex from 'vuex'

import auth from './../auth'
import axios from 'axios'
import Config from '@/config.js'

Vue.use(Vuex)

const state = {
  token: '',
  refreshToken: '',
  status: '',
  payloadData: null,

  payloadHash: null,
  userTokens: {},
  refreshTokens: {},
  resetPayload: { access: 'public' }
}

const getters = {
  loggedIn: state => (state.status === 'success' || state.status === 'logged in'),
  isAuthenticated: state => !!state.token,
  authStatus: state => state.status,
  payloadHash: state => (id) => {
    if (state.id && !id) { 
      id = state.id || Config.CLIENT_ID
    }
    // const hash = JSON.parse(localStorage.getItem('payloadHash') || '{}') || state.payloadHash
    const hash = JSON.parse(state.payloadHash || localStorage.getItem('payloadHash'))
    const payload = hash[id] || {}
    return payload
  },
  // payload: state => (id) => {
  //   if (state.id && !id) {
  //     id = state.id || Config.CLIENT_ID
  //   }
  //   // const hash = JSON.parse(localStorage.getItem('payloadHash') || '{}') || state.payloadHash
  //   const hash = JSON.parse(state.payloadHash)
  //   const payload = hash[id] || {}
  //   return payload
  // },
  payload: state => {
    var pString = localStorage.getItem('payloadHash') || '{}'
    var pHash = JSON.parse(state.payloadHash || pString)
    console.debug(Config.CLIENT_ID + ' keyed payload returned: ')
    console.log(JSON.stringify(pHash))
    return pHash[Config.CLIENT_ID]
  },
  payload_old: state => {
    var payload = state.payloadData || JSON.parse(localStorage.getItem('payload') || '{}')
    return payload
    // var payload = state.payloadData || localStorage.getItem('payload')
    // if (payload && payload !== 'undefined') {
    //   console.log('retrieved payload: ' + payload)
    //   if (payload.constructor === String) {
    //     const defaultPayload = { access: 'public' }
    //     if (payload === '[object Object]') {
    //       payload = JSON.stringify(defaultPayload)
    //     } else if (payload === "{access: 'public'}") {
    //       payload = JSON.stringify(defaultPayload)
    //     } else if (payload === '{}') {
    //       payload = JSON.stringify(defaultPayload)
    //     } else if (payload === 'undefined') {
    //       payload = JSON.stringify(defaultPayload)
    //     }

    //     var parsed = JSON.parse(payload)
    //     console.log('parsed: ' + JSON.stringify(parsed))
    //     return parsed
    //   } else {
    //     console.log('O: ' + JSON.stringify(payload))
    //     return payload
    //   }
    // } else {
    //   return {access: 'public'}
    // }
  },
  token: state => {
    console.log('retrieved token: ' + state.token)
    return state.token
  },
  localToken: state => {
    var tkn = localStorage.getItem('user-token')
    console.log(state + ' local token retrieved: ' + tkn)
    return tkn
  },
  keyedToken: state => (id) => {
    console.log('state' + state)
    var Tkn = JSON.parse(localStorage.getItem('user-tokens') || '{}')
    console.log(id + ' local token retrieved: ' + Tkn[id])
    return Tkn[id]
  }
}

const actions = {
  CACHE_KEYED_PAYLOAD: ({commit}, options) => {
    commit('CACHE_KEYED_PAYLOAD', options)
  },
  CACHE_PAYLOAD: ({commit}, payload) => {
    commit('CACHE_KEYED_PAYLOAD', payload)
  },
  AUTH_TOKEN: ({commit}, token) => {
    if (token.constructor === String) {
      console.log('simple token')
      commit('AUTH_TOKEN', token)
    } else if (token.constructor === Object) {
      var t = token.token
      commit('AUTH_TOKEN', t)
      var rt = token.refreshToken
      console.log('object token + ' + rt)
      if (rt) {
        commit('REFRESH_TOKEN', rt)
      }
    }
  },
  AUTH_CLEAR: ({commit}, reset) => {
    commit('AUTH_CLEAR', reset)
  },
  AUTH_LOGOUT: ({commit}, reset) => {
    console.log('auth logout...')
    commit('AUTH_CLEAR', reset)
    commit('AUTH_LOGOUT')
  },
  LOAD_DEMO: ({commit}) => {
    return new Promise((resolve) => {
      var payload = {user: 'Demo', id: 3}
      commit('CACHE_PAYLOAD', payload)
      resolve()
    })
  },
  HTTP_ERROR: ({commit}, options) => {
    const key = options.key || Config.CLIENT_ID
    const status = options.status

    console.log('logout on http_error...' + status)
    const resetPayload = {access: 'public'}

    console.log('validate after HTTP error')
    auth.validate()
      .then(function (result) {
        console.log('validation result: ' + JSON.stringify(result))
        // commit('AUTH_CLEAR', resetPayload)
        commit('AUTH_CLEAR_KEY', {resetPayload, key})
        commit('AUTH_LOGOUT')
      })
      .catch(function (err) {
        console.log(err)
        // commit('AUTH_CLEAR', resetPayload)
        commit('AUTH_CLEAR_KEY', { resetPayload, key })
        commit('AUTH_LOGOUT')
        console.log('validation err: ' + JSON.stringify(err))
      })
  },
  RESET_EXPIRY: ({commit}) => {
    commit('RESET_EXPIRY')
  }
}

// basic mutations, showing loading, success, error to reflect the api call status and the token when loaded
const mutations = {
  RESET_EXPIRY: (state, key) => {
    console.log('refresh token')
    auth.refresh()
      .then(function (response) {
        console.log('refresh response: ' + JSON.stringify(response))
        if (response.data && response.data.token) {
          var token = response.data.token
          console.log('refreshed token: ' + token)
          var pass = 'Bearer ' + token
          axios.defaults.headers.common['Authorization'] = pass
          
          state.userTokens[key] = token
          localStorage.setItem('user-tokens', JSON.stringify(state.userTokens)) // clear your user's token from localstorage
          localStorage.setItem('user-token', token) // clear your user's token from localstorage
          console.log('reset token & auth header...')
          console.log(key + ' payload w/token: ' + state.payloadHash)
        } else if (response.data && response.data.expired) {
          state.status = 'logged out'
          state.token = null
          delete state.userTokens[key]
          delete state.refreshTokens[key]
          localStorage.setItem('user-tokens', JSON.stringify(state.userTokens))
          localStorage.setItem('refresh-tokens', JSON.stringify(state.refreshTokens))

          localStorage.removeItem('user-token')
          localStorage.removeItem('refresh-token')

          var payload = JSON.parse(state.payloadHash)
          delete payload[key]
          state.payloadHash = JSON.stringify(payload)

          localStorage.setItem('payloadHash', state.payloadHash || localStorage.getItem('payloadHash'))
          // localStorage.setItem('payload', JSON.stringify(state.resetPayload))
        } else {
          console.log('no token refresh found...')
        }
      })
      .catch(function (err) {
        console.log('Refresh Err: ' + err)
        if (err.request) {
          console.log('Header: ' + JSON.stringify(err.request))
        } else {
          console.log('reset Err: ' + JSON.stringify(err))
        }
        console.log(JSON.stringify(err))
      })
  },
  CACHE_KEYED_PAYLOAD: (state, options) => {
    const key = options.key || Config.CLIENT_ID

    var payload = JSON.parse(state.payloadHash)
    payload[key] = options.payload
    state.payloadHash = JSON.stringify(payload)

    console.log(key + ' key -> cache payload:' + state.payloadHash)
    localStorage.setItem('payloadHash', state.payloadHash)
  },
  CACHE_PAYLOAD: (state, payload) => {
    state.payloadData = payload || {access: 'public'}
    console.log('cache payload string from:' + JSON.stringify(payload))
    localStorage.setItem('payload', JSON.stringify(payload))
  },
  AUTH_TOKEN: (state, token) => {
    state.status = 'success'
    state.token = token
    console.log('save local token: ' + token)

    var pass = 'Bearer ' + token
    axios.defaults.headers.common['Authorization'] = pass

    localStorage.setItem('user-token', token) // clear your user's token from localstorage
  },
  REFRESH_TOKEN: (state, refreshToken) => {
    state.refreshToken = refreshToken
    console.log('save refresh Token: ' + refreshToken)

    axios.defaults.headers.common['refreshToken'] = refreshToken
    localStorage.setItem('refresh-token', refreshToken) // clear your user's token from localstorage
  },
  AUTH_ERROR: (state) => {
    state.status = 'error'
  },
  AUTH_LOGOUT: (state) => {
    state.status = 'logged out'
    state.token = null
  },
  AUTH_CLEAR: (state, reset) => {
    if (!reset) { reset = {access: 'public'} }

    localStorage.setItem('user-token', '')
    localStorage.setItem('payload', JSON.stringify(reset))
    state.payloadData = reset
    console.log('cleared local payload & token states')
    console.log(state.payloadData)
  },
  AUTH_CLEAR_KEY: (state, key) => {
    // if (!reset) { reset = { access: 'public' } }

    delete state.userTokens[key]
    localStorage.setItem('user-tokens', JSON.stringify(state.userTokens))
    // localStorage.setItem('payload', JSON.stringify(reset)

    var payload = JSON.parse(state.payloadHash)
    delete payload[key]
    state.payloadHash = JSON.stringify(payload)

    localStorage.setItem('payloadHash', state.payloadHash)
    console.log(key + ' payload cleared')
  }
}
// })

export default {
  state,
  getters,
  actions,
  mutations
}
