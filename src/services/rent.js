import axiosInstance from "@/lib/axiosInstance";

export const getAllRentOwner = async () => {
  const response = await axiosInstance.get("/rent/owner");
  return response.data;
};

export const getRentByIdOwner = async (id) => {
  const response = await axiosInstance.get(`/rent/owner/${id}`);
  return response.data;
};

export const createRentOwner = async (formData) => {
  const response = await axiosInstance.post("/rent/owner", formData);
  return response.data;
};

export const updateRentOwner = async (id, formData) => {
  const response = await axiosInstance.patch(`/rent/owner/${id}`, formData);
  return response.data;
};

export const deleteRentOwner = async (id) => {
  const response = await axiosInstance.delete(`/rent/owner/${id}`);
  return response.data;
};

export const endRentOwner = async (id, payload = {}) => {
  const response = await axiosInstance.patch(
    `/rent/owner/end-rent/${id}`,
    payload
  );
  return response.data;
};
