import React, { Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import reportWebVitals from "./reportWebVitals";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ToastContainer } from "react-toastify";
import "./i18n";
import { useTranslation } from "react-i18next";
import { COOKIES, LOCALSTORAGE } from "./utils/constants";
import LoaderS from "./components/Loader/Loader";
import { LoaderProvider } from "./utils/context/LoaderContext";
// import { Cookies } from "react-cookie";
import { refreshToken, UpdateAccesToken } from "./utils/B2CLogin";
import { PATH } from "./utils/pagePath";
import { decryptData, encryptData } from "./utils/encryption_decryption";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./utils/B2BLogin";
import { MsalProvider } from "@azure/msal-react";
import * as Sentry from "@sentry/react";
import ErrorPage from "./pages/ErrorComponenet/ErrorPage";
import { Provider } from "react-redux";
import store from "./store/store";

// Code Updated Dev - Shoaib, Requried for Error Logging!
Sentry.init({
  debug: false,
  dsn: process.env.REACT_APP_SENTRY_END_POINTS !== 'local' ? process.env.REACT_APP_SENTRY_END_POINTS : undefined,
  environment: `${process.env.REACT_APP_ENV}`,
  integrations: [
    Sentry.linkedErrorsIntegration({
      limit: 7,
    }),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  beforeSend(event) {
    // Prevent sending events from localhost
    if (window.location.hostname === 'localhost' || process.env.REACT_APP_SENTRY_END_POINTS === 'local') {
      return null;
    }
    return event;
  },
});


// Sentry.init({
//   debug: false,
//   //environment: 'local',
//   dsn: `${process.env.REACT_APP_SENTRY_END_POINTS}`,
//   integrations: [
//     Sentry.browserTracingIntegration(),
//     Sentry.browserProfilingIntegration()
//     //  Sentry.replayIntegration(),
//   ],

//   environment: `${process.env.REACT_APP_ENV}` || 'development', // Use NODE_ENV to distinguish environments
//   beforeSend(event) {
//     // Prevent sending events from localhost
//     if (window.location.hostname === 'localhost') {
//       return null;
//     }
//     return event;
//   },

//   // Tracing
//   tracesSampleRate: 1.0, //  Capture 100% of the transactions
//   // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
//   tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
//   profilesSampleRate: 1.0,
//   // Session Replay
//   // replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
//   // replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
// });

const msalInstance = new PublicClientApplication(msalConfig);
//const cookies = new Cookies();
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


  // Call the interceptor setup


  const RefreshTokenFunc = async () => {
    if (window.location.pathname !== '/login') {
      // let ref_tok_exists = cookies.get(COOKIES.REFERESH_TOKEN);
      let ref_tok_exists = decryptData((localStorage.getItem(COOKIES.REFERESH_TOKEN)));
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
          // cookies.set(COOKIES.ACCESS_TOKEN, res?.data?.id_token, {
          //   path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`,
          //   secure: true,
          //   sameSite: "strict"
          // });

          const accesstoken: any = encryptData(
            JSON.stringify(res?.data?.id_token)
          );
          localStorage.setItem(LOCALSTORAGE.ACCESS_TOKEN, accesstoken);

          // cookies.set(COOKIES.REFERESH_TOKEN, res?.data?.refresh_token, {
          //   // path: PATH.DEFAULT,
          //   path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`,
          //   secure: true,
          //   sameSite: "strict",
          //   httpOnly: true
          // });
          const refreshtoken: any = encryptData(
            JSON.stringify(res?.data?.refresh_token)
          );
          localStorage.setItem(LOCALSTORAGE.REFERESH_TOKEN, refreshtoken);

          if (res?.status === 200) {
            let update_tok_payload = {
              "LOGIN_TYPE": "W",
              "USER_ID": decryptData(userid),
              "TOKEN": res?.data?.id_token
            }
            await UpdateAccesToken(update_tok_payload);

          } else {
            window.location.href = PATH.LOGIN

          }
        }

      } else {

      }

    }
    let timeout_time: any = process.env.REACT_APP_REFRESH_TOKEN_TIME;

    setTimeout(() => {
      RefreshTokenFunc();
    }, timeout_time * 1);
  }


  return (
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

        <Suspense fallback={<LoaderS />}>

          <RouterProvider router={router}
            fallbackElement={<ErrorPage />}
          />
        </Suspense>
      </>
    </LoaderProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  // <React.StrictMode>
  <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
    <Provider store={store}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
      <MsalProvider instance={msalInstance}>
        <AppWrapper />
      </MsalProvider>
      {/* </PersistGate> */}
    </Provider >
  </Sentry.ErrorBoundary>

);

// If you want to start measuring performance in your app, pass a function

// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
