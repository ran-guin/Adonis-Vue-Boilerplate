<template lang='pug'>
  PrivateLayout()
    h1 Dashboard
    p {{payload}}
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
