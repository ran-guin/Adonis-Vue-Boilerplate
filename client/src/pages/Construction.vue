<template lang='pug'>
  PageLayout
    div.info-header.full-width-padding
      h4 Under Construction 
      p &nbsp;
</template>

<script>
import PageLayout from '@/layouts/PageLayout'

export default {
  components: {
    PageLayout
  },
  data () {
    return {
      test: false,
      show: 'Home',
      mode: 'Construction'
    }
  },
  props: {
    payload: {
      type: Object,
      default: null
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>

<style>

.desktop-message {
  display: block
}

@media screen and (max-width: 767px) {
  .desktop-message {
    display: none
  }
}

</style>
