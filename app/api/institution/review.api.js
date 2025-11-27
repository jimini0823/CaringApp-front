// app/api/institution/review.api.js
import apiClient from "../axios";

// --------------------------------------------------
// 1. 특정 기관의 리뷰 목록 조회 (공개)
//    GET /api/v1/public/institutions/{institutionId}/reviews
// --------------------------------------------------
export const getInstitutionReviews = (
  institutionId,
  page = 0,
  size = 10,
  sort = "createdAt,desc"
) => {
  return apiClient.get(`/public/institutions/${institutionId}/reviews`, {
    params: {
      page,
      size,
      sort,
    },
  });
};
