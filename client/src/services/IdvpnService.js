import { UserManager, WebStorageStateStore} from 'oidc-client'
import Config from '@/config.js'

class Idvpn {
  constructor () {
    this.options = []
    this.configs = {}
    if (Config.oidc && Config.oidc.constructor === Object) {
      console.debug('load idvpn service')
      Config.oidc.userStore = new WebStorageStateStore({ store: window.localStorage }),
      this.idvpn = new UserManager(Config.oidc)
      this.loaded = true
      // }
      // .catch (err) {
      //   console.debug('error loading oidc: ' + err)
      //   this.loaded = false
      // }
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
  }

  setup (provider) {
    console.debug('load idvpn service for ' + provider)
    var config = this.configs[provider]
    console.debug('Config: ' + JSON.stringify(config))
    config.userStore = new WebStorageStateStore({ store: window.localStorage }),
    this.idvpn = new UserManager(config)
    this.loaded = true
  }

  getUser () {
    console.debug('get User...')
    return this.idvpn ? this.idvpn.getUser() : null
  }

  getClaims () {
    return this.idvpn ? this.idvpn.signinRedirectCallback() : null
  }

  // idvpn.prototype.login = function login () {
  login () {
    console.debug('login...')
    return this.idvpn ? this.idvpn.signinRedirect() : null
  }

  // idvpn.prototype.logout = function logout () {
  logout () {
    console.debug('logout...')
    return this.idvpn ? this.idvpn.signoutRedirect() : null
  }

  loaded () {
    return this.loaded || false
  }
}
export default Idvpn
