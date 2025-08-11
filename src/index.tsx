import React, { Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ToastContainer } from "react-toastify";
import "./i18n";
import Loader from "./components/Loader/Loader";
import { useTranslation } from "react-i18next";
import { COOKIES, LOCALSTORAGE } from "./utils/constants";
import LoaderS from "./components/Loader/Loader";
import IdleTimer from "./utils/IdealTimer";
import { LoaderProvider } from "./utils/context/LoaderContext";
import { Cookies } from "react-cookie";
import { refreshToken, UpdateAccesToken } from "./utils/B2CLogin";
import { PATH } from "./utils/pagePath";
import { decryptData } from "./utils/encryption_decryption";
const cookies = new Cookies();
// Custom hook to set the language
const useSetLanguage = () => {
  const { i18n } = useTranslation();
  useEffect(() => {
    const language = localStorage.getItem(`${LOCALSTORAGE?.LANGUAGE}`) || "EN";
    i18n.changeLanguage(language);
  }, [i18n]);
};
const AppWrapper = () => {
  useSetLanguage();

  useEffect(() => {
   // RefreshTokenFunc();

  }, []);

  const RefreshTokenFunc = async () => {
    if (window.location.pathname !== '/login') {
      let ref_tok_exists = cookies.get(COOKIES.REFERESH_TOKEN);
      if (ref_tok_exists !== undefined && ref_tok_exists !== null && ref_tok_exists !== '') {
        let token_payload = {
          client_id: `${process.env.REACT_APP_TOKEN_CLIENT_ID}`,
          grant_type: "refresh_token",
          scope: "openid offline_access",
          client_secret: `${process.env.REACT_APP_TOKEN_CLIENT_SECRET_KEY}`,
          refresh_token: ref_tok_exists,
        }
        let res = await refreshToken(token_payload);
        let userid = localStorage.getItem(LOCALSTORAGE?.USER_ID ?? '')
        if (userid !== undefined && userid !== null && userid !== '') {
          cookies.set(COOKIES.ACCESS_TOKEN, res?.data?.id_token, {
            path:`${process.env.REACT_APP_CUSTOM_VARIABLE}`,
          });
          cookies.set(COOKIES.REFERESH_TOKEN, res?.data?.refresh_token, {
            // path: PATH.DEFAULT,
            path:`${process.env.REACT_APP_CUSTOM_VARIABLE}`
          });
          if (res?.status === 200) {
            let update_tok_payload = {
              "LOGIN_TYPE": "W",
              "USER_ID": decryptData(userid),
              "TOKEN": res?.data?.id_token
            }
            let res1 = await UpdateAccesToken(update_tok_payload);

          } else {
            window.location.href = PATH.LOGIN
          }
        }

      } else {
        //window.location.href = PATH.LOGIN
      }

    }
    let timeout_time: any = process.env.REACT_APP_REFRESH_TOKEN_TIME;
   
    setTimeout(() => {
      RefreshTokenFunc();
    }, timeout_time * 1); 
  }

  return (
    <>
     
      <LoaderProvider>
        <>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          {/* <Suspense fallback={<LoaderS />}> */}
          <Suspense fallback={<LoaderS />}>

            <RouterProvider router={router} />
          </Suspense>
        </>
      </LoaderProvider>
    </>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  // <React.StrictMode>
  <AppWrapper />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
