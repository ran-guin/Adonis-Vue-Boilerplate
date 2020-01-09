<template lang='pug'>
 div.fullscreen
    PageLayout(page='Contact' :noMobileHeader='noMobileHeader')
      div.myContainer
        h2
          router-link(to='/Home')
            icon(name='home' scale=2 color="#337ab7")
          span &nbsp; &nbsp; Contact Us:
        hr.thickBlackLine
        h5.text-success(v-if='feedback') {{feedback}}
        h5.text-danger(v-if='erro') {{error}}
        hr(v-if='feedback || error')
        form()
          label(for='email') Email:
          b-form-input(id='email' name='email' v-model='email' type='text')
          br
          label(for='message') Message:
          b-form-textarea.box(id='message' name='message' v-model='messageContent' rows=3 max-rows=5 placeholder='(message content...)')
          br
          p I am a: &nbsp; &nbsp;
          b-form-radio-group.input-lg.box(id='role' type='radio-group' v-model='role' name='role' :options='options')
          p &nbsp;
          p &nbsp;
          hr
          button.btn.btn-primary(onclick='return false;' v-on:click='send' :disabled='pending') Submit
          span &nbsp; &nbsp;
          button.btn.btn-default(v-on:click='back') Cancel
        p &nbsp;
        p &nbsp;
        p &nbsp;
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import config from '@/config.js'
import axios from 'axios'

// import Modal from '@/components/Standard/Modal'
// import Messaging from './../Standard/Messaging'

export default {
  components: {
    PageLayout
    // Modal
  },
  data () {
    return {
      url: config.apiURL[process.env.NODE_ENV],
      noMobileHeader: true,
      feedback: '',
      error: '',
      options: ['Customer', 'Vendor', 'Guarantor', 'Investor'],
      messageContent: '',
      role: '',
      email: ''
    }
  },
  props: {
  },
  created: function () {
    console.log('create contact us page for ' + this.payload.email)
    if (this.payload && this.payload.email) {
      this.email = this.payload.email
    }
  },
  computed: {
    payload: function () {
      return this.$store.getters.payload || {}
    },
    target: function () {
      return this.url + '/message'
    },
    pending: function () {
      if (this.email && this.messageContent && this.role) {
        return false
      } else {
        return true
      }
    }
  },
  methods: {
    back: function () {
      this.$router.go(-1)
    },
    async send () {
      const data = {
        message: this.messageContent,
        role: this.role,
        email: this.email
      }
      console.log('Send: ' + JSON.stringify(data))

      try {
        var response = await axios.post(this.url + '/message', data)
        console.log('response: ' + JSON.stringify(response))
        if (response.data && response.data.validation_errors) {
          console.log('validation errors: ' + JSON.stringify(response.data.validation_errors))
          this.feedback = ''
          this.error = 'Error: ' + response.data.validation_errors
          // return {error: response.data.validation_errors}
        } else {
          console.log('sent message: ' + JSON.stringify(response.data))
          this.feedback = 'Message submitted: Thank you.'
          this.error = ''
          this.messageContent = ''
          // this.$router.push('/Home')
          this.$store.dispatch('logMessage', 'Thanks for your message.')
          // return {success: true}
        }
      } catch (err) {
        console.log('Caught post Error: ' + err)
        this.error = 'Error sending message: ' + err
        this.feedback = ''
        // return {error: err}
      }
    }
  }
}
</script>

<style>

.custom-control-label {
  padding-left: 10px;
}

.box {
  padding: 10px;
}
.wrapper {
  display: inline-block;
  width: 100%;
  padding-left: 10px;
  padding-right: 10px;
}

@media screen and (min-width: 768px) {
  .wrapper {
    padding-left: 20%;
    padding-right: 20%;
  }
}

</style>
