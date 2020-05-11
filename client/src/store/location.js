
/** Generic cashing functionality for store

Standard getters:
  active_id
  status(key)
  getHash(key)

Standard actions:

  activate(id)
  status('page', 'loaded')
  setHash('patient', {name: 'John', id: 123})

**/

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const USER_REQUEST = 'USER_REQUEST'

const state = {
  latitude: null,
  status: { found: false },
  hash: {},
  longitude: {},
  position: {},
  formatted_address: {},
  updates: 1
}

const getters = {
  homePosition: state => {
    var cached = localStorage.getItem('cachedHomePosition')
    if (cached) {
        var position = JSON.parse(cached)
        console.log('retrieved cached position: ' + JSON.stringify(position))
        return position
    } else {
        console.log('retrieved state position: ' + JSON.stringify(state.position))
        return state.position
    }
  },
}

const mutations = {
  setHomePosition (state, position) {
    console.log('set Home Position to ' + JSON.stringify(position))
    Vue.set(state.position, 'lat', position.lat)
    Vue.set(state.position, 'lng', position.lng)
    localStorage.setItem('cachedHomePosition', JSON.stringify(position))
  }
}

// basic mutations, showing loading, success, error to reflect the api call status and the token when loaded
const actions = {
  setHomePosition (state, position) {
    state.commit('setHomePosition', position)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
