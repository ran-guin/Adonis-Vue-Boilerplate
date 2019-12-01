import { UserManager, WebStorageStateStore} from 'oidc-client'
import idvpnConfig from '@/idvpn.js'

class Idvpn {
  constructor () {
    if (idvpnConfig) {
      console.debug('load idvpn service')
      idvpnConfig.userStore = new WebStorageStateStore({ store: window.localStorage }),
      this.idvpn = new UserManager(idvpnConfig)
      this.isDefined = idvpnConfig.on || false
    } else {
      this.isDdefined = true
    }
  }

  // idvpn.prototype.getUser = function getUser () {
  getUser () {
    console.debug('get User...')
    return this.idvpn.getUser()
  }

  // idvpn.prototype.login = function login () {
  login () {
    console.debug('login...')
    return this.idvpn.signinRedirect()
  }

  // idvpn.prototype.logout = function logout () {
  logout () {
    console.debug('logout...')
    return this.idvpn.signoutRedirect()
  }

  isDefined () {
    return this.isDefined
  }
}
export default Idvpn
