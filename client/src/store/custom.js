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

const state = {
}

const getters = {
}
const mutations = {
}
const actions = {
}

export default {
  state,
  getters,
  actions,
  mutations
}
