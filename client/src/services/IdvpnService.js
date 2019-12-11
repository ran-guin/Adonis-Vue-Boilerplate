import { UserManager, WebStorageStateStore} from 'oidc-client'
import Config from '@/config.js'

class userMgr {
  constructor () {
    this.options = []
    this.configs = {}
    this.loaded = false

    if (Config.oidc && Config.oidc.constructor === Object) {
      console.debug('load userMgr service')

      var config = JSON.parse(JSON.stringify(Config.oidc))
      console.log('initialize mgr with ' + JSON.stringify(config))

      config.userStore = new WebStorageStateStore({ store: window.localStorage }),
      this.userMgr = new UserManager(config)

      this.userMgr.clearStaleState().then(() => {
        console.log('clearState success');
      }).catch((e) => {
        console.log('clearStateState error', e.message);
      });

      this.loaded = true
      this.configs.default = Config.oidc
    } else if (Config.oidc && Config.oidc.constructor === Array) {
      console.debug('multiple oidc connection options...')
      for (var i = 0; i < Config.oidc.length; i++) {
        var opt = Config.oidc[i]
        this.options.push(opt.name)
        this.configs[opt.name] = opt
      }
    } else {
      console.debug('no oidc specifications')
      this.loaded = false
    }

    if (this.loaded) {
      this.userMgr.getUser()
      .then((user) => {
        console.debug('SERVICE USER: ' + JSON.stringify(user))
      })
      .catch((err) => {
        console.debug("SERVICE ERROR: " + err.message)
      })
    }
  }
  getUser () {
    console.debug('get userMgr User...' + this.loaded)
    return this.userMgr.getUser()
  }

  async getClaims (ref) {
    if (!ref) { ref = window.location.href }
    try {
      const auth = await this.userMgr.signinRedirectCallback();
      const authString = JSON.stringify(auth)
      console.debug('store auth string: ' + authString)
      // window.localStorage.setItem('auth', authString);
    } catch (err) {
      // window.localStorage.setItem('auth', JSON.stringify({ error: err.message }));
    }
  }

  // userMgr.prototype.login = function login () {
  login (state) {
    console.debug('login...')
    console.log('login with state: ' + JSON.stringify(state))
    return this.userMgr.signinRedirect(state)
  }

  // userMgr.prototype.logout = function logout () {
  logout () {
    console.debug('logout...')
    return this.userMgr.signoutRedirect()
  }

  loaded () {
    return this.loaded || false
  }

  saveState (state) {
    // const state = 'abc123' // random ... Fix this (temp only)   
    console.debug('stash state: ' + JSON.stringify(state))
    // window.localStorage.setItem('auth', JSON.stringify(state))
  }
}
export default userMgr
