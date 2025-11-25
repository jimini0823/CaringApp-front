// app/api/institution/reservation.api.js
import apiClient from "../axios";

// --------------------------------------------------
// 1. 내 기관 예약 목록 조회
//    GET /api/v1/my-institution/reservations
// --------------------------------------------------
export const getMyInstitutionReservations = ({
  status,        // PENDING, CANCELLED, COMPLETED
  startDate,     // yyyy-MM-dd
  endDate,       // yyyy-MM-dd
  page = 0,
  size = 20,
} = {}) => {
  return apiClient.get("/my-institution/reservations", {
    params: {
      status,
      startDate,
      endDate,
      page,
      size,
    },
  });
};

// --------------------------------------------------
// 2. 내 기관 예약 상세 조회
//    GET /api/v1/my-institution/reservations/{reservationId}
// --------------------------------------------------
export const getMyInstitutionReservationDetail = (reservationId) => {
  return apiClient.get(`/my-institution/reservations/${reservationId}`);
};

// --------------------------------------------------
// 3. 내 기관 예약 상태 변경
//    PATCH /api/v1/my-institution/reservations/{reservationId}/status?status=COMPLETED
// --------------------------------------------------
export const updateMyInstitutionReservationStatus = (
  reservationId,
  status // PENDING, CANCELLED, COMPLETED
) => {
  return apiClient.patch(
    `/my-institution/reservations/${reservationId}/status`,
    null,
    {
      params: { status },
    }
  );
};
