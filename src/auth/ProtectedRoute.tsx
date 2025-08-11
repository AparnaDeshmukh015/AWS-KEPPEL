import React from "react";
import { Navigate } from "react-router-dom";
import { PATH } from "../utils/pagePath";
//import { Cookies } from "react-cookie";
import { LOCALSTORAGE } from "../utils/constants";
import { decryptData } from "../utils/encryption_decryption";

const ProtectedRoute = (props: any) => {
 // let cookie = new Cookies();
  // const isSignedIn = cookie.get(COOKIES.ACCESS_TOKEN); //add here token storage location;

  const isSignedIn = decryptData(localStorage.getItem(LOCALSTORAGE.ACCESS_TOKEN));
  if (!isSignedIn) {
    return <Navigate to={PATH.LOGIN} replace />;
  }

  return props.children;
};

export default ProtectedRoute;
