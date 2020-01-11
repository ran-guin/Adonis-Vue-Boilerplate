<template lang='pug'>
  div.fullscreen
    PageLayout(page='Profile')
      div.myContainer
        div.wideMobileContainer
          div
            h2
              router-link(to='/Home')
                v-icon(name='home' scale=2 color="#337ab7") home
              span &nbsp; &nbsp; My Profile:
          p &nbsp; &nbsp;
          table.table.profile-table
            tr(v-for='info in public')
              td.profile-prompt {{info.prompt}}
              td.profile-value
                b {{payload[info.name]}}

            tr
              td.profile-prompt Documents Submitted:
              td.profile-value {{doc_count}}

            tr(v-if="payload && adminAccess")
              td &nbsp;
              td
                b.alert(style='padding: 5px') Visible only to admins:

            tr(v-for='info in private' v-if="adminAccess")
              td.profile-prompt {{info.prompt}}
              td.profile-value
                b.text-danger {{payload[info.name]}}

</template>

<script>
import PageLayout from '@/default/layouts/PageLayout'

export default {
  components: {
    PageLayout
  },
  data () {
    return {
      public: [
        {name: 'codeVersion', prompt: 'Code Version'},
        {name: 'username', prompt: 'Username'},
        {name: 'codeVersion', prompt: 'Code Version'},
        {name: 'kyc_level', prompt: 'KYC Level'},
        {name: 'email', prompt: 'Email'},
        {name: 'role', prompt: 'Role'}
      ],
      private: [
        {name: 'db', prompt: 'Database'},
        {name: 'db_user', prompt: 'DB User'},
        {name: 'login_id', prompt: 'login ID'},
        {name: 'userid', prompt: 'User ID'},
        {name: 'userid', prompt: 'User UUID'},
        {name: 'remoteAddress', prompt: 'Remote Address'}
      ],
      loaded: {}
    }
  },
  props: {
  },
  computed: {
    payload: function () {
      return this.$store.getters.payload || {}
    },
    doc_count: function () {
      var docs = this.$store.getters.kyc_docs
      if (docs) {
        return docs.length
      } else {
        return 0
      }
    },
    app_count: function () {
      var apps = this.$store.getters.kyc_apps
      if (apps) {
        return apps.length
      } else {
        return 0
      }
    },
    readable_token: function () {
      var token = this.$store.getters.localToken
      return token.replace(/\./g, '\n.')
    },
    adminAccess: function () {
      if (this.payload && (this.payload.role === 'Admin' || this.payload.role === 'Tester')) {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
  }
}
</script>

<style>
.profile-table {
  width: 100%;
}
tr {
  padding: 5px;
}
td.profile-prompt {
  width: 30%;
  text-align: right;
  padding: 10px;
}
td.profile-value {
  color: blue;
  padding: 10px;
}
</style>
