import axios from "axios";
import qs from 'qs';
import { callPostAPI } from "../services/apis";
import { ENDPOINTS } from "./APIEndpoints";
import { toast } from "react-toastify";

//let TOKEN_URL = "https://reb2cstg.b2clogin.com/REb2cstg.onmicrosoft.com/B2C_1A_SIGNUPORSIGNINWITHPHONEOREMAIL_KPFM_RND/oauth2/v2.0/token";
let TOKEN_URL: any = `${process.env.REACT_APP_TOKEN_GENERATE_URL}`;

export const getLoginToken = async (payload: any) => {
    try {
        const res = await axios.post(TOKEN_URL, qs.stringify(payload), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
       return res;
    } catch (error: any) {
        toast.error(error)
      
    }


};

export const refreshToken = async (payload: any) => {
  
    try {
        const res = await axios.post(TOKEN_URL, qs.stringify(payload), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        return res;
    } catch (error: any) {
        toast.error(error)
    }


};

export const UpdateAccesToken = async (payload: any) => {
    try {
        const res = await callPostAPI(ENDPOINTS.REFRESH_TOKEN, payload, '')
        // const res = await axios.post(apue, qs.stringify(payload), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        return res;
    } catch (error: any) {
        toast.error(error)
    }


};

