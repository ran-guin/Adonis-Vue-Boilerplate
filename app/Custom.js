
class Custom {


  async onLogin (user, options) {
	console.log('custom login ' + JSON.stringify(user))
	console.log('got ' + JSON.stringify(options))
  }
}
module.exports = {Custom}
