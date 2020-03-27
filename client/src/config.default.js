const myPort = 8090
const url = 'myProj.com'

export default {
  CLIENT_ID: 'boilerplate',
  defaultEmailDomain: 'gmail.com',

  login: true,
  invitation_required_for: 'Member',
  guestAccessToken: 'publicAccessToken',
  invitationRequired: true,

  public: {
    Home: true,
    About: true,
    Data: true,
    Admin: true
  }, 
  private: {
    Dashboard: true,
    Data: true,
    Admin: true
  },
  header: {
    desktop: 'Desktop Title',
    mobile: 'Mobile Title',
    logo: 'logo.svg'
  },
  footer: {
    desktop: 'Desktop Footer',
    mobile: 'Mobile Footer'
  },
 
  apiURL: {
    production: 'https://' + url,
    development: 'https://dev.' + url,
    demo: 'https://demo' + url,
    test: 'https://test.' + url,
    local: 'http://127.0.0.1:' + myPort
  },
  lpURL: {
    production: 'https://' + url,
    development: 'https://dev.' + url,
    demo: 'https://demo' + url,
    test: 'https://test.' + url,
    local: 'http://127.0.0.1:' + myPort
  },
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
  oidc_off: {
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
