const crypto = require('crypto')


var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
var key = 'password';

const encrypt = (text) => {

    var cipher = crypto.createCipher(algorithm, key);  
    var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');

  return encrypted
  
}

const decrypt = (hash) => {
    var decipher = crypto.createDecipher(algorithm, key);
    var decrypted = decipher.update(hash, 'hex', 'utf8') + decipher.final('utf8');
  return decrypted
}

module.exports = {
  encrypt,
  decrypt
}

