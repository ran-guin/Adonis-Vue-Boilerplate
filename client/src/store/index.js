import Vue from 'vue'
import Vuex from 'vuex'

import login from './login'
import caching from './caching'
import messaging from './messaging'
import modal from './modal'
import custom from './custom'

import location from './location'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({

  state: {
    status: 'initialized'
  },

  modules: {
    login,
    caching,
    messaging,
    modal,
    custom,
    location
  },

  strict: debug
})

store.forceString = input => {
  console.log('force to string..')
  if (input.constructor === String) {
    console.log('from string')
    return input
  } else if (input.constructor === Array) {
    console.log('from array')
    if (input.length) {
      return JSON.stringify(input)
    } else {
      console.log('(no length)')
      return ''
    }
  } else if (input.constructor === Object) {
    console.log('from object')
    var keys = Object.keys(input)
    if (keys && keys.length) {
      return JSON.stringify(input)
    } else {
      return ''
    }
  } else {
    console.log('from undefined type')
    return JSON.stringify(input)
  }
}

store.forceArray = input => {
  if (input.constructor === Array) {
    return input
  } else if (input.constructor === String) {
    return [input]
  } else {
    return [JSON.stringify(input)]
  }
}

export default store
