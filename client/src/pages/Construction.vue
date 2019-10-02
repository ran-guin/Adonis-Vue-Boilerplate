<template lang='pug'>
  PageLayout
    div.info-header.full-width-padding
      div.info-logo
        a(v-on:click="$router.push('/Home')")
          img(src='images/kyc/pgkyc-key.png' height='80px')
      div.info-left
        h4 A Pretty Good, privacy centric KYC solution
        div(v-if="payload && (payload.role === 'Admin' || payload.role === 'Tester')")
          b.env(:class='envClass') {{payload.codeVersion}} : DB = {{payload.db}}
        div(v-else-if="payload && payload.env && payload.env !== 'production'")
          b.env(:class='envClass') {{payload.env}} version
      div.info-right
        Authorization(:payload='payload' :add2Menu='add2Menu' :demo='demo' :noConfirm='!confirm' :mode='mode')
        h5(v-if="role && payload.role !== 'User'") [as {{role}}]
      hr.std-colour.wideScreen(style='border: 3px solid')
      p &nbsp;

    div.myBody
      div.myContainer
        div.desktop-message
          p &nbsp;
          h2 Welcome to PGKYC!
            p &nbsp;
            p A privacy centric PKI based KYC solution on the blockchain
          p &nbsp;

    FooterLayout.myFooter()
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
