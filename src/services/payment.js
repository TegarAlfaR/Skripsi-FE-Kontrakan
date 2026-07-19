import axiosInstance from "@/lib/axiosInstance";

export const getPayment = async (rentId) => {
  const res = await axiosInstance.get("/payment", {
    params: rentId ? { rent_id: rentId } : {},
  });
  return res.data;
};

export const getPaymentById = async (id) => {
  const res = await axiosInstance.get(`/payment/${id}`);
  return res.data;
};

export const createPayment = async (formData) => {
  const res = await axiosInstance.post("/payment", formData);
  return res.data;
};

export const updatePayment = async (id, formData) => {
  const res = await axiosInstance.patch(`/payment/${id}`, formData);
  return res.data;
};

export const deletePayment = async (id) => {
  const res = await axiosInstance.delete(`/payment/${id}`);
  return res.data;
};
