import { UserManager, WebStorageStateStore} from 'oidc-client'
import Config from '@/config.js'

// import {Issuer} from 'openid-client'

class Idvpn {
  constructor () {
    this.options = []
    this.configs = {}
    if (Config.oidc && Config.oidc.constructor === Object) {
      console.debug('load idvpn service')


      Config.oidc.userStore = new WebStorageStateStore({ store: window.localStorage }),

      console.debug('Config: ' + JSON.stringify(Config.oidc))

      this.idvpn = new UserManager(Config.oidc)

      this.idvpn.clearStaleState().then(() => {
        console.log('clearState success');
      }).catch((e) => {
        console.log('clearStateState error', e.message);
      });

      this.loaded = true
      this.configs.default = Config.oidc
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

  // getIssuer (provider) {
  //   return Issuer.discover(provider)
  //     // .then(function (googleIssuer) {
  //     //   console.log('Discovered issuer %s %O', googleIssuer.issuer, googleIssuer.metadata);
  //     //   return googleIssuer
  //     // })
  // }

  setup (provider) {
    console.debug('load idvpn service for ' + provider)
    var config = this.configs[provider]
    console.debug('Config: ' + JSON.stringify(config))
    config.userStore = new WebStorageStateStore({ store: window.localStorage }),
    this.idvpn = new UserManager(config)
    this.loaded = true
  }

  getUser () {
    console.debug('get idvpn User...' + this.loaded)
    console.log(JSON.stringify(this.configs))
    return this.idvpn.getUser()
  }

  getClaims (ref) {
    return this.idvpn.signinRedirectCallback(ref)
  }

  // idvpn.prototype.login = function login () {
  login (state) {
    console.debug('login...')
    console.log('login with state: ' + JSON.stringify(state))
    return this.idvpn.signinRedirect()
  }

  // idvpn.prototype.logout = function logout () {
  logout () {
    console.debug('logout...')
    return this.idvpn.signoutRedirect()
  }

  loaded () {
    return this.loaded || false
  }
}
export default Idvpn
