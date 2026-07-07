import axiosInstance from "@/lib/axiosInstance";

export const getAllUnits = async () => {
  const response = await axiosInstance.get("/unit");
  return response.data;
};

export const getUnitById = async (id) => {
  const response = await axiosInstance.get(`/unit/${id}`);
  return response.data;
};

// owner
export const getUnitOwner = async () => {
  const response = await axiosInstance.get("/unit/my");
  return response.data;
};

export const getUnitByIdOwner = async (id) => {
  const response = await axiosInstance.get(`/unit/my/${id}`);
  return response.data;
};

export const createUnit = async (formData) => {
  const response = await axiosInstance.post("/unit", formData);
  return response.data;
};

export const updateUnit = async (id, formData) => {
  const response = await axiosInstance.patch(`/unit/${id}`, formData);
  return response.data;
};

export const deleteUnit = async (id) => {
  const response = await axiosInstance.delete(`/unit/${id}`);
  return response.data;
};

