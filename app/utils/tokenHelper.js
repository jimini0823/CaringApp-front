import AsyncStorage from "@react-native-async-storage/async-storage";
import { signupStore } from "../context/SignupContext";

const TOKEN_KEYS = {
  ACCESS_TOKEN: "@caring_app:access_token",
  REFRESH_TOKEN: "@caring_app:refresh_token",
};

/**
 * Access Token을 AsyncStorage에 저장
 */
export const saveAccessToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
  } catch (e) {
    if (__DEV__) {
      console.error("saveAccessToken Error:", e);
    }
  }
};

/**
 * Refresh Token을 AsyncStorage에 저장
 */
export const saveRefreshToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token);
  } catch (e) {
    if (__DEV__) {
      console.error("saveRefreshToken Error:", e);
    }
  }
};

/**
 * Access Token과 Refresh Token을 함께 저장
 * refreshToken이 없는 경우 (OAuth 임시 토큰 등) accessToken만 저장
 */
export const saveTokens = async (accessToken, refreshToken) => {
  try {
    if (refreshToken) {
      // access_token과 refresh_token 둘 다 저장
      await AsyncStorage.multiSet([
        [TOKEN_KEYS.ACCESS_TOKEN, accessToken],
        [TOKEN_KEYS.REFRESH_TOKEN, refreshToken],
      ]);
    } else {
      // refresh_token이 없는 경우 access_token만 저장
      await AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    }
  } catch (e) {
    if (__DEV__) {
      console.error("saveTokens Error:", e);
    }
  }
};

/**
 * AsyncStorage에서 Access Token 조회
 */
export const getAccessToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    return token || null;
  } catch (e) {
    if (__DEV__) {
      console.error("getAccessToken Error:", e);
    }
    return null;
  }
};

/**
 * AsyncStorage에서 Refresh Token 조회
 */
export const getRefreshToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    return token || null;
  } catch (e) {
    if (__DEV__) {
      console.error("getRefreshToken Error:", e);
    }
    return null;
  }
};

/**
 * 모든 토큰 삭제
 */
export const clearTokens = async () => {
  try {
    await AsyncStorage.multiRemove([
      TOKEN_KEYS.ACCESS_TOKEN,
      TOKEN_KEYS.REFRESH_TOKEN,
    ]);
  } catch (e) {
    if (__DEV__) {
      console.error("clearTokens Error:", e);
    }
  }
};

/**
 * 기존 호환성을 위한 함수 (AsyncStorage 우선, 없으면 Context에서 가져오기)
 */
export const getSignupToken = async () => {
  try {
    // 먼저 AsyncStorage에서 시도
    const token = await getAccessToken();
    if (token) {
      return token;
    }
    
    // 없으면 Context에서 가져오기 (회원가입 플로우 중일 수 있음)
    const state = signupStore.getState();
    return state?.signupData?.accessToken || null;
  } catch (e) {
    if (__DEV__) {
      console.error("getSignupToken Error:", e);
    }
    return null;
  }
};
