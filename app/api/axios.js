import axios from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens
} from "../utils/tokenHelper";

// 개발 환경에서 사용할 백엔드 서버 주소
const DEV_BASE_URL = "http://43.203.41.246:8080/api/v1";

const api = axios.create({
  baseURL: __DEV__ ? DEV_BASE_URL : "http://43.203.41.246:8080/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  async (config) => {
    config.metadata = { startTime: new Date() };

    const timestamp = new Date().toISOString();
    const method = config.method?.toUpperCase() || "GET";
    const url = `${config.baseURL || ""}${config.url}`;
    const params = config.params ? JSON.stringify(config.params) : "";
    
    // 데이터 로깅 개선 (authorizationCode 포함)
    let dataLog = "";
    if (config.data) {
      if (typeof config.data === "string") {
        dataLog = config.data.substring(0, 200);
      } else {
        const dataStr = JSON.stringify(config.data);
        // authorizationCode가 있으면 일부만 보여주고 전체 길이 표시
        if (dataStr.includes("authorization") || dataStr.includes("authorization_code")) {
          try {
            const dataObj = JSON.parse(dataStr);
            const authCode = dataObj.authorization || dataObj.authorization_code;
            if (authCode) {
              dataLog = JSON.stringify({
                ...dataObj,
                [dataObj.authorization ? "authorization" : "authorization_code"]: `${authCode.substring(0, 30)}... (길이: ${authCode.length})`,
              });
            } else {
              dataLog = dataStr.substring(0, 200);
            }
          } catch {
            dataLog = dataStr.substring(0, 200);
          }
        } else {
          dataLog = dataStr.substring(0, 200);
        }
      }
    }

    if (__DEV__) {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`📤 [API REQUEST] ${timestamp}`);
      console.log(`   Method: ${method}`);
      console.log(`   URL: ${url}`);
      if (params) console.log(`   Params: ${params}`);
      if (dataLog) console.log(`   Data: ${dataLog}${config.data && typeof config.data === "object" && JSON.stringify(config.data).length > 200 ? "..." : ""}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }

    const noAuthNeeded = [
      "/auth/register",
      "/auth/login",
      "/auth/certification-code",
      "/auth/verify-phone",
      "/auth/token/refresh",
      "/auth/oauth2/login",
      "/auth/oauth2/authorize",
      "/auth/oauth2/certification-code",
      "/auth/oauth2/register",
      "/auth/oauth2/verify-phone",
      "/auth/institution/certification-code",
      "/auth/institution/login",
      "/auth/institution/register",
      "/auth/institution/verify-phone",
      "/auth/institution/token/refresh",
      "/public/advertisements",
    ];

    if (noAuthNeeded.some((path) => config.url.includes(path))) {
      return config;
    }

    try {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      return config;
    }

    return config;
  },
  (error) => {
    if (__DEV__) {
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error(`❌ [API REQUEST ERROR] ${new Date().toISOString()}`);
      console.error(`   Error:`, error.message);
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const startTime = response.config.metadata?.startTime;
    const duration = startTime ? `${endTime - startTime}ms` : "N/A";

    const timestamp = new Date().toISOString();
    const method = response.config.method?.toUpperCase() || "GET";
    const url = `${response.config.baseURL || ""}${response.config.url}`;
    const status = response.status;
    const statusText = response.statusText;

    if (__DEV__) {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`✅ [API RESPONSE] ${timestamp}`);
      console.log(`   Method: ${method}`);
      console.log(`   URL: ${url}`);
      console.log(`   Status: ${status} ${statusText}`);
      console.log(`   Duration: ${duration}`);
      if (response.data) {
        const dataPreview = typeof response.data === "string" 
          ? response.data.substring(0, 150) 
          : JSON.stringify(response.data).substring(0, 150);
        console.log(`   Data: ${dataPreview}...`);
      }
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }

    return response;
  },
  async (error) => {
    const endTime = new Date();
    const startTime = error.config?.metadata?.startTime;
    const duration = startTime ? `${endTime - startTime}ms` : "N/A";

    const timestamp = new Date().toISOString();
    const method = error.config?.method?.toUpperCase() || "GET";
    const url = error.config ? `${error.config.baseURL || ""}${error.config.url}` : "Unknown";
    const status = error.response?.status || "N/A";
    const statusText = error.response?.statusText || error.message;

    if (__DEV__) {
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error(`❌ [API ERROR] ${timestamp}`);
      console.error(`   Method: ${method}`);
      console.error(`   URL: ${url}`);
      console.error(`   Status: ${status} ${statusText}`);
      console.error(`   Duration: ${duration}`);
      
      if (url?.includes('/auth/oauth2/authorize')) {
        console.error(`   ⚠️ OAuth authorize 엔드포인트 에러 발생`);
        console.error(`   요청 Payload:`, error.config?.data);
      }
      
      if (error.response?.data) {
        const errorData = typeof error.response.data === "string"
          ? error.response.data
          : JSON.stringify(error.response.data, null, 2);
        console.error(`   Error Data: ${errorData}`);
      }
      
      if (error.response) {
        console.error(`   Response Headers:`, JSON.stringify(error.response.headers, null, 2));
      }
      
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // OAuth authorize 엔드포인트는 인증이 필요 없는 엔드포인트이므로 토큰 refresh 시도하지 않음
      if (originalRequest.url?.includes('/auth/oauth2/authorize')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(
          `${api.defaults.baseURL}/auth/token/refresh`,
          {
            request_token: refreshToken,
          }
        );

        const { access_token, refresh_token } = response.data.data || response.data;
        
        if (access_token) {
          await saveTokens(access_token, refresh_token || refreshToken);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          processQueue(null, access_token);
          isRefreshing = false;
          
          return api(originalRequest);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        await clearTokens();
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
