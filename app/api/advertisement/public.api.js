import apiClient from "../axios";

export const getActiveAdvertisements = () => {
  return apiClient.get("/public/advertisements");
};

export const getActiveAdvertisementsByType = (type) => {
  return apiClient.get(`/public/advertisements/type/${type}`);
};
