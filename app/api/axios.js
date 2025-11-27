import axios from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens
} from "../utils/tokenHelper";

const api = axios.create({
  baseURL: "http://43.203.41.246:8080/api/v1",
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
    const data = config.data ? (typeof config.data === "string" ? config.data.substring(0, 100) : JSON.stringify(config.data).substring(0, 100)) : "";

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📤 [API REQUEST] ${timestamp}`);
    console.log(`   Method: ${method}`);
    console.log(`   URL: ${url}`);
    if (params) console.log(`   Params: ${params}`);
    if (data) console.log(`   Data: ${data}...`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

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
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`❌ [API REQUEST ERROR] ${new Date().toISOString()}`);
    console.log(`   Error:`, error.message);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
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

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`❌ [API ERROR] ${timestamp}`);
    console.log(`   Method: ${method}`);
    console.log(`   URL: ${url}`);
    console.log(`   Status: ${status} ${statusText}`);
    console.log(`   Duration: ${duration}`);
    if (error.response?.data) {
      const errorData = typeof error.response.data === "string"
        ? error.response.data.substring(0, 150)
        : JSON.stringify(error.response.data).substring(0, 150);
      console.log(`   Error Data: ${errorData}...`);
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
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
