export default {
  camelCase(str) {
     var parts = str.split(/[\s-_]/);
     var words = [] 
     if (parts.length) {
       for (var i = 0; i < parts.length; i++) {
         var word = ''
         if (i > 0) {
           word = parts[i].substr(0,1).toUpperCase();
         } else {
           word = parts[i].substring(0,1); // .toLowerCase();
         }
         if (parts[i].length > 1) {
           word = word + parts[i].substring(1,parts[i].length); // .toLowerCase();
         }
         words.push(word)
       }
     } else {
       words.push(str)
     }
     return words.join('');
  },
  normalize(str) {
    var decamel = this.deCamelCase(str)
    var split = decamel.split(/\s|_/)
    return split.join(' ')
  },
  capitalize(str) {
    var string = str
    var words = this.normalize(str).match(/ [a-z]/)
    if (words.length > 1) {
      for (var j = 1; j < words.length; j++) {
        string = string.replace(words[j], words[j].toUpper())
      }
    }
    return string
  },
  deCamelCase(str, sep) {
    if (!sep) { sep = ' ' }

    var camel = this.camelCase(str)
    var normalized = camel.substr(0,1).toUpperCase();
    if (camel.length > 1) {
      normalized = normalized + camel.substr(1, camel.length - 1);
    }
    
    var words = this.splitCamelCase(normalized)
    return words.join(sep)
  },
  splitCamelCase(str, array, loops) {
     if (!array) { array = [] }
     if (!loops) { loops = 0 }
     loops++

     if (loops > 10) {
       array.push(str)
       return array
     }
    
     var parts = str.match(/([A-Z][a-z]*)/);
     if (parts) {
       array.push(parts[1])
       var remainder = str.replace(parts[1], '')
       if (remainder) {
         return this.splitCamelCase(remainder, array, loops)
       } else {
         return array
       }
     } else {
       return array
     }
  }
}
