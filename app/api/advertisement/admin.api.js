// app/api/advertisement/admin.api.js
import apiClient from "../axios";

// --------------------------------------------------
// 1. 전체 광고 목록 조회 (관리자)
//    GET /api/v1/admin/advertisements
// --------------------------------------------------
export const getAdminAdvertisements = ({
  status,        // REQUEST_PENDING, REQUEST_APPROVED, REQUEST_REJECTED, ADVERTISEMENT_PENDING, ADVERTISEMENT_ACTIVE, ADVERTISEMENT_ENDED, ADVERTISEMENT_CANCELED
  type,          // MAIN_BANNER, PREMIUM_LIST, SIDE_BANNER, SEARCH_TOP
  page = 0,
  size = 20,
  sort = ["createdAt,DESC"],
} = {}) => {
  return apiClient.get("/admin/advertisements", {
    params: {
      status,
      type,
      page,
      size,
      sort,
    },
  });
};

// --------------------------------------------------
// 2. 광고 상세 조회 (관리자)
//    GET /api/v1/admin/advertisements/{adId}
// --------------------------------------------------
export const getAdminAdvertisementDetail = (adId) => {
  return apiClient.get(`/admin/advertisements/${adId}`);
};

// --------------------------------------------------
// 3. 광고 강제 종료 (관리자)
//    PATCH /api/v1/admin/advertisements/{advertisementId}/force-end?reason=
// --------------------------------------------------
export const forceEndAdvertisement = (advertisementId, reason) => {
  return apiClient.patch(`/admin/advertisements/${advertisementId}/force-end`, null, {
    params: {
      reason,
    },
  });
};

// --------------------------------------------------
// 4. 전체 광고 신청 목록 조회 (관리자)
//    GET /api/v1/admin/advertisements/requests
// --------------------------------------------------
export const getAdminAdvertisementRequests = ({
  status,        // REQUEST_PENDING, REQUEST_APPROVED, REQUEST_REJECTED, ADVERTISEMENT_PENDING, ADVERTISEMENT_ACTIVE, ADVERTISEMENT_ENDED, ADVERTISEMENT_CANCELED
  type,          // MAIN_BANNER, PREMIUM_LIST, SIDE_BANNER, SEARCH_TOP
  page = 0,
  size = 20,
  sort = ["createdAt,DESC"],
} = {}) => {
  return apiClient.get("/admin/advertisements/requests", {
    params: {
      status,
      type,
      page,
      size,
      sort,
    },
  });
};

// --------------------------------------------------
// 5. 광고 신청 상세 조회 (관리자)
//    GET /api/v1/admin/advertisements/requests/{requestId}
// --------------------------------------------------
export const getAdminAdvertisementRequestDetail = (requestId) => {
  return apiClient.get(`/admin/advertisements/requests/${requestId}`);
};

// --------------------------------------------------
// 6. 광고 신청 승인 (관리자)
//    PATCH /api/v1/admin/advertisements/requests/{requestId}/approve?memo=
// --------------------------------------------------
export const approveAdvertisementRequest = (requestId, memo) => {
  return apiClient.patch(`/admin/advertisements/requests/${requestId}/approve`, null, {
    params: {
      memo,
    },
  });
};

// --------------------------------------------------
// 7. 광고 신청 거절 (관리자)
//    PATCH /api/v1/admin/advertisements/requests/{requestId}/reject?rejectionReason=
// --------------------------------------------------
export const rejectAdvertisementRequest = (requestId, rejectionReason) => {
  return apiClient.patch(`/admin/advertisements/requests/${requestId}/reject`, null, {
    params: {
      rejectionReason,
    },
  });
};

// --------------------------------------------------
// 8. 승인 대기 신청 목록 (관리자)
//    GET /api/v1/admin/advertisements/requests/pending
// --------------------------------------------------
export const getPendingAdvertisementRequests = ({
  page = 0,
  size = 20,
  sort = ["createdAt,ASC"],
} = {}) => {
  return apiClient.get("/admin/advertisements/requests/pending", {
    params: {
      page,
      size,
      sort,
    },
  });
};

