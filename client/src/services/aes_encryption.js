var crypto      = require('crypto')
var sha256 = require('js-sha256')

import config from '@/config.js'
const idvpn_seed = config.idvpn_public_key || 'internalSeed';

function encrypt (text, key) {
    var hybrid_key = idvpn_seed + key
    var cipher  = crypto.createCipher('aes-256-cbc', hybrid_key)
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt (text, key) {
    try {
        var hybrid_key = idvpn_seed + key
        var decipher  = crypto.createDecipher('aes-256-cbc', hybrid_key)
        var decrypted = decipher.update(text, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (err) {
        console.debug('Error decrypting...')
        return text
    }
}

function hashForm (form) {
    try {
        var unique_string = ''
        if (form.constructor === Object) {
            const keys = Object.keys(form).sort()
            for (var i = 0; i < keys.length; i++) {
                unique_string = unique_string + form[keys[i]].replace(/\s/,'').toLowerCase()
            }
        } else {
            unique_string = JSON.stringify(form)
        }
        return sha256(unique_string) 
    } catch (err) {
        console.debug('Error hashing form')
        return JSON.stringify(form)
    }
}

export default {encrypt, decrypt, hashForm};