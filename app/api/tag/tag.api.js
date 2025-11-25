// app/api/tag/tag.api.js
import apiClient from "../axios";

// --------------------------------------------------
// 1. 전체 태그 목록 조회 (공개 API)
//    GET /api/v1/tags
// --------------------------------------------------
export const getAllTags = () => {
  return apiClient.get("/tags");
};

// --------------------------------------------------
// 2. 태그 생성 (시스템 관리자 전용, ADMIN 권한 필요)
//    POST /api/v1/tags
// --------------------------------------------------
export const createTag = (payload) => {
  // payload = {
  //   category: "SPECIALIZATION" | "SERVICE" | "OPERATION" | "ENVIRONMENT" | "REVIEW",
  //   code: string,
  //   name: string,
  //   description: string,
  //   displayOrder: number (optional)
  // }
  return apiClient.post("/tags", payload);
};

// --------------------------------------------------
// 3. 태그 수정 (시스템 관리자 전용, ADMIN 권한 필요)
//    PUT /api/v1/tags/{tagId}
// --------------------------------------------------
export const updateTag = (tagId, payload) => {
  // payload = {
  //   name: string (optional),
  //   description: string (optional),
  //   isActive: boolean (optional),
  //   displayOrder: number (optional)
  // }
  return apiClient.put(`/tags/${tagId}`, payload);
};

// --------------------------------------------------
// 4. 태그 비활성화 (시스템 관리자 전용, ADMIN 권한 필요)
//    DELETE /api/v1/tags/{tagId}
//    - 실제로 삭제되지 않고 isActive가 false로 변경됩니다 (Soft Delete)
// --------------------------------------------------
export const deleteTag = (tagId) => {
  return apiClient.delete(`/tags/${tagId}`);
};

// --------------------------------------------------
// 5. 카테고리별 태그 목록 조회 (공개 API)
//    GET /api/v1/tags/category/{category}
//    카테고리: SPECIALIZATION, SERVICE, OPERATION, ENVIRONMENT, REVIEW
// --------------------------------------------------
export const getTagsByCategory = (category) => {
  return apiClient.get(`/tags/category/${category}`);
};

