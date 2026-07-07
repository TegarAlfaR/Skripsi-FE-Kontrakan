import axiosInstance from "@/lib/axiosInstance";

export const createDetailUnit = async (formData, id) => {
    const response = await axiosInstance.post(`/detail-unit/${id}`, formData);
    return response.data;
};

export const updateDetailUnit = async (id, formData) => {
    const response = await axiosInstance.patch(`/detail-unit/${id}`, formData);
    return response.data;
};