<template lang='pug'>
  PrivateLayout(title='Dashboard Title')
    h1 Dashboard
    p Payload: {{payload}}
</template>

<script>  
import PrivateLayout from '@/layouts/PrivateLayout'
export default {
  components: {
    PrivateLayout
  },
  computed: {
    payload: function () {
      return this.$store.getters.payload || {}
    }
  }
}
</script>
