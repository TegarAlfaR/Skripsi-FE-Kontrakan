import axiosInstance from "@/lib/axiosInstance";

export const login = async (email, password) => {
  const response = await axiosInstance.post("/auth/login", { email, password });
  return response.data;
};

export const register = async (role, name, email, password, phone_number) => {
  const response = await axiosInstance.post("/auth/register", {
    role,
    email,
    password,
    name,
    phone_number,
  });
  return response.data;
};
