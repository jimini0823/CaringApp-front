// app/api/institution/profile.api.js
import apiClient from "../axios";

// --------------------------------------------------
// 1. 기관 목록 조회 (GET /api/v1/public/institutions)
// --------------------------------------------------
export const getInstitutionList = ({
  page = 0,
  size = 20,
  sort = "name,asc",
  name,
  institutionType,
  isAdmissionAvailable,
  city,
  maxMonthlyFee,
  latitude,
  longitude,
  radiusKm,
} = {}) => {
  return apiClient.get("/public/institutions", {
    params: {
      page,
      size,
      sort,
      name,
      institutionType,
      isAdmissionAvailable,
      city,
      maxMonthlyFee,
      latitude,
      longitude,
      radiusKm,
    },
  });
};

// --------------------------------------------------
// 2. 기관 등록 요청 (POST /api/v1/institutions/profile)
// --------------------------------------------------
export const createInstitution = (file, data) => {
  const formData = new FormData();

  if (file) {
    formData.append("file", {
      uri: file.uri,
      name: file.name || "upload.jpg",
      type: file.type || "image/jpeg",
    });
  }

  formData.append("data", JSON.stringify(data));

  return apiClient.post("/institutions/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// --------------------------------------------------
// 3. 기관 상세 조회 (GET /api/v1/public/institutions/{institutionId})
// --------------------------------------------------
export const getInstitutionDetail = (institutionId) => {
  return apiClient.get(`/public/institutions/${institutionId}`);
};

// --------------------------------------------------
// 4. 기관 정보 수정 (PUT /api/v1/institutions/profile/{institutionId})
// --------------------------------------------------
export const updateInstitution = (institutionId, payload) => {
  return apiClient.put(`/institutions/profile/${institutionId}`, payload);
};

// --------------------------------------------------
// 5. 기관 삭제 (DELETE /api/v1/institutions/profile/{institutionId})
//     - 논리 삭제
//     - 입소 가능 여부 자동 false
// --------------------------------------------------
export const deleteInstitution = (institutionId) => {
  return apiClient.delete(`/institutions/profile/${institutionId}`);
};

export const updateAdmissionStatus = (institutionId, isAdmissionAvailable) => {
  return apiClient.patch(`/institutions/profile/${institutionId}/admission-availability`, null, {
    params: {
      isAdmissionAvailable,
    },
  });
};

export const approveInstitution = (institutionId) => {
  return apiClient.patch(`/institutions/profile/${institutionId}/approval`);
};

export const setInstitutionTags = (institutionId, tagIds) => {
  return apiClient.put(`/institutions/profile/${institutionId}/tags`, {
    tagIds,
  });
};
