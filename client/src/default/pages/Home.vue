<template lang='pug'>
  PrivateLayout(page='Home' v-if='payload && payload.userid')
    h1 Default Private Home Page
  PublicLayout(page='Home' v-else)
    h1 Default Public Home Page
</template>

<script>  
import PublicLayout from '@/default/layouts/PageLayout'
import PrivateLayout from '@/default/layouts/PrivateLayout'
import Config from '@/config.js'

export default {
  data () {
    return {
      loginRequired: Config.loginRequired || false
    }
  },
  components: {
    PublicLayout,
    PrivateLayout
  },
  props: {
    page: {
      type: String,
      default: 'Home'
    }
  },
  created: function () {
    console.log('Route: ' + this.$router.path)
    if (this.page === 'Home') {
      console.log('reroute home as required...')
      if (this.loginRequired) {
        if (this.payload && this.payload.userid) {
          console.log('found user: ' + this.payload.userid)
          this.$router.push('/Dashboard')
        } else {
          this.$router.push('/Public')
        }
      } else {
        this.$router.push('/Public')
      }
    } else {
      console.log('page: ' + this.page)
    }
  },
  computed: {
    payload: function () {
      return this.$store.getters.payload || {}
    }
  }
}
</script>