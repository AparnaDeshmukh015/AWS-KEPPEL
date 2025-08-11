
import crypto from 'crypto-js';
import { toast } from 'react-toastify';

var key = crypto.enc.Utf8.parse(`${process.env.REACT_APP_ENCRYPTION_KEY}`);
//var key1 = crypto.enc.Utf8.parse("1203199320052022");
var key2 = `${process.env.REACT_APP_ENCRYPTION_KEY1}`;
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
  if (!text) {
    return null
  }
  
  try {

    const decrypted = crypto.AES.decrypt(text!, key2);
    const info2 = decrypted.toString(crypto.enc.Utf8);

    if (!info2) {
      toast.error("Decrypted data is empty or invalid UTF-8.");
    }

    const info3 = JSON.parse(info2);

    if (info3 && info3.txt) {

      return JSON.parse(info3.txt);
    } else {
     // toast.error("Parsed object does not contain 'txt' field.");
    }

  } catch (error:any) {
    toast.error(error)
  
    return null;  // or some default error response
  }
}




