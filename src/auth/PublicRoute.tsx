import React from 'react'
import { Navigate } from 'react-router-dom'
import { Cookies } from "react-cookie";
import { COOKIES } from "../utils/constants";
import { PATH } from '../utils/pagePath';

const PublicRoute = (props:any) => {
    let cookie = new Cookies();
    const isSignedIn = cookie.get(COOKIES.ACCESS_TOKEN) //add here token storage location;
    
    if(isSignedIn){
        return <Navigate to={PATH.WORKORDERMASTER} replace />
    }

    return props.children
}

export default PublicRoute;