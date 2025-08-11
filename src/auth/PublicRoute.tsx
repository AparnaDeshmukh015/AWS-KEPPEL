import React from 'react'
import { Navigate } from 'react-router-dom'
//import { Cookies } from "react-cookie";
import {LOCALSTORAGE } from "../utils/constants";
import { PATH } from '../utils/pagePath';
import { decryptData } from '../utils/encryption_decryption';

const PublicRoute = (props: any) => {
   // let cookie = new Cookies();
    //const isSignedIn = cookie.get(COOKIES.ACCESS_TOKEN) //add here token storage location;");
    const isSignedIn = decryptData(localStorage.getItem(LOCALSTORAGE.ACCESS_TOKEN));

    if (isSignedIn) {

        return <Navigate to={PATH.WORKORDERMASTER} replace />

    }

    return props.children
}

export default PublicRoute;