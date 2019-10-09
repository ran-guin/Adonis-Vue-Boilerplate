<template lang='pug'>
  v-app-bar(app)
    Logo(style='flex: 1')
    span(style='flex:3') Connecting Communities One Event at a Time...
    v-spacer
    v-tabs(style='flex:2' right hide-slider)
      v-tab(v-for='link in headerLinks' :key='link.name')
        router-link(v-if='visible(link)' :to='link.target || link.name')
          v-btn.btn-primary {{link.name}}
</template>

<script>
import Logo from '@/components/Standard/Logo'

export default {
  data () {
    return {
      publicHeaders: [
        {name: 'About', public: true},
        {name: 'Login', public: true}
      ],
      privateHeaders: [
        {name: 'Logout', private: true},
        {name: 'Admin', private: true, access: 'admin', target: 'admin'},
        {name: 'Data', private: true},
        {name: 'Home', private: true}
      ]
    }
  },
  components: {
    Logo
  },
  computed: {
    headerLinks: function () {
      if (this.payload && this.payload.userid) {
        return this.privateHeaders
      } else {
        return this.publicHeaders
      }
    },
    payload: function () {
      return this.$store.getters.payload || {}
    }
  },
  methods: {
    visible: function (link) {
      if (link.access === 'admin') {
        return (this.payload.access === 'admin')
      } else {
        return true
      }
    }
  }
}
</script>
<style>
.v-toolbar__content {
  align-items: center;
}
</style>
