import { MsalAuthProvider, LoginType } from 'react-aad-msal';

export const authProvider = new MsalAuthProvider(
    {
        auth: {
            authority: "https://login.microsoftonline.com/5d6b5745-fc6d-4c80-80e6-9f697d8343a8",
            clientId: "b95b65e6-c47a-4d13-88ad-4ac93842b185", //Application (client) ID from Overview blade in App Registration

        },
        cache: {
            cacheLocation: 'sessionStorage',
            storeAuthStateInCookie: true,
        },
    },
    {
        scopes: ['https://graph.microsoft.com/.default']
    },

    LoginType.Popup
);