// src/msalInstance.ts
import { PublicClientApplication } from '@azure/msal-browser';
import { toast } from 'react-toastify';

const msalInstance = new PublicClientApplication({
    auth: {
        clientId: `${process.env.REACT_APP_B2B_LOGIN_CLIENT_ID}`, // From Azure AD App Registration
        authority: `${process.env.REACT_APP_B2B_LOGIN_AUTHORITY}`, // For B2B, it's the Tenant ID from Azure AD
        redirectUri: `${process.env.REACT_APP_B2B_LOGIN_REDIRECT_URL}`,
    },
    cache: {
        cacheLocation: 'localStorage', // or sessionStorage
        storeAuthStateInCookie: false,
    },
});

msalInstance.initialize().then(() => {
}).catch((error) => {
    toast.error('Error initializing MSAL instance:', error);
});

export { msalInstance };
