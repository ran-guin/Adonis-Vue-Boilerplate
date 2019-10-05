<template lang='pug'>
  v-app-bar(app)
    Logo(style='flex: 1')
    span(style='flex:3') Connecting Communities One Event at a Time...
    v-spacer
    v-tabs(style='flex:2' right hide-slider)
      v-tab(v-if='link.public' v-for='link in headerLinks' :key='link.name')
        router-link(:to='link.target || link.name')
          v-btn.btn-primary {{link.name}}
</template>

<script>
import Logo from '@/components/Standard/Logo'

export default {
  data () {
    return {
      headerLinks: [
        {name: 'About', public: true},
        {name: 'Login', public: true},
        {name: 'Logout'},
        {name: 'Admin', public: true, target: 'admin'},
        {name: 'Data', public: true},
        {name: 'Home', public: true}
      ]
    }
  },
  components: {
    Logo
  },
  computed: {
    payload: function () {
      return null
    }
  }
}
</script>
<style>
.v-toolbar__content {
  align-items: center;
}
</style>
