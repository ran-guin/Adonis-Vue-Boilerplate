export default {
  apiURL: 'http://localhost:3333',
  lpURL: 'http://localhost:3333',
  apiHeader: {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
  rules: {
    required: v => !!v || 'Name is required',
    min: function (m) {
      m = m || 8
      return v => (v && v.length >= m) ? true : 'Name must be at least ' + m + ' characters'
    },
    max: function (m) {
      return v => (v && v.length <= m) ? true : 'Name may not exeed ' + m + ' characters'
    },
    email: v => /.+@.+\..+/.test(v) ? true : 'Valid Email required',
    date: v => /$\d\d\d\d-\d\d-\d\d$/.test(v) ? true : 'Valid Date should be YYYY-MM-DD'  
  }
}

