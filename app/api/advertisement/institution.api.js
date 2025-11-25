// app/api/advertisement/institution.api.js
import apiClient from "../axios";

// --------------------------------------------------
// 1. 승인된 광고 목록 조회
//    GET /api/v1/institutions/{institutionId}/advertisements
// --------------------------------------------------
export const getInstitutionAdvertisements = (institutionId, {
  status,        // REQUEST_PENDING, REQUEST_APPROVED, REQUEST_REJECTED, ADVERTISEMENT_PENDING, ADVERTISEMENT_ACTIVE, ADVERTISEMENT_ENDED, ADVERTISEMENT_CANCELED
} = {}) => {
  return apiClient.get(`/institutions/${institutionId}/advertisements`, {
    params: {
      status,
    },
  });
};

// --------------------------------------------------
// 2. 광고 상세 조회
//    GET /api/v1/institutions/{institutionId}/advertisements/{adId}
// --------------------------------------------------
export const getInstitutionAdvertisementDetail = (institutionId, adId) => {
  return apiClient.get(`/institutions/${institutionId}/advertisements/${adId}`);
};

// --------------------------------------------------
// 3. 광고 취소 (OWNER 권한 필요, PENDING 상태만 가능)
//    PATCH /api/v1/institutions/{institutionId}/advertisements/{adId}/cancel?cancelReason=
// --------------------------------------------------
export const cancelInstitutionAdvertisement = (institutionId, adId, cancelReason) => {
  return apiClient.patch(`/institutions/${institutionId}/advertisements/${adId}/cancel`, null, {
    params: {
      cancelReason,
    },
  });
};

// --------------------------------------------------
// 4. 광고 신청 목록 조회
//    GET /api/v1/institutions/{institutionId}/advertisements/requests
// --------------------------------------------------
export const getInstitutionAdvertisementRequests = (institutionId, {
  status,        // REQUEST_PENDING, REQUEST_APPROVED, REQUEST_REJECTED, ADVERTISEMENT_PENDING, ADVERTISEMENT_ACTIVE, ADVERTISEMENT_ENDED, ADVERTISEMENT_CANCELED
  type,          // MAIN_BANNER, PREMIUM_LIST, SIDE_BANNER, SEARCH_TOP
} = {}) => {
  return apiClient.get(`/institutions/${institutionId}/advertisements/requests`, {
    params: {
      status,
      type,
    },
  });
};

// --------------------------------------------------
// 5. 광고 신청 (OWNER 권한 필요)
//    POST /api/v1/institutions/{institutionId}/advertisements/requests
// --------------------------------------------------
export const createInstitutionAdvertisementRequest = (institutionId, payload) => {
  // payload = {
  //   type: "MAIN_BANNER" | "PREMIUM_LIST" | "SIDE_BANNER" | "SEARCH_TOP",
  //   startDateTime: string (ISO 8601),
  //   endDateTime: string (ISO 8601),
  //   title: string,
  //   description: string,
  //   bannerImageUrl: string
  // }
  return apiClient.post(`/institutions/${institutionId}/advertisements/requests`, payload);
};

// --------------------------------------------------
// 6. 광고 신청 상세 조회
//    GET /api/v1/institutions/{institutionId}/advertisements/requests/{requestId}
// --------------------------------------------------
export const getInstitutionAdvertisementRequestDetail = (institutionId, requestId) => {
  return apiClient.get(`/institutions/${institutionId}/advertisements/requests/${requestId}`);
};

// --------------------------------------------------
// 7. 광고 신청 취소 (OWNER 권한 필요, 승인 대기 중인 신청만 가능)
//    DELETE /api/v1/institutions/{institutionId}/advertisements/requests/{requestId}
// --------------------------------------------------
export const cancelInstitutionAdvertisementRequest = (institutionId, requestId) => {
  return apiClient.delete(`/institutions/${institutionId}/advertisements/requests/${requestId}`);
};

