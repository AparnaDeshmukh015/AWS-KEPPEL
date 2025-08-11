import { Cookies } from "react-cookie";
import { COOKIES, LOCALSTORAGE, removeLocalStorage } from "./constants";
import { PATH } from "./pagePath";
import { toast } from "react-toastify";
import axios from "./lib/axios";
import { useLocation, useNavigate } from "react-router-dom";
import EventEmitter from 'eventemitter3';
const axiosPrivate = axios;
const cookies = new Cookies();

axiosPrivate.interceptors.request.use(
  (config) => {
    const accessToken = cookies.get(COOKIES.ACCESS_TOKEN);
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
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
      // localStorage.removeItem(LOCALSTORAGE?.FACILITY);
      // localStorage.removeItem(LOCALSTORAGE?.LANGUAGE);
      // localStorage.removeItem(LOCALSTORAGE?.ROLE_ID);
      // localStorage.removeItem(LOCALSTORAGE?.USER_ID);
      // localStorage.removeItem(LOCALSTORAGE?.FACILITYID);
      // localStorage.removeItem(LOCALSTORAGE?.ROLETYPECODE);
      // localStorage.removeItem(LOCALSTORAGE?.ROLE_HIERARCHY_ID);
      // localStorage.clear();
      removeLocalStorage();
      setTimeout(() => {
        //  window.location.href ="/klikfm/login"
        window.location.href = `${process.env.REACT_APP_CUSTOM_VARIABLE}`
        // eventEmitter.emit('navigate', PATH.LOGIN);
      }, 500);
    } else if (error?.response?.status === 403) {
      toast.error(error?.message || "Request failed with status code 403");
    } else if (error?.response?.status === 404) {
      toast.error(error?.message || "Request failed with status code 404");
    } else if (error?.response?.status === 400) {
      toast.error(error?.message || "Request failed with status code 400");
    } else {
      toast.error(error?.message || "Network Error");
    }
    return Promise.reject(error);
  }
);


const eventEmitter = new EventEmitter();
// export default eventEmitter;
export default axiosPrivate;
