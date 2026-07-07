import axiosInstance from "@/lib/axiosInstance";

export const getUserById = async (id) => {
  const response = await axiosInstance.get(`/user/${id}`);
  return response.data;
};

export const updateUser = async (id, formData) => {
  const response = await axiosInstance.patch(`/user/${id}`, formData);
  return response.data;
};

// ADMIN
export const updateUserStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/user/status/${id}`, { status });
  return response.data;
};

export const getAllUsers = async () => {
  const response = await axiosInstance.get("/user");
  return response.data;
};
