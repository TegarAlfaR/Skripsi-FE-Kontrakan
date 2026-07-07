import Cookies from "js-cookie";

const COOKIE_OPTIONS = {
  expires: 1,        // 1 hari (sama dengan expiry token 1 jam di JWT tapi bisa disesuaikan)
  sameSite: "Lax",
  secure: process.env.NODE_ENV === "production",
};

/**
 * Simpan token + payload setelah login berhasil.
 * Panggil ini di halaman login setelah dapat response API.
 *
 * @param {{ token: string, payload: { id, role, name, email } }} data - dari response.data
 */
export const saveAuthCookie = (data) => {
  Cookies.set("token", data.token, COOKIE_OPTIONS);
  Cookies.set("payload", JSON.stringify(data.payload), COOKIE_OPTIONS);
};

/**
 * Hapus semua cookie auth (untuk logout).
 */
export const clearAuthCookie = () => {
  Cookies.remove("token");
  Cookies.remove("payload");
};

/**
 * Ambil payload dari cookie (tanpa fetch API).
 * @returns {{ id, role, name, email } | null}
 */
export const getAuthPayload = () => {
  try {
    const raw = Cookies.get("payload");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};