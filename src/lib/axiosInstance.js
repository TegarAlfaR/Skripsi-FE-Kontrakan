import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// 1. Request Interceptor (Punya kamu yang sudah ada)
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 2. Tambahkan Response Interceptor di bawah ini
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Jika backend melempar status 401 (Unauthorized / Sesi Habis)
    if (error.response && error.response.status === 401) {
      // Hapus token dan payload dari cookie client
      Cookies.remove("token");
      Cookies.remove("payload");

      // Paksa browser mengarah kembali ke halaman login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
