import { Configuration, LogLevel } from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
        clientId: `${process.env.REACT_APP_B2B_LOGIN_CLIENT_ID}`, // From Azure AD App Registration
        authority: `${process.env.REACT_APP_B2B_LOGIN_AUTHORITY}`, // For B2B, it's the Tenant ID from Azure AD
        redirectUri: `${process.env.REACT_APP_B2B_LOGIN_REDIRECT_URL}`, // Same as you set in Azure portal
    },
    cache: {
        cacheLocation: "sessionStorage", // You can also use localStorage
        storeAuthStateInCookie: true,
    },
    system: {
        loggerOptions: {
            logLevel: LogLevel.Verbose,
        },
    },
};

export const loginRequest = {
    scopes: ["User.Read"], // Permissions required for Microsoft Graph API
};
