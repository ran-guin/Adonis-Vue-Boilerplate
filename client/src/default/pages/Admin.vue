<template lang='pug'>
  PageLayout
    h2 Admin Page
    v-tabs(fixed-tabs)
      v-tab.tabBar(v-for='item in pages' :key='item')
        b.contrast {{item}}

      v-tab-item(v-for="item in pages" :key="item")
        v-card
          v-card-text(v-if="item==='Messages'")
            h4 Messages sent from 'Contact Us' page:
            button.btn.btn-primary(v-on:click="getMessages") View Messages
            hr
            <!-- DataGrid(v-if='data' :data='data') -->
          v-card-text(v-else-if="item==='Docs'")
            rgv-docs(:scopes='scopes' :docs='docs')
          v-card-text(v-else-if="item==='Stats'")
            h4 Custom Stats to be developed
            ul
              li Total Users (by KYC)
              li New Users
              li Added Apps
              li Registered IDs
              li Verified IDs
              li Logins by Users/Guarantors
            hr
            button.btn.btn-primary(v-on:click="monitor('Stats')") Current Users / IDs
            hr
            <!-- DataGrid(v-if='data' :data='data') -->
          v-card-text(v-else-if="item==='Accounts'")
            rgv-modal(prompt='Send Invitation' :form='inviteOptions' :message='inviteMessage')

            h3 Monitor:
            div.myContainer
              ul
              <!-- h3 User Lists -->
                li
                  a.contrast(v-on:click="monitor('ListUsers')") Users

              <!-- h3 Beta Requests -->
                li
                  a.contrast(v-on:click="monitor('BetaRequests'); return false;") Beta Access Requests

              <!-- h3 User Accounts -->
                li
                  a.contrast(v-on:click="monitor('Logins')") Login Sessions

              <!-- h3 Password Recovery -->
                li
                  a.contrast(v-on:click="monitor('Recovery')") Password Recovery Attempts

              <!-- h3 User Accounts -->
                li
                  a.contrast(v-on:click="monitor('ClaimRequests')") Claim Requests

              <!-- h3 Guarantors -->
                li
                  a.contrast(v-on:click="monitor('Access')") Guarantor Access

            <!-- h3 Vendors -->
            h4 Manage vendor accounts:
            div.myContainer

              <!-- h3 Documents -->
              router-link(to='DocTypes')
                li
                  a.contrast Check Document Types

            <!-- DataGrid(v-if='data' :data='data') -->
          v-card-text(v-else-if="item==='Monitor DB'")
            h4 General Monitoring
            ul
              li Users
              li Beta Requests
            h4 irregularities
            ul
              li Logins without tracked logout
              li kyc level not consistent with verified id
              li app subscription without appropriate kyc level
          v-card-text(v-else)
            b {{item}} ??
    p &nbsp;
    rgv-modal(id='adminModal' type='data' :options='modal_options' :data='data' :note='note')
    <!-- VModal(id='adminModal' :data='data' :fullscreen='true') -->

    p &nbsp;
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import config from '@/config'
import axios from 'axios'

export default {
  components: {
    PageLayout
  },
  data () {
    return {
      dialog: false,
      showInvite: false,
      inviteMessage: 'Generate invitation...',
      inviteError: '',
      true: true,
      false: false,
      show: 'Stats',
      pages: ['Messages', 'Docs', 'Stats', 'Accounts', 'Monitor DB'],
      rendered: '',
      doc: '/static/DatabaseProtocol.md',
      modal_options: {
        show: false,
        id: 'adminModal',
        fullscreen: true
      },
      note: '',
      data: [],

      scopes: ['private', 'public'],
      docs: [
        // {name: 'Use Case Variations', file: 'Use_Cases.md', scope: 'private'},
        {name: 'Database Protocol', file: 'Database_Protocol.md', scope: 'private'},
        {name: 'Release Protocol', file: 'Release_Protocol.md', scope: 'private'},
        {name: 'Data Structures', file: 'Data_Structures.md', scope: 'private'},
        {name: 'Web Versions', file: 'Versions.md', scope: 'public'},
        {name: 'Use Cases', file: 'Use_Cases.md', scope: 'public'},
        {name: 'QA Testing', file: 'QA_Testing.md', scope: 'private'},
        {name: 'Vendor API', file: 'api-public.md', scope: 'public'},
        {name: 'Data Diagram', file: 'dataStructures.png', scope: 'public', type: 'image'}
      ],
      inviteOptions: {
        id: 'sendInvite',
        onSubmit: this.sendInvite,
        fields: [
          {name: 'email', prompt: 'Email Address', type: 'email', icon: 'email', rules: [config.rules.email]}
        ]
      },
      apiURL: config.apiURL[process.env.NODE_ENV]
    }
  },
  props: {
    // payload: {
    //   type: Object,
    //   default: null
    // },
  },
  created: function () {
    if (this.payload && (this.payload.role !== 'Admin' && this.payload.role !== 'Tester')) {
      this.$router.push('/Home')
    }
    console.log('add userid: ' + this.payload.userid)
    const host = {name: 'host', type: 'hidden', value: this.payload.userid}
    this.inviteOptions.fields[1] = host
  },
  computed: {
    payload: function () {
      return this.$store.getters.payload || {}
    }
  },
  watch: {
    payload: function () {
      console.log('recheck payload...')
      if (this.payload && this.payload.role !== 'Admin' && this.payload.role !== 'Tester') {
        const host = {name: 'host', type: 'hidden', value: this.payload.userid}
        this.inviteOptions.fields[1] = host
        this.$router.push('/Home')
      } else if (!this.payload) {
        console.log('no payload yet')
      }
    }
  },
  methods: {
    showPage: function (page) {
      this.show = page
    },
    getMessages: function () {
      const url = this.apiURL + '/messages'
      const filter = {}
      var _this = this
      axios.post(url, filter)
        // axios.get(geturl)
        .then(function (response) {
          if (response.data) {
            console.log('loaded messages')
            console.log(JSON.stringify(response.data))
            _this.$set(_this, 'data', response.data)
            _this.$store.dispatch('toggleModal', 'adminModal')
          } else {
            _this.$set(_this, 'data', {})
          }
        })
        .catch(function (error) {
          var msg = 'Error retrieving messages: ' + error
          _this.$store.dispatch('logWarning', msg)
        })
    },
    monitor: function (scope) {
      var url = this.apiURL + '/view' + scope
      // if (scope === 'Access') {
      //   url += '/viewAccess'
      // } else if (scope === 'Logins') {
      //   url += '/viewLogins'
      // } else {
      //   this.$store.dispatch('logWarning', 'Unrecognized monitor requested: ' + scope)
      // }

      console.log('query: ' + url)
      this.$set(this.modal_options, 'title', 'Monitor ' + scope)
      var _this = this
      axios.post(url)
        // axios.get(geturl)
        .then(function (response) {
          if (response.data) {
            console.log('loaded access data')
            console.log(JSON.stringify(response.data))
            _this.$set(_this, 'data', response.data.data)
            _this.note = response.data.message
            _this.$store.dispatch('toggleModal', 'adminModal')
          } else {
            _this.$set(_this, 'data', {})
          }
        })
        .catch(function (error) {
          var msg = 'Error retrieving access information: ' + error
          _this.$store.dispatch('logWarning', msg)
        })
    },
    sendInvite: function (form) {
      var url = this.apiURL + '/sendInvite'

      console.log('send invite via API')
      console.log(JSON.stringify(form))

      this.$set(this, 'inviteError', '')
      this.$set(this, 'inviteMessage', '')

      var _this = this
      console.log('call ' + url)
      axios.post(url, form)
        .then(function (response) {
          if (response.data) {
            console.log(JSON.stringify(response.data))
            _this.$set(_this, 'inviteMessage', response.data.message)
            if (response.data.success) {
              _this.showInvite = false
            }
          } else {
            console.log('no response data')
            _this.$set(_this, 'inviteError', 'Error generating invitation')
          }
        })
        .catch(function (error) {
          console.log('error calling invite: ' + error)
          _this.$set(_this, 'inviteError', 'Error generating invitation: ' + error)
        })

    }
  }
}
</script>

<style>
.tabBar {
  height: 55px;
}
</style>
