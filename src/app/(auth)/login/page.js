"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

import { login } from "@/services/auth";

import {
  MdOutlineEmail,
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
} from "react-icons/md";

import { RiLockPasswordLine } from "react-icons/ri";
import { FaHouse } from "react-icons/fa6";

import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function Login() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!form.email.trim()) {
      toast.error("Email wajib diisi");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error("Format email tidak valid");
      return false;
    }

    if (!form.password) {
      toast.error("Password wajib diisi");
      return false;
    }

    if (form.password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const response = await login(
        form.email,
        form.password
      );

      Cookies.set("token", response.data.token, {
        expires: 1,
      });

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.payload)
      );

      toast.success(response.message);

      router.push("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Login gagal"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        {/* Logo */}

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg">
            <FaHouse className="text-white text-3xl" />
          </div>
        </div>

        <h1 className="mt-5 text-center text-3xl font-bold text-gray-800">
          Kontrakan Al-Amin
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Selamat datang kembali 👋
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          {/* EMAIL */}

          <div className="relative">

            <MdOutlineEmail className="absolute left-4 top-4 text-gray-400 text-2xl" />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Masukkan Email"
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            />

          </div>

          {/* PASSWORD */}

          <div className="relative">

            <RiLockPasswordLine className="absolute left-4 top-4 text-gray-400 text-xl" />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan Password"
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-12 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-4 top-4 text-gray-500"
            >
              {showPassword ? (
                <MdOutlineVisibilityOff
                  size={22}
                />
              ) : (
                <MdOutlineVisibility
                  size={22}
                />
              )}
            </button>

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </button>

        </form>

        <div className="mt-8 text-center text-gray-500">

          Belum punya akun?{" "}

          <Link
            href="/register"
            className="text-emerald-600 font-semibold hover:underline"
          >
            Daftar
          </Link>

        </div>

      </div>

    </div>
  );
}