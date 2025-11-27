import apiClient from "../axios";

// --------------------------------------------------
// 기관 추천
// POST /api/v1/members/me/recommendations
// --------------------------------------------------
export const getRecommendations = (payload) => {
  return apiClient.post("/members/me/recommendations", payload);
};

