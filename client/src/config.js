const myPort = 8090
export default {
  CLIENT_ID: 'boilerplate',
  apiURL: {
    production: 'https://idvpn.ca',
    development: 'https://dev.idvpn.ca',
    demo: 'https://demo.idvpn.ca',
    test: 'https://test.idvpn.ca',
    local: 'http://127.0.0.1:' + myPort
  },
  lpURL: {
    production: 'https://idvpn.ca',
    development: 'https://dev.idvpn.ca',
    demo: 'https://demo.idvpn.ca',
    test: 'https://test.idvpn.ca',
    local: 'http://127.0.0.1:' + myPort
  },
  header: 'My App Title',
  headerLogo: 'logo.svg',
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
  },
  oidc: {
    name: 'idvpn',
    authority: 'http://127.0.0.1:5000/oidc',
    client_id: 'test',
    redirect_uri: `http://127.0.0.1:8090/callback.html`,
    post_logout_redirect_uri: `http://127.0.0.1:8090`,
    response_type: 'id_token',
    response_mode: 'fragment',
    scope: 'openid email'
  }
}
