import axiosInstance from "@/lib/axiosInstance";

// OWNER
export const getAllOwnerBooking = async () => {
  const response = await axiosInstance.get("/owner/booking");
  return response.data;
};

export const getOwnerBookingById = async (id) => {
  const response = await axiosInstance.get(`/owner/booking/${id}`);
  return response.data;
};

export const updateStatusBooking = async (id, booking_status) => {
  const response = await axiosInstance.patch(`/owner/booking/${id}`, {
    booking_status,
  });
  return response.data;
};

// TENANT
export const getAllTenantBooking = async () => {
  const response = await axiosInstance.get("/booking");
  return response.data;
};

export const getTenantBookingById = async (id) => {
  const response = await axiosInstance.get(`/booking/${id}`);
  return response.data;
};

export const createTenantBooking = async (unitId, formData) => {
  const response = await axiosInstance.post(`/booking/${unitId}`, formData);
  return response.data;
};

export const updateTenantBooking = async (id, formData) => {
  const response = await axiosInstance.patch(`/booking/${id}`, formData);
  return response.data;
};

export const deleteTenantBooking = async (id) => {
  const response = await axiosInstance.delete(`/booking/${id}`);
  return response.data;
};
