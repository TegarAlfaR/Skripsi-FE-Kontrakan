"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { register } from "@/services/auth";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import { FaHouse, FaUser, FaPhone, FaBuilding } from "react-icons/fa6";

import {
  MdOutlineEmail,
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
} from "react-icons/md";

import { RiLockPasswordLine } from "react-icons/ri";

export default function Register() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    role: "tenant",
    name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!form.name.trim()) {
      toast.error("Nama wajib diisi");
      return false;
    }

    if (!form.email.trim()) {
      toast.error("Email wajib diisi");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error("Format email tidak valid");
      return false;
    }

    if (!form.phone_number.trim()) {
      toast.error("Nomor telepon wajib diisi");
      return false;
    }

    if (form.password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Konfirmasi password tidak sama");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const response = await register(
        form.role,
        form.name,
        form.email,
        form.password,
        form.phone_number
      );

      toast.success(response.message);

      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Register gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8">
        {/* Logo */}

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg">
            <FaHouse className="text-white text-3xl" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mt-5 text-gray-800">
          Kontrakan Al-Amin
        </h1>

        <p className="text-center text-gray-500 mt-2">Buat akun baru</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* ROLE */}

          <div>
            <label className="block mb-3 font-semibold">Daftar Sebagai</label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* TENANT */}

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    role: "tenant",
                  })
                }
                className={`rounded-2xl border-2 p-5 transition ${
                  form.role === "tenant"
                    ? "border-emerald-600 bg-emerald-50 shadow-md"
                    : "border-gray-200 hover:border-emerald-400"
                }`}
              >
                <div className="flex justify-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      form.role === "tenant" ? "bg-emerald-600" : "bg-gray-100"
                    }`}
                  >
                    <FaUser
                      className={`text-2xl ${
                        form.role === "tenant" ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>
                </div>

                <h2 className="mt-4 font-semibold text-lg">Tenant</h2>

                <p className="text-sm text-gray-500 mt-2">
                  Saya ingin mencari kontrakan.
                </p>
              </button>

              {/* OWNER */}

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    role: "owner",
                  })
                }
                className={`rounded-2xl border-2 p-5 transition ${
                  form.role === "owner"
                    ? "border-emerald-600 bg-emerald-50 shadow-md"
                    : "border-gray-200 hover:border-emerald-400"
                }`}
              >
                <div className="flex justify-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      form.role === "owner" ? "bg-emerald-600" : "bg-gray-100"
                    }`}
                  >
                    <FaBuilding
                      className={`text-2xl ${
                        form.role === "owner" ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>
                </div>

                <h2 className="mt-4 font-semibold text-lg">Owner</h2>

                <p className="text-sm text-gray-500 mt-2">
                  Saya ingin menyewakan kontrakan.
                </p>
              </button>
            </div>
          </div>

          {/* Nama */}

          <div className="relative">
            <FaUser className="absolute left-4 top-4 text-gray-400" />

            <input
              type="text"
              name="name"
              placeholder="Nama Lengkap"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>

          {/* Email */}

          <div className="relative">
            <MdOutlineEmail className="absolute left-4 top-4 text-gray-400 text-xl" />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>

          {/* Phone */}

          <div className="relative">
            <FaPhone className="absolute left-4 top-4 text-gray-400" />

            <input
              type="text"
              name="phone_number"
              placeholder="Nomor Telepon"
              value={form.phone_number}
              onChange={handleChange}
              className="w-full rounded-xl border py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>

          {/* Password */}

          <div className="relative">
            <RiLockPasswordLine className="absolute left-4 top-4 text-gray-400 text-xl" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border py-3 pl-12 pr-12 focus:ring-2 focus:ring-emerald-200 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4"
            >
              {showPassword ? (
                <MdOutlineVisibilityOff size={22} />
              ) : (
                <MdOutlineVisibility size={22} />
              )}
            </button>
          </div>

          {/* Confirm Password */}

          <div className="relative">
            <RiLockPasswordLine className="absolute left-4 top-4 text-gray-400 text-xl" />

            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Konfirmasi Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-xl border py-3 pl-12 pr-12 focus:ring-2 focus:ring-emerald-200 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-4"
            >
              {showConfirmPassword ? (
                <MdOutlineVisibilityOff size={22} />
              ) : (
                <MdOutlineVisibility size={22} />
              )}
            </button>
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 transition text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-3 disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Mendaftarkan...
              </>
            ) : (
              "Daftar"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-emerald-600 font-semibold hover:underline"
          >
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
