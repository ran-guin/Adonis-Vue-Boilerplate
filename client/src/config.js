export default {
  apiURL: {
    production: 'https://idvpn.ca',
    development: 'https://dev.idvpn.ca',
    demo: 'https://demo.idvpn.ca',
    test: 'https://test.idvpn.ca',
    local: 'http://127.0.0.1:3331'
  },
  lpURL: {
    production: 'https://idvpn.ca',
    development: 'https://dev.idvpn.ca',
    demo: 'https://demo.idvpn.ca',
    test: 'https://test.idvpn.ca',
    local: 'http://127.0.0.1:3331'
  },
  header: 'My App Title',
  defaultEmailDomain: 'gmail.com',
  footer: 'My App Footer',
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
