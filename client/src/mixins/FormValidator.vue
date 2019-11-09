<!--

Usage example.

This method enables parsing of validation messages (from adonis validator)
returned from an HTTP request.

The remoteErors hash generated can be used for inline form validation using DBForm (or form within a Modal)

Note: API return format should be in the format:

async login ({auth, request, response}) {
  const {email, password} = request.all()
  const rules = {
    email: 'required',
    password: 'required|min:6'
  }
  const validation = await Validator.validateAll(request.all(), rules)

  if (validation.fails()) {
    const errors = validation.messages()
    response.json( {error: 'Failed validation', validation_messages: errors, rules: rules} )
  }

***

  The error values can be then passed to a DBForm (or Modal containing a DBForm)
  by passing the hash remoteErrors:

  eg.
  <template>
    ..
    DBForm(.... :remoteErrors='remoteErrors')
    .. or ..
    Modal( .... :remoteErrors='remoteErrors')

    ...
  </template>

  <script>
    ..
    data () {
      return: {
        remoteErrors: {}
      }
    }

  ....

    axios.post(url)
      .then(function (response) {
        var validate = this.validateResponse(response)
        this.remoteErrors = validate.remoteErrors
      }
 -->

<script>
export default {
  data () {
    return { }
  },
  methods: {
    validateResponse: function (response) {
      var error = ''
      var formErrors = {}
      if (!response) {
        return {}
      } else if (response.data && response.data.error) {
        error = response.data.error
        if (response.data.validation_errors) {
          var errors = response.data.validation_errors
          if (errors.constructor === Array && errors.length) {
            // based on adonis validator format
            if (errors[0] && errors[0].field) {
              for (var i = 0; i < errors.length; i++) {
                console.log('e: ' + JSON.stringify(errors[i]))
                var msg = errors[i].message
                if (errors[i].validation === 'email') {
                  msg = 'valid email address required'
                } else if (errors[i].field === errors[i].validation) {
                  msg = 'this is a required field'
                } else if (errors[i].validation === 'min' && response.data.rules) {
                  var rule = response.data.rules[errors[i].field]
                  var min = rule.match(/min:(\d+)/)
                  if (min && min.length >= 2) {
                    msg = 'this field must be at least ' + min[1] + ' characters long'
                  } else { msg = 'min length.' }
                } else if (errors[i].validation === 'unique') {
                  msg = 'this field must be unique'
                } else if (errors[i].validation === 'required') {
                  msg = 'this is a required field'
                } else if (errors[i].validation === 'ENGINE_EXCEPTION') {
                  formErrors.form = error
                }
                formErrors[errors[i].field] = msg
              }
              formErrors.form = 'Validation Errors'
            } else {
              console.log('no errors..')
            }
          }
          formErrors.form = error
          console.log('Tracked form error(s): ' + JSON.stringify(formErrors))
        } else {
          formErrors.form = error
        }
        return {error: error, formErrors: formErrors}
      } else if (response.data && response.data.success) {
        return {success: response.data.success}
      } else {
        return {}
      }
    }
  }
}
</script>
