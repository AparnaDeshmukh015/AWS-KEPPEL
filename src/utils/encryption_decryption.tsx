
import crypto from 'crypto-js';
var key = crypto.enc.Utf8.parse("1203199320052021");
var key1 = crypto.enc.Utf8.parse("1203199320052022");
var key2 = 'abcd';
export const encrypt = (text: any) => {
  text = JSON.stringify(text)
  var encrypted = crypto.AES.encrypt(crypto.enc.Utf8.parse(text), key, {
    keySize: 256,
    iv: key,
    mode: crypto.mode.CBC,
    padding: crypto.pad.Pkcs7
  });

  let data = {
    data: encrypted.toString()
  }
  var encryptData = JSON.stringify(data)
  return encryptData;
}

export const decrypt = (decString: any) => {
  var decrypted = crypto.AES.decrypt((decString), key, {
    keySize: 256,
    iv: key,
    mode: crypto.mode.CBC,
    padding: crypto.pad.Pkcs7
  });

  return JSON.parse((decrypted.toString(crypto.enc.Utf8)));
}

export const encryptData = (txt: string | {}) => {

  const cryptoInfo = crypto.AES.encrypt(JSON.stringify({ txt }), key2);
  return cryptoInfo;
}

export const decryptData = (text: string | null) => {
  const info2 = crypto.AES.decrypt(text!, key2).toString(crypto.enc.Utf8);
  const info3 = JSON.parse(info2);
  return JSON.parse(info3.txt);
}




