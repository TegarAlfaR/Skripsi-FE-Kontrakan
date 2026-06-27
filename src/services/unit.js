import axiosInstance from "@/lib/axiosInstance";

export const getAllUnits = async () => {
  const response = await axiosInstance.get("/unit");
  return response.data;
};
