<template lang='pug'>
  v-card.colored
    v-card-title.header
      h3 Bug Report
    v-card-text
      p Thanks for helping.  We are still in the early stages and there are bound to be a few things that don't quite work as expected.
      p We appreciate your help in either bringing bugs to our attention or in making suggestions for improvements.
      h2.message {{message}}
      rgv-form.signup-form(:form='bugForm' :options='options' :onCancel='cancel' :onSubmit='submitBug')
  </template>

<script>
import EmbeddedMessage from '@/default/components/EmbeddedMessage'
import apiAccess from '@/default/mixins/apiAccess'
import axios from 'axios'

export default {
  components: {
    EmbeddedMessage
  },
  mixins: [
    apiAccess,
  ],
  data () {
    return {
      bugForm: {},
      options: {
        access: 'append',
        fields: [
          {name: 'description', type: 'textarea', placeholder: 'Describe bug / suggestion', mandatory: true},
          {name: 'type', type: 'radio', options: ['Bug', 'Suggestion'], required: true}
        ]
      },
      message: ''
    }
  },
  props: {
    onCancel: {
      type: Function
    }
  },
  created: function () {
  },
  computed: {
  },
  methods: {
    cancel: function () {
      if (this.onCancel) {
        this.onCancel()
      }
    },
    submitBug () {
      console.log(this.payload.userid + ' submit bug: ' + JSON.stringify(this.bugForm))
      var data = {
        table: 'bugs',
        record: this.bugForm
      }
      data.record.user_id = this.payload.userid
      data.record.status = 'Submitted'

      axios.post(this.apiURL + '/dataset/bugs', data)
      .then( response => {
        console.log('submitted bug ' + JSON.stringify(response))
        this.message = 'Thanks for your Feedback !'
        setTimeout( () => {
          this.message = ''
          if (this.onCancel) {
            this.onCancel()
            console.log('closed dialog box...')
          } else {
            console.log('no cancel function supplied')
          }
        }, 2000)
      })
      .catch( err => {
        console.log("Error submitting bug " + err.message)
      })
    }
  },
  watch: {
  }
}
</script>

<style>

.padded {
  padding: 2rem;
}
.message {
  color: green;
}
</style>
