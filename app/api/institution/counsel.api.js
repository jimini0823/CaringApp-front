// app/api/institution/counsel.api.js
import apiClient from "../axios";

// --------------------------------------------------
// 1. 기관 상담 서비스 목록 조회 (공개 API)
//    GET /institutions/{institutionId}/counsels
// --------------------------------------------------
export const getCounselList = (institutionId) => {
  return apiClient.get(`/institutions/${institutionId}/counsels`);
};

// --------------------------------------------------
// 2. 기관 상담 서비스 등록 (OWNER/MANAGER 권한 필요)
//    POST /institutions/{institutionId}/counsels
// --------------------------------------------------
export const createCounsel = (institutionId, payload) => {
  // payload = { title, description }
  return apiClient.post(`/institutions/${institutionId}/counsels`, payload);
};

// --------------------------------------------------
// 3. 상담 예약 가능 시간 조회
//    GET /institutions/{institutionId}/counsels/{counselId}?date=
// --------------------------------------------------
export const getCounselAvailableTimes = (institutionId, counselId, date) => {
  return apiClient.get(
    `/institutions/${institutionId}/counsels/${counselId}`,
    {
      params: { date }, // yyyy-MM-dd
    }
  );
};

// --------------------------------------------------
// 4. 상담 서비스 삭제
//    DELETE /institutions/{institutionId}/counsels/{counselId}
// --------------------------------------------------
export const deleteCounsel = (institutionId, counselId) => {
  return apiClient.delete(
    `/institutions/${institutionId}/counsels/${counselId}`
  );
};

// --------------------------------------------------
// 5. 상담 서비스 정보 수정
//    PATCH /institutions/{institutionId}/counsels/{counselId}
// --------------------------------------------------
export const updateCounsel = (institutionId, counselId, payload) => {
  // payload = { title, description }
  return apiClient.patch(
    `/institutions/${institutionId}/counsels/${counselId}`,
    payload
  );
};

// --------------------------------------------------
// 6. 상담 서비스 제공 여부 토글
//    PATCH /institutions/{institutionId}/counsels/{counselId}/status
// --------------------------------------------------
export const toggleCounselStatus = (institutionId, counselId) => {
  return apiClient.patch(
    `/institutions/${institutionId}/counsels/${counselId}/status`
  );
};
