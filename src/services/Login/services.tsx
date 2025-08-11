import axios from "axios";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import { decryptData, encrypt } from "../../utils/encryption_decryption";
import { toast } from "react-toastify";
import axiosPrivate from "../../utils/axiosPrivate";
import { enCryptionFlag, LOCALSTORAGE } from "../../utils/constants";

export const loginUser = async (payload: any, token: any) => {
    try {
      //   var encryptdata = encrypt(payload);
      //  below for uat build
        //   let data = {
        //     data: payload
        //   }
        var encryptdata:any  =enCryptionFlag === true ? JSON.parse(encrypt(payload)): {data: payload};
      
        let loginType = decryptData((localStorage.getItem(LOCALSTORAGE.LOGIN_TYPE)));
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'LoginType': loginType
        }
        const res = await axiosPrivate.post(`${process.env.REACT_APP_BASE_URL}${ENDPOINTS.LOGIN}`, encryptdata, { headers: headers })
          // : await axiosPrivate.post(`${process.env.REACT_APP_BASE_URL}${ENDPOINTS.LOGIN}`, encryptdata, { headers: headers });//uat build
        if (res?.data?.RESULTLIST[0].FLAG === 1) {
            return res?.data
        } else {
            return res?.data?.RESULTLIST[0].MSG
        }
    } catch (error: any) {
        throw error

    }
}

export const UserCheck = async (payload: any) => {
    try {
    //      var encryptdata = encrypt(payload);
    //       let data = {
    //     data: payload
    //   }
    var encryptdata:any = enCryptionFlag === true? JSON.parse(encrypt(payload)) : {data: payload};
        const res = await axiosPrivate.post(`${process.env.REACT_APP_BASE_URL}${ENDPOINTS.USERCHECK}`, encryptdata)
       //  await axiosPrivate.post(`${process.env.REACT_APP_BASE_URL}${ENDPOINTS.USERCHECK}`, encryptdata); // for uat build
        if (res?.data?.USER_DETAILS[0].FLAG === 1) {
            return res?.data
        } else {
            return res?.data?.USER_DETAILS[0].USER_TYPE
        }
    } catch (error: any) {
        throw error

    }
}

export const getAccessTokenForlogin = async (payload: any) => {
//   //   var encryptdata = encrypt(payload);
//      //  below for uat build 
//     let data = {
//         data: payload
//       }
    var encryptdata = enCryptionFlag === true ? JSON.parse(encrypt(payload)):{data: payload};

        const res = await axios.post(`${process.env.REACT_APP_BASE_URL}${ENDPOINTS.GET_TOKEN}`,encryptdata).then((res1: any) => {
 // below for uat build
     //const res = await axios.post(`${process.env.REACT_APP_BASE_URL}${ENDPOINTS.GET_TOKEN}`, encryptdata).then((res1: any) => {
        if (res1.status === 200) {
            return res1;
        }
    }, (error: any) => {
        toast.error("Something Went Wrong");
       
    })
    return res;
};

export const getRefreshTokenForlogin = async (payload: any) => {
     // below for uat build
    // let data = {
    //     data: payload
    //   }
    // var encryptdata = data;
     var encryptdata = enCryptionFlag === true ? JSON.parse(encrypt(payload)) : {data: payload};

    //const res = await axios.post(`${process.env.REACT_APP_BASE_URL}${ENDPOINTS.GET_REFRESH_TOKEN_LOGIN}`, JSON.parse(encryptdata)).then((res1: any) => {
    //below for uat build
    const res = await axios.post(`${process.env.REACT_APP_BASE_URL}${ENDPOINTS.GET_REFRESH_TOKEN_LOGIN}`, encryptdata).then((res1: any) => {
        if (res1.status === 200) {
            return res1;
        }
    }, (error: any) => {
        toast.error("Something Went Wrong");
      
        return false;
    })
    return res;
};