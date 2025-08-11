import { Cookies } from "react-cookie";
import { COOKIES, LOCALSTORAGE, removeLocalStorage } from "./constants";
import { toast } from "react-toastify";
import axios from "./lib/axios";
import LoaderManager from '../utils/context/LoaderManager';
import { decryptData } from "./encryption_decryption";

const axiosPrivate = axios;
const cookies = new Cookies();
axiosPrivate.interceptors.request.use(
  (config) => {

    // const accessToken = cookies.get(COOKIES.ACCESS_TOKEN);
    const accessToken = decryptData(localStorage.getItem(LOCALSTORAGE.ACCESS_TOKEN));
    // const loginType = cookies.get(COOKIES.LOGIN_TYPE);
    const loginType = decryptData(localStorage.getItem(LOCALSTORAGE.LOGIN_TYPE));
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
      config.headers["LoginType"] = loginType;
      config.headers["Secure"] = true;
      config.headers["SameSite"] = "strict";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error?.config;
    if (error?.response?.status === 401) {
      prevRequest.sent = true;
      cookies.remove(COOKIES.ACCESS_TOKEN, { path: `${process.env.REACT_APP_CUSTOM_VARIABLE}` });
      cookies.remove(COOKIES.REFERESH_TOKEN, { path: `${process.env.REACT_APP_CUSTOM_VARIABLE}` });

      removeLocalStorage();
      setTimeout(() => {
        LoaderManager.redirect("401");

      }, 500);
    } else if (error.message === 'Request failed with status code 500') {
      toast.error('Something went wrong');

    } else if (error.message === 'Request failed with status code 503') {
      LoaderManager.redirect("503");
      toast.error('Something went wrong, Service Unavailable');
    } else if (error.message === 'Network Error') {
      toast.error(`${error.message}`)
      //LoaderManager.redirect("500");
    } else if (error.message === 'timeout exceeded') {
      toast.error(`${error.message}, Please try again after some time`)
    } else if (error.message === "Request failed with status code 404") {
       LoaderManager.redirect("404");
      toast.error(error?.message || "Request failed with status code 404");
      
    } else if (error.message === "Request failed with status code 403") {
      LoaderManager.redirect("403");
      toast.error(error?.message || "Request failed with status code 403");


    } else if (error.message === "Request failed with status code 501") {
      LoaderManager.redirect("501");
      toast.error(error?.message || "Request failed with status code 501");


    } else if (error.message === "Request failed with status code 502") {
      LoaderManager.redirect("502");
      toast.error(error?.message || "Request failed with status code 502");


    } else if(error.response.status === 429){
      toast.error("Rate limit exceeded. Please try again later.");
    }else {

      toast.error(error?.message || "Network Error");

    }
    return Promise.reject(error);
  }
);

// const eventEmitter = new EventEmitter();
// export default eventEmitter;


export default axiosPrivate;
