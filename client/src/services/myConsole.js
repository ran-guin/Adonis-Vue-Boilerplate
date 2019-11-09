export default {
  log(str) {
     console.log(str)
     return str
  },
  debug(str) {
    console.debug(str)
    return str
  },
  table(array) {
    console.table(array)
    return array
  },
  trace() {
    console.trace()
    return true
  },
  json(obj, prompt) {
    console.debug(prompt + ': ' + JSON.stringify(obj))
    return prompt + ' ' + obj
  }
}
