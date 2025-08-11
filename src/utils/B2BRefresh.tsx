// // src/hooks/useApiCallWithTokenRefresh.tsx
// import { useMsal } from '@azure/msal-react';
// import { jwtDecode } from 'jwt-decode';
// import { msalInstance } from './msalInstance';

// export const useApiCallWithTokenRefresh = (scopes: string[]) => {

//   const getAccessToken = async () => {
//     const request = {
//       scopes,
//       account: JSON.parse(localStorage.getItem('AccountDetails') ?? ''),
//     };

//     try {
//       const response = await msalInstance.acquireTokenSilent(request);
//       const decodedToken: any = jwtDecode(response.accessToken);
//       const expirationTime = decodedToken.exp * 1000;
//       const currentTime = Date.now();
//       const bufferTime = 5 * 60 * 1000;

//       if (expirationTime - currentTime <= bufferTime) {
//         const refreshedResponse = await msalInstance.acquireTokenSilent(request);
//         return refreshedResponse.accessToken;
//       }

//       return response.accessToken;
//     } catch (error: any) {
//       if (error.name === 'InteractionRequiredAuthError') {
//         const interactiveResponse = await msalInstance.acquireTokenPopup(request);
//         return interactiveResponse.accessToken;
//       }
//       throw error;
//     }
//   };

//   return { getAccessToken };
// };

// src/utils/apiCallWithTokenRefresh.ts
//import { Cookies } from 'react-cookie';
import {  LOCALSTORAGE } from './constants';
import { msalInstance } from './msalInstance'; // Assuming you have msalInstance exported from elsewhere
import { jwtDecode } from 'jwt-decode';
import { decryptData, encryptData } from './encryption_decryption';
//let cookies = new Cookies();

export const getAccessTokenWithRefresh = async (scopes: string[],): Promise<boolean> => {
  const request = {
    scopes,
    account: decryptData((localStorage.getItem('AccountDetails') ?? '')),
  };

  const res = await msalInstance.acquireTokenSilent(request).then(response => {
    const decodedToken: any = jwtDecode(response?.idToken);
    const expirationTime = decodedToken?.exp;
    const currentTime = Date.now();
    let expiresIn: any = { "not_before": currentTime, "id_token_expires_in": expirationTime }
    localStorage.setItem("expiresIn", JSON.stringify(expiresIn));

    let access_token = response?.idToken
    let refresh_token = response?.idToken;

    const refreshtoken: any = encryptData(
      JSON.stringify(refresh_token)
    );
    localStorage.setItem(LOCALSTORAGE.REFERESH_TOKEN, refreshtoken);

    const accesstoken: any = encryptData(
      JSON.stringify(access_token)
    );
    localStorage.setItem(LOCALSTORAGE.ACCESS_TOKEN, accesstoken);

    return true;
  }).catch(async error => {
    if (error.name === 'InteractionRequiredAuthError') {
      await msalInstance.acquireTokenPopup(request).then(interactiveResponse => {
        // cookies.set(COOKIES.REFERESH_TOKEN, interactiveResponse.idToken, {
        //   path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`,
        //   secure: true,
        //   sameSite: "strict",
        //   httpOnly: true
        // });
        const refreshtoken: any = encryptData(
          JSON.stringify(interactiveResponse?.idToken)
        );
        localStorage.setItem(LOCALSTORAGE.REFERESH_TOKEN, refreshtoken);

        // cookies.set(COOKIES.ACCESS_TOKEN, interactiveResponse.idToken, {
        //   path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`,
        //   secure: true,
        //   sameSite: "strict",
        //   httpOnly: true
        // });
        const accesstoken: any = encryptData(
          JSON.stringify(interactiveResponse?.idToken)
        );
        localStorage.setItem(LOCALSTORAGE.ACCESS_TOKEN, accesstoken);
        return true;
      });
    }
    return false;
  })
  return res
}

