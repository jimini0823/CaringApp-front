import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const generateRandomState = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const getGoogleRedirectUri = () => {
  const iosClientId = "984125285462-8n43b71bdm741om2c9u76utgdtd8v17a";
  const reversedClientId = `com.googleusercontent.apps.${iosClientId}`;
  return `${reversedClientId}:/oauth2redirect/google`;
};

const parseUrlParams = (url) => {
  try {
    const urlObj = new URL(url);
    const params = {};
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  } catch (error) {
    let queryString = "";
    
    if (url.includes("?")) {
      queryString = url.split("?")[1];
      if (queryString.includes("#")) {
        queryString = queryString.split("#")[0];
      }
    } else if (url.includes("#")) {
      queryString = url.split("#")[1];
    }
    
    const params = {};
    if (queryString) {
      queryString.split("&").forEach((param) => {
        const equalIndex = param.indexOf("=");
        if (equalIndex > 0) {
          const key = decodeURIComponent(param.substring(0, equalIndex));
          const value = decodeURIComponent(param.substring(equalIndex + 1) || "");
          params[key] = value;
        }
      });
    }
    
    return params;
  }
};

/**
 * 카카오 SDK 로그인
 */
const performKakaoLogin = async () => {
  try {
    const KakaoLogin = await import("@react-native-seoul/kakao-login");
    const loginFn = KakaoLogin.login || KakaoLogin.default?.login;
    
    if (!loginFn) {
      throw new Error("카카오 SDK login 함수를 찾을 수 없습니다.");
    }
    
    const result = await loginFn();
    
    if (!result.accessToken) {
      throw new Error("카카오 로그인 실패: access_token을 받지 못했습니다.");
    }
    
    return {
      accessToken: result.accessToken,
      state: generateRandomState(),
      redirectUri: "kakao_sdk",
    };
  } catch (error) {
    if (error.message?.includes("Cannot find module") || error.code === "MODULE_NOT_FOUND") {
      throw new Error(
        "카카오 SDK를 사용할 수 없습니다.\n" +
        "네이티브 빌드(EAS Build 또는 expo prebuild)가 필요합니다.\n\n" +
        "Expo Go에서는 카카오 로그인을 사용할 수 없습니다."
      );
    }
    throw error;
  }
};

/**
 * 네이버 SDK 로그인
 */
const performNaverLogin = async () => {
  try {
    const NaverLoginModule = await import("@react-native-seoul/naver-login");
    const NaverLogin = NaverLoginModule.default || NaverLoginModule;
    
    NaverLogin.initialize({
      appName: "CaringApp",
      consumerKey: "H5l2zITZ1TAaRkQXH2wu",
      consumerSecret: "CmdAO6jS_A",
      serviceUrlSchemeIOS: "com.caringapp.mobile",
      disableNaverAppAuthIOS: false,
    });
    
    const result = await NaverLogin.login();
    const accessToken = result.successResponse?.accessToken;
    
    if (!accessToken) {
      if (result.failureResponse) {
        throw new Error(`네이버 로그인 실패: ${result.failureResponse.message || result.failureResponse.code}`);
      }
      throw new Error("네이버 로그인 실패: access_token을 받지 못했습니다.");
    }
    
    return {
      accessToken: accessToken,
      state: generateRandomState(),
      redirectUri: "naver_sdk",
    };
  } catch (error) {
    if (error.message?.includes("Cannot find module") || error.code === "MODULE_NOT_FOUND") {
      throw new Error(
        "네이버 SDK를 사용할 수 없습니다.\n" +
        "네이티브 빌드(EAS Build 또는 expo prebuild)가 필요합니다.\n\n" +
        "Expo Go에서는 네이버 로그인을 사용할 수 없습니다."
      );
    }
    throw error;
  }
};

/**
 * Google OAuth 로그인 (WebBrowser 방식)
 */
const performGoogleLogin = async () => {
  const redirectUri = getGoogleRedirectUri();
  const state = generateRandomState();
  const clientId = "984125285462-8n43b71bdm741om2c9u76utgdtd8v17a.apps.googleusercontent.com";
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `scope=${encodeURIComponent("openid profile email")}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `state=${encodeURIComponent(state)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type === "success") {
    const params = parseUrlParams(result.url);

    if (params.error) {
      throw new Error(`OAuth 오류: ${params.error_description || params.error}`);
    }

    const code = params.code || params.authorization_code;
    const returnedState = params.state;

    if (!code) {
      throw new Error("OAuth 인증 코드를 받지 못했습니다.");
    }

    if (returnedState && returnedState !== state) {
      throw new Error("OAuth state가 일치하지 않습니다.");
    }
    
    const accessToken = await exchangeGoogleCodeForToken(code, redirectUri, clientId);
    
    return {
      accessToken: accessToken,
      state: returnedState || state,
      redirectUri: redirectUri,
    };
  } else if (result.type === "cancel") {
    throw new Error("OAuth 인증이 사용자에 의해 취소되었습니다.");
  } else {
    throw new Error(`OAuth 인증에 실패했습니다. (타입: ${result.type})`);
  }
};

const exchangeGoogleCodeForToken = async (code, redirectUri, clientId) => {
  const tokenUrl = "https://oauth2.googleapis.com/token";
  
  const params = new URLSearchParams();
  params.append("code", code);
  params.append("client_id", clientId);
  params.append("redirect_uri", redirectUri);
  params.append("grant_type", "authorization_code");
  
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Google 토큰 교환 실패: ${response.status} - ${errorData}`);
  }
  
  const tokenResponse = await response.json();
  
  if (!tokenResponse.access_token) {
    throw new Error("Google access_token을 받지 못했습니다.");
  }
  
  return tokenResponse.access_token;
};

/**
 * OAuth 로그인 메인 함수
 * - Google: WebBrowser 방식
 * - Kakao: 네이티브 SDK
 * - Naver: 네이티브 SDK
 */
export const performOAuthLogin = async (provider) => {
  const providerLower = provider.toLowerCase();
  
  try {
    switch (providerLower) {
      case "google":
        return await performGoogleLogin();
      case "kakao":
        return await performKakaoLogin();
      case "naver":
        return await performNaverLogin();
      default:
        throw new Error(`지원하지 않는 OAuth 제공자: ${provider}`);
    }
  } catch (error) {
    if (__DEV__) {
      console.error(`[OAuth Helper] ${provider} OAuth error:`, error);
    }
    throw error;
  }
};
