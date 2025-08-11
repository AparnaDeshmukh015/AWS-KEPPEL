import { API } from "../utils/APIEndpoints"
import axiosPrivate from "../utils/axiosPrivate"
import { COOKIES, LOCALSTORAGE } from "../utils/constants";
import { decryptData, encrypt } from "../utils/encryption_decryption";
// import { useLoaderContext } from './useLoaderContext';
import LoaderManager from '../utils/context/LoaderManager';
import { Cookies } from "react-cookie";
import { refreshToken, UpdateAccesToken } from "../utils/B2CLogin";
import { getRefreshTokenForlogin } from "./Login/services";

const cookies = new Cookies();
export const callPostAPI = async (url: any, payload: any = null, functionCode: any = null) => {
    if (await TokenCheck()) {
        const commonPayload = {
            USER_ID: decryptData(localStorage.getItem(LOCALSTORAGE?.USER_ID)),
            LOGIN_TYPE: "W",
            FACILITY_ID: JSON.parse(((localStorage.getItem(`${LOCALSTORAGE?.FACILITYID}`)))!)?.FACILITY_ID,
            //FACILITY_ID: 2,
            PORTFOLIO_ID: "1",
            ROLE_ID: decryptData(localStorage.getItem(`${LOCALSTORAGE?.ROLE_ID}`)),
            LANGUAGE_CODE: localStorage.getItem(`${LOCALSTORAGE?.LANGUAGE}`),
            ROLE_HIERARCHY_ID: decryptData(localStorage.getItem(`${LOCALSTORAGE?.ROLE_HIERARCHY_ID}`)),
            ROLETYPE_CODE: decryptData(localStorage.getItem(`${LOCALSTORAGE?.ROLETYPECODE}`)),
            FUNCTION_CODE: functionCode,
        }

        let finalpayload = commonPayload
        if (payload) {
            finalpayload = { ...commonPayload, ...payload }

        }


        try {

            if (functionCode !== "HD001" && functionCode !== null && functionCode !== "AS067" && url !== "Authenticate/saveUserActivity") {
                LoaderManager.show();
            }
          
            var encryptdata = encrypt(finalpayload);

            const res = await axiosPrivate.post(`${process.env.REACT_APP_BASE_URL}${url}`, JSON.parse(encryptdata))
            if (url === "Upload/uploadExcelDataCommon") {
                return res?.data?.RESULT;
            } else if (res?.data?.FLAG === true || res?.data?.FLAG === 1) {

                return res?.data
            } else if (res?.data?.FLAG === 0 || res?.data?.FLAG === false) {
                return res?.data

            } else {

            }
        } catch (error: any) {
            throw error
            // toast.error(error)
        } finally {
            if (functionCode !== "HD001" && functionCode !== null) {
                LoaderManager.hide();
            }
        }
    } else {

        // window.location.href = "/klikfm/login";
        window.location.href = `${process.env.REACT_APP_CUSTOM_VARIABLE}`
    }

}
function getTimeOnly(date: Date) {
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;
    return time;
}

const TokenCheck = async (): Promise<any> => {
    const profile: any = localStorage.getItem("USER");;
    const expiresIn: any = JSON.parse(localStorage.getItem("expiresIn") || '{}');
    const refreshTok: any = cookies.get(COOKIES.REFERESH_TOKEN);
    const accessTok: any = cookies.get(COOKIES.ACCESS_TOKEN);

    if (profile && refreshTok && expiresIn && accessTok) {
        const notBeforeTimestamp = expiresIn.not_before; // in seconds
        const idTokenExpiresIn = expiresIn.id_token_expires_in; // in seconds
        const notBeforeInMilliseconds = notBeforeTimestamp * 1000;
        const expirationDate = new Date(notBeforeInMilliseconds + idTokenExpiresIn * 1000);
        const refreshTime = new Date(expirationDate.getTime() - 5 * 60 * 1000);
        const currentDate = new Date();

        // console.log('expirationDate:', getTimeOnly(expirationDate), 'refreshTime:', getTimeOnly(refreshTime), 'currentDate:', getTimeOnly(currentDate)); // testing purpose
        if (currentDate < expirationDate) {
            if (currentDate >= refreshTime) {

                await RefreshTokenFunc();
                return true;
            } else {
                //    console.log("Token is still valid.");
                return true
            }
        } else {
            //  console.log("Token has expired.");
            const res = await RefreshTokenFunc();
            return res;
            //return true;
        }
    } else {
        // const res = await resetAll()
        // console.log('no data');
        return false;
    }

};

const RefreshTokenFunc = async () => {
    // if (window.location.pathname !== '/login') {
    let ref_tok_exists = cookies.get(COOKIES.REFERESH_TOKEN);
    if (ref_tok_exists !== undefined && ref_tok_exists !== null && ref_tok_exists !== '') {
        // let token_payload = {
        //     client_id: `${process.env.REACT_APP_TOKEN_CLIENT_ID}`,
        //     grant_type: "refresh_token",
        //     scope: "openid offline_access",
        //     client_secret: `${process.env.REACT_APP_TOKEN_CLIENT_SECRET_KEY}`,
        //     refresh_token: ref_tok_exists,
        // }
        // let res = await refreshToken(token_payload);

        let token_payload = {
            TOKEN: ref_tok_exists,
        }
        let res = await getRefreshTokenForlogin(token_payload);
        let userid = localStorage.getItem(LOCALSTORAGE?.USER_ID ?? '')
        if (userid !== undefined && userid !== null && userid !== '') {
            cookies.set(COOKIES.ACCESS_TOKEN, res?.data?.id_token, {
                path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`
            });
            cookies.set(COOKIES.REFERESH_TOKEN, res?.data?.refresh_token, {
                path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`
            });
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
                let res1 = await UpdateAccesToken(update_tok_payload);

            } else {
                // window.location.href = "/klikfm/login"
                window.location.href = `${process.env.REACT_APP_CUSTOM_VARIABLE}`
            }
        } else {
            // window.location.href = "/klikfm/login"
            window.location.href = `${process.env.REACT_APP_CUSTOM_VARIABLE}`
        }

    } else {
        //window.location.href = PATH.LOGIN
    }

    //  }
}

export const FILESACNNING = async (url: any, payload: any = null, functionCode: any = null) => {
    console.log(payload, 'payload')
    const res = await axiosPrivate.post(url, payload)
    console.log(res, 'res')
}