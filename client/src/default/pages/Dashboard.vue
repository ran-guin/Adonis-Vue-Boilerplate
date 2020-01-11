<template lang='pug'>
  PrivateLayout(title='Dashboard Title' page='Dashboard')
    h1 Custom Dashboard
    p Payload: {{payload}}
</template>

<script>  
import PrivateLayout from '@/default/layouts/PrivateLayout'
export default {
  components: {
    PrivateLayout
  },
  computed: {
    payload: function () {
      return this.$store.getters.payload || {}
    }
  },
  created: function () {
    if ( !(this.payload && this.payload.userid)) {
      console.log('no defined user ... redirect to public page')
      this.$router.push('/Public')
    }
  }
}
</script>
