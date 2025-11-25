// app/api/advertisement/public.api.js
import apiClient from "../axios";

// --------------------------------------------------
// 1. 현재 진행중인 광고 목록 (공개 API)
//    GET /api/v1/advertisements/active
// --------------------------------------------------
export const getActiveAdvertisements = () => {
  return apiClient.get("/advertisements/active");
};

// --------------------------------------------------
// 2. 유형별 진행중인 광고 조회 (공개 API)
//    GET /api/v1/advertisements/active/type/{type}
//    타입: MAIN_BANNER, PREMIUM_LIST, SIDE_BANNER, SEARCH_TOP
// --------------------------------------------------
export const getActiveAdvertisementsByType = (type) => {
  return apiClient.get(`/advertisements/active/type/${type}`);
};

