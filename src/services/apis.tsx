import axiosPrivate from "../utils/axiosPrivate"
import { COOKIES, LOCALSTORAGE, removeLocalStorage, enCryptionFlag } from "../utils/constants";
import { decryptData, encrypt, encryptData } from "../utils/encryption_decryption";
// import { useLoaderContext } from './useLoaderContext';
import LoaderManager from '../utils/context/LoaderManager';
import { Cookies } from "react-cookie";
import { UpdateAccesToken } from "../utils/B2CLogin";
import { getRefreshTokenForlogin } from "./Login/services";
import { getAccessTokenWithRefresh } from "../utils/B2BRefresh";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";



const cookies = new Cookies();

const callApiWithRefreshedToken = async () => {
    const scopes = ['user.read']; // Define your scopes
    let userid = localStorage.getItem(LOCALSTORAGE?.USER_ID ?? '')
    try {
        const res = await getAccessTokenWithRefresh(scopes);

        if (res) {

            // cookies.set(COOKIES.REFERESH_TOKEN, res, {
            //     path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`
            // });

            // cookies.set(COOKIES.ACCESS_TOKEN, res, {
            //     path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`
            // });

            //const ACCESS_TOKEN: string = cookies.get((COOKIES.ACCESS_TOKEN));
            const ACCESS_TOKEN: string = decryptData((localStorage.getItem(COOKIES.ACCESS_TOKEN)));

            let update_tok_payload = {
                "LOGIN_TYPE": "W",
                "USER_ID": decryptData(userid),
                "TOKEN": ACCESS_TOKEN
            }

            let res1: { FLAG: boolean, MSG: string } = await UpdateAccesToken(update_tok_payload);

            return res1.FLAG



        } else {
            return false
        }
    } catch (error: any) {
        toast.error(error)
        return false;
    }
};


export const callPostAPI = async (url: any, payload: any = null, functionCode: any = null, scanfFile?: any) => {
    if (await TokenCheck()) {
        const facilityData = JSON.parse(((localStorage.getItem(LOCALSTORAGE.FACILITY)))!);

        let facilityId: any = facilityData?.length > 0 ? JSON.parse(((localStorage.getItem(`${LOCALSTORAGE?.FACILITYID}`)))!) : null;

        const commonPayload = {
            USER_ID: decryptData(localStorage.getItem(LOCALSTORAGE?.USER_ID)),
            LOGIN_TYPE: "W",
            FACILITY_ID: facilityData?.length > 0 ? JSON.parse(((localStorage.getItem(`${LOCALSTORAGE?.FACILITYID}`)))!)?.FACILITY_ID : "",
            //FACILITY_ID: 2,
            FACILITY_TYPE: facilityId?.FACILITY_TYPE,

            PORTFOLIO_ID: "1",
            ROLE_ID: decryptData(localStorage.getItem(`${LOCALSTORAGE?.ROLE_ID}`)),
            LANGUAGE_CODE: localStorage.getItem(`${LOCALSTORAGE?.LANGUAGE}`),
            ROLE_HIERARCHY_ID: decryptData(localStorage.getItem(`${LOCALSTORAGE?.ROLE_HIERARCHY_ID}`)),
            ROLETYPE_CODE: decryptData(localStorage.getItem(`${LOCALSTORAGE?.ROLETYPECODE}`)),
            FUNCTION_CODE: functionCode,
            isExcelUpload: payload?.isExcelUpload ?? 0, // Add default or derived value
        }


        let finalpayload = commonPayload


        if (payload) {
            finalpayload = { ...commonPayload, ...payload }

        }
    
        try {
         
            if (functionCode !== "HD004" && functionCode !== "HD001" && functionCode !== null && functionCode !== "AS067" && url !== "Authenticate/saveUserActivity" && url !== 'Configurations/getConfigurationsMastersList') {
              
                LoaderManager.show();
            } 
           
            if (finalpayload?.isExcelUpload === 1) {
               var   encryptdata :any= scanfFile === true && enCryptionFlag === true  ? finalpayload : (finalpayload);
               
            } else {
                 encryptdata = scanfFile === true  && enCryptionFlag === false ? finalpayload :scanfFile === true  && enCryptionFlag === true? finalpayload :enCryptionFlag === true? encrypt(finalpayload):{data:finalpayload};
             
            }
        //     console.log(encryptData, 'encryptData')
        //    encryptdata =JSON.parse(encryptdata) 
              
        //    const res = enCryptionFlag === false ? await axiosPrivate.post(`${process.env.REACT_APP_BASE_URL}${url}`, encryptdata)// uat build
        //      : await axiosPrivate.post(`${process.env.REACT_APP_BASE_URL}${url}`,encryptdata )
   const res = await axiosPrivate.post(`${process.env.REACT_APP_BASE_URL}${url}`, encryptdata)
            if (res.status === 429) {
                const res = {
                    FLAG: false,
                    APIMSG: "Too many request at t time"
                }
                return res;
            }
            else
                if (url === "Upload/uploadExcelDataCommonWithoutEncryption") {
                    return res?.data?.RESULT;
                } else if (res?.data?.FLAG === true || res?.data?.FLAG === 1) {

                    return res?.data
                } else if (res?.data?.FLAG === 0 || res?.data?.FLAG === false) {
                    return res?.data

                } else {

                }
        } catch (error: any) {
            throw error

        } finally {
            if (functionCode !== "HD001" && functionCode !== null) {
                LoaderManager.hide();
            }
        }
    } else {
        cookies.remove(COOKIES.ACCESS_TOKEN, { path: `${process.env.REACT_APP_CUSTOM_VARIABLE}` });
        cookies.remove(COOKIES.REFERESH_TOKEN, { path: `${process.env.REACT_APP_CUSTOM_VARIABLE}` });
        cookies.remove(COOKIES.LOGIN_TYPE, { path: `${process.env.REACT_APP_CUSTOM_VARIABLE}` });
        removeLocalStorage();

        window.location.href = `${process.env.REACT_APP_B2B_LOGIN_REDIRECT_URL}`
    }
    // }else {
    //         toast.error("No Facility Selected")
    //     }

}
// function getTimeOnly(date: Date) {
//     const hours = date.getUTCHours().toString().padStart(2, '0');
//     const minutes = date.getUTCMinutes().toString().padStart(2, '0');
//     const seconds = date.getUTCSeconds().toString().padStart(2, '0');
//     const time = `${hours}:${minutes}:${seconds}`;
//     return time;
// }

const TokenCheck = async (): Promise<any> => {
    const profile: any = localStorage.getItem("USER");
    const expiresIn: any = JSON.parse(localStorage.getItem("expiresIn") || '{}');
    // const refreshTok: any = cookies.get(COOKIES.REFERESH_TOKEN);
    const refreshTok: any = decryptData((localStorage.getItem(COOKIES.REFERESH_TOKEN)));
    // const accessTok: any = cookies.get(COOKIES.ACCESS_TOKEN);
    const accessTok: any = decryptData((localStorage.getItem(COOKIES.ACCESS_TOKEN)));

    //const LoginType: any = cookies.get(COOKIES.LOGIN_TYPE);
    const LoginType: any = decryptData((localStorage.getItem(COOKIES.LOGIN_TYPE)));

    // const accDetails: any = JSON.parse(localStorage.getItem("expiresIn") || '{}');
    if (LoginType === "B2B") {
        if (profile && expiresIn && accessTok) {
            const decodedToken: any = jwtDecode(accessTok);
            const expirationTime = decodedToken.exp * 1000; // Convert 'exp' to milliseconds
            const currentTime = Date.now();
            const bufferTime = 5 * 60 * 1000;

            if (expirationTime - currentTime <= bufferTime) {
                //if (currentTime >= expirationTime - bufferTime) {

                try {
                    const res = await callApiWithRefreshedToken();
                    return res;
                } catch (error: any) {
                    toast.error(error)


                }
            } else {
                return true;
            }


        }
        else {
            return false;
        }
    }

    if (LoginType === "B2C") {
        if (profile && refreshTok && expiresIn && accessTok) {
            const notBeforeTimestamp = expiresIn.not_before; // in seconds
            const idTokenExpiresIn = expiresIn.id_token_expires_in; // in seconds
            const notBeforeInMilliseconds = notBeforeTimestamp * 1000;
            const expirationDate = new Date(notBeforeInMilliseconds + idTokenExpiresIn * 1000);
            const refreshTime = new Date(expirationDate.getTime() - 5 * 60 * 1000);
            const currentDate = new Date();
            if (currentDate < expirationDate) {
                if (currentDate >= refreshTime) {

                    const res = await RefreshTokenFunc();
                    return res;
                } else {


                    return true
                }
            } else {


                const res = await RefreshTokenFunc();
                return res;
                //return true;
            }
        } else {


            return false;
        }
    }



};

const RefreshTokenFunc = async () => {
    let flag = false;


    let ref_tok_exists = decryptData((localStorage.getItem(COOKIES.REFERESH_TOKEN)));
    if (ref_tok_exists !== undefined && ref_tok_exists !== null && ref_tok_exists !== '') {

        let token_payload = {
            TOKEN: ref_tok_exists,
        }
        let res = await getRefreshTokenForlogin(token_payload);
        if (res) {
            let userid = localStorage.getItem(LOCALSTORAGE?.USER_ID ?? '')
            if (userid !== undefined && userid !== null && userid !== '') {


                const accesstoken: any = encryptData(
                    JSON.stringify(res?.data?.id_token)
                );
                localStorage.setItem(LOCALSTORAGE.ACCESS_TOKEN, accesstoken);
                const refreshtoken: any = encryptData(
                    JSON.stringify(res?.data?.refresh_token)
                );
                localStorage.setItem(LOCALSTORAGE.REFERESH_TOKEN, refreshtoken);

                let expiresIn: any = {
                    "not_before": res?.data?.not_before,
                    "id_token_expires_in": res?.data?.id_token_expires_in,
                }
                localStorage.setItem("expiresIn", JSON.stringify(expiresIn));
                if (res?.status === 200) {
                    let update_tok_payload = {
                        "LOGIN_TYPE": "W",
                        "USER_ID": decryptData(userid),
                        "TOKEN": res?.data?.id_token
                    }
                    await UpdateAccesToken(update_tok_payload);
                    flag = true;
                } else {


                }
            } else {


            }
        } else {
            flag = false;
        }


    } else {
        //window.location.href = PATH.LOGIN
    }
    return flag;
}

export const FILESACNNING = async (url: any, payload: any = null) => {
    await axiosPrivate.post(url, payload)
}