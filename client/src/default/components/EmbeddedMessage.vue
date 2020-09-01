<template lang='pug'>
  div
    div(v-if='foundMessages')
        h6.centred.embeddedMessages(v-if='showMessage')
            ul.text-danger(v-if="embeddedMessages.errors.length" v-for='msg in embeddedMessages.errors')
                li(v-if='msg') {{msg}}
            ul.text-warning(v-if="embeddedMessages.warnings.length" v-for='msg in embeddedMessages.warnings')
                li(v-if='msg') {{msg}}
            ul.ext-success(v-if="embeddedMessages.messages.length" v-for='msg in embeddedMessages.messages')
                li(v-if='msg') {{msg}}
        div.right(v-else style='padding-right: 1rem')
            v-btn(icon @click='showMessage=true' small)
                v-icon warning
    
    v-dialog(v-if='showDialog' max-width='100%')
        v-container
            div.centred.embeddedMessages(v-if='showMessage')
                span.text-danger(v-if="embeddedMessages.errors.length" v-for='msg in embeddedMessages.errors')
                    h6(v-if='msg') {{msg}}
                span.text-warning(v-if="embeddedMessages.warnings.length" v-for='msg in embeddedMessages.warnings')
                    h6(v-if='msg') {{msg}}
                span.text-success(v-if="embeddedMessages.messages.length" v-for='msg in embeddedMessages.messages')
                    h6(v-if='msg') {{msg}}
</template>
<script>
    export default {
        components: {
        },
        data() {
            return {
                showMessage: false,
                foundMessages: false,
                showDialog: false,
                embeddedMessages: {
                    errors: [],
                    warnings: [],
                    messages: []
                }
            }
        },
        async created () {
          if (this.clear) {
            this.clearMessages()
          }
          this.getMessages()
        },
        props: {
            clear: {
                type: Boolean,
                default: false
            },
            type: {
                type: String,
                default: 'embedded'
            },
            delay: {
                type: Number,
                default: 5000
            }
        },
        methods: {
          getMessages: function () {
              const error = this.$route.params.error || this.$route.query.error || ''
              const warning = this.$route.params.warning || this.$route.query.warning || ''
              const message = this.$route.params.message || this.$route.query.message || ''

              console.log('message: ' + message)
              if (!this.hide) {
                  this.$set(this.embeddedMessages, 'errors', error.split(/;\s*/))
                  this.$set(this.embeddedMessages, 'warnings', warning.split(/;\s*/))
                  this.$set(this.embeddedMessages, 'messages', message.split(/;\s*/))
              }
              
              if (error || warning || message) {
                  this.foundMessages = true
                  if (this.type === 'embedded') {
                      this.showMessage = true
                  } else {
                      this.showDialog = true
                  }
                  console.log('found messages...')
              } else {
                this.foundMessages = false
                  console.log('no messages..')
              }

              this.timeoutMessage()
          },
          clearMessages: function () {
              console.log('clear messages')
              this.$router.replace({query: {message: '', warning: '', error: ''}, params: {message: '', warning: '', error: ''}}).catch(()=>{});
              this.getMessages()
          },
          timeoutMessage: function () {
            if (this.delay) {
                setTimeout(() => {
                    this.showMessage = false
                    this.showDialog = false
                }, this.delay)
            }
          }
        },
        watch: {
            showMessage: function () {
                if (this.showMessage) {
                    this.timeoutMessage()
                }
            },
            clear: function () {
              this.clearMessages()
            }
        }
    }
</script>

<style>
.embeddedMessages {
  background-color: lightyellow;
  padding: 1rem;
}
</style>
