import { PublicClientApplication, LogLevel, InteractionRequiredAuthError } from "@azure/msal-browser";
import $ from "jquery"
import { startWaiting, stopWaiting, submitFailure, alertDialog }  from '@/assets/js/apputil.js'
import { getApiUrl, getBaseUrl, DEFAULT_CONTENT_TYPE } from "@/assets/js/appinfo";

var ssoCallback;
export function setSSOCallback(callback) {
    ssoCallback = callback;
}
export function startSSO(domainid,callback) {
    setSSOCallback(callback);
    startWaiting();
    $.ajax({
        url: getBaseUrl()+"/auth/config/"+domainid,
        type: "POST",
        data: {ajax: true}, 
        dataType: "json",
        contentType: DEFAULT_CONTENT_TYPE,
        error : function(transport,status,errorThrown) { 
            submitFailure(transport,status,errorThrown,false); 
        },
        success: async function(data,status,xhr){ 
            console.log("success : "+xhr.responseText);
            stopWaiting();
            trySSOLogin(data);
        }
    });			
}
export async function trySSOLogin(data) {
    msalConfig.auth = {...data.body.config.auth, authType: data.body.type, navigateToLoginRequestUrl: true};
    console.log("auth config",msalConfig.auth);
    delete msalConfig.auth.clientSecret;
    msalObject = new PublicClientApplication(msalConfig);
    await msalObject.initialize();
    msalObject.handleRedirectPromise()
    .then(ssoHandleResponse)
    .catch((error) => {
        console.error(error);
    });
    ssoSignIn();
}

const msalConfig = {
    auth: {
        clientId: "",
        authority: "",
        redirectUri: "",
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {	
        loggerOptions: {	
            loggerCallback: (level, message, containsPii) => {	
                if (containsPii) {		
                    return;		
                }		
                switch (level) {		
                    case LogLevel.Error:		
                        console.error(message);		
                        return;		
                    case LogLevel.Info:		
                        console.info(message);		
                        return;		
                    case LogLevel.Verbose:		
                        console.debug(message);		
                        return;		
                    case LogLevel.Warning:		
                        console.warn(message);		
                        return;		
                }	
            }	
        }	
    }
};
const loginRequest = {
    scopes: ["openid"]
};

let msalObject = null;
let username = "";
let ssoSignedIn = false;
export function isSSOSignedIn() { return ssoSignedIn; }
export function ssoSelectAccount(response) {
    if(!msalObject) return;
    const currentAccounts = msalObject.getAllAccounts();
    if (currentAccounts.length === 0) {
        return;
    } else if (currentAccounts.length > 1) {
        console.warn("Multiple accounts detected.");
    } else if (currentAccounts.length === 1) {
        ssoSignedIn = true;
        username = currentAccounts[0].username;
        if(!username || username=="") {
            if(response) username = response.account.idTokenClaims.given_name;
        }
        tryLogIn(username);
    }
}
export function ssoHandleResponse(response) {
    console.log("handleResponse",response);
    if (response !== null) {
        ssoSignedIn = true;
        username = response.account.username;
        if(!username || username=="") {
            username = response.account.idTokenClaims.given_name;
        }
        tryLogIn(username);
    } else {
        ssoSelectAccount(response);
    }
}
export async function ssoSignIn() {
    if(!msalObject) return;
    try {
        let response = await msalObject.loginPopup(loginRequest);
        ssoHandleResponse(response);
    } catch(error) {
        console.error(error);
        alertDialog(error.description);
    }
}
export function ssoSignOut() {
    if(!msalObject) throw new Error("Configuration not found");
    if(!ssoSignedIn) throw new Error("Account does not signed in");
    let homeurl = window.location.protocol+"//"+window.location.hostname+(window.location.port ? ':'+window.location.port: '')+"/";
    console.log("homeurl",homeurl);
    const logoutRequest = {
        account: msalObject.getAccountByUsername(username),
        postLogoutRedirectUri: msalConfig.auth.redirectUri || homeurl,
        mainWindowRedirectUri: msalConfig.auth.redirectUri || homeurl
    };
    console.log("logoutRequest",logoutRequest);
    msalObject.logoutPopup(logoutRequest).then(() => {
        ssoSignedIn = false;
        username = "";
    });
    return true;
}
export function getTokenPopup(request) {
    request.account = msalObject.getAccountByUsername(username);    
    return msalObject.acquireTokenSilent(request)
        .catch(error => {
            console.warn("silent token acquisition fails. acquiring token using popup");
            if (error instanceof InteractionRequiredAuthError) {
                return msalObject.acquireTokenPopup(request)
                    .then(tokenResponse => {
                        console.log(tokenResponse);
                        return tokenResponse;
                    }).catch(error => {
                        console.error(error);
                    });
            } else {
                console.warn(error);   
            }
    });
}
export function tryLogIn(username) {
    startWaiting();
    $.ajax({
        url: getApiUrl()+"/api/sign/access",
        type: "POST",
        contentType: DEFAULT_CONTENT_TYPE,
        data: {username: username}, 
        dataType: "json",
        error : function(transport,status,errorThrown) { 
            submitFailure(transport,status,errorThrown,false); 
        },
        success: function(data,status,xhr){ 
            console.log("success : "+xhr.responseText);
            stopWaiting();
            //loginSuccess(data);
            if(ssoCallback) ssoCallback(data);
        }
    });			
}
export function doSSOLogout() {
    ssoSignOut();
}
