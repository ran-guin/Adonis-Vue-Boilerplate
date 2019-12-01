<template lang='pug'>
  PrivateLayout()
    h1 Dashboard
    p {{payload}}
</template>

<script>  
import PageLayout from '@/layouts/PageLayout'
export default {
  components: {
    PageLayout
  },
  computed: {
    payload: function () {
      return this.getters.payload || {}
    }
  }
}
</script>
