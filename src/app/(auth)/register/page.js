"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { register } from "@/services/auth";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import {
  FaHouse,
  FaUser,
  FaPhone,
  FaBuilding,
  FaArrowLeft,
} from "react-icons/fa6";

import {
  MdOutlineEmail,
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
} from "react-icons/md";

import { RiLockPasswordLine } from "react-icons/ri";

// Design tokens shared with the rest of the app.
function DesignTokens() {
  return (
    <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap");

      .font-display {
        font-family: "Fraunces", serif;
        font-optical-sizing: auto;
      }
      .font-body {
        font-family: "Inter", sans-serif;
      }
      .focus-ring:focus-visible {
        outline: 2px solid #b98a3d;
        outline-offset: 2px;
      }
      @media (prefers-reduced-motion: reduce) {
        * {
          transition-duration: 0.01ms !important;
          animation-duration: 0.01ms !important;
        }
      }
    `}</style>
  );
}

const INPUT_CLASS =
  "w-full rounded-xl border border-[#D8D3C6] py-3 pl-12 pr-4 text-[#1F2723] placeholder:text-[#8C8578] focus:border-[#2F5D50] focus:ring-2 focus:ring-[#2F5D50]/15 outline-none transition";

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

      toast.success("Akun berhasil dibuat! Silakan masuk.");
      router.push("/login");
    } catch (error) {
      // Menangkap pesan error dari backend jika email sudah terpakai dll
      const errMsg =
        error.response?.data?.message || "Gagal melakukan pendaftaran";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE] flex items-center justify-center px-4 py-10 font-body">
      <DesignTokens />

      <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#E4E0D6] shadow-xl p-8">
        {/* Logo */}

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#1F2723] flex items-center justify-center">
            <FaHouse className="text-[#B98A3D] text-3xl" />
          </div>
        </div>

        <h1 className="font-display text-3xl font-semibold text-center mt-5 text-[#1F2723]">
          Kontrakan Al-Amin
        </h1>

        <p className="text-center text-[#8C8578] mt-2">Buat akun baru</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* ROLE */}

          <div>
            <label className="block mb-3 font-semibold text-sm text-[#1F2723]">
              Daftar Sebagai
            </label>

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
                className={`rounded-2xl border-2 p-5 transition focus-ring ${
                  form.role === "tenant"
                    ? "border-[#2F5D50] bg-[#2F5D50]/5 shadow-sm"
                    : "border-[#E4E0D6] hover:border-[#2F5D50]/40"
                }`}
              >
                <div className="flex justify-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition ${
                      form.role === "tenant" ? "bg-[#2F5D50]" : "bg-[#F6F4EE]"
                    }`}
                  >
                    <FaUser
                      className={`text-2xl ${
                        form.role === "tenant" ? "text-white" : "text-[#8C8578]"
                      }`}
                    />
                  </div>
                </div>

                <h2 className="mt-4 font-display font-semibold text-lg text-[#1F2723]">
                  Tenant
                </h2>

                <p className="text-sm text-[#8C8578] mt-2">
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
                className={`rounded-2xl border-2 p-5 transition focus-ring ${
                  form.role === "owner"
                    ? "border-[#2F5D50] bg-[#2F5D50]/5 shadow-sm"
                    : "border-[#E4E0D6] hover:border-[#2F5D50]/40"
                }`}
              >
                <div className="flex justify-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition ${
                      form.role === "owner" ? "bg-[#2F5D50]" : "bg-[#F6F4EE]"
                    }`}
                  >
                    <FaBuilding
                      className={`text-2xl ${
                        form.role === "owner" ? "text-white" : "text-[#8C8578]"
                      }`}
                    />
                  </div>
                </div>

                <h2 className="mt-4 font-display font-semibold text-lg text-[#1F2723]">
                  Owner
                </h2>

                <p className="text-sm text-[#8C8578] mt-2">
                  Saya ingin menyewakan kontrakan.
                </p>
              </button>
            </div>
          </div>

          {/* Nama */}

          <div className="relative">
            <FaUser className="absolute left-4 top-4 text-[#8C8578]" />

            <input
              type="text"
              name="name"
              placeholder="Nama Lengkap"
              value={form.name}
              onChange={handleChange}
              className={INPUT_CLASS}
            />
          </div>

          {/* Email */}

          <div className="relative">
            <MdOutlineEmail className="absolute left-4 top-4 text-[#8C8578] text-xl" />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className={INPUT_CLASS}
            />
          </div>

          {/* Phone */}

          <div className="relative">
            <FaPhone className="absolute left-4 top-4 text-[#8C8578]" />

            <input
              type="text"
              name="phone_number"
              placeholder="Nomor Telepon"
              value={form.phone_number}
              onChange={handleChange}
              className={INPUT_CLASS}
            />
          </div>

          {/* Password */}

          <div className="relative">
            <RiLockPasswordLine className="absolute left-4 top-4 text-[#8C8578] text-xl" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={`${INPUT_CLASS} pr-12`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-[#8C8578] hover:text-[#1F2723] transition focus-ring rounded"
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
            >
              {showPassword ? (
                <MdOutlineVisibility size={22} />
              ) : (
                <MdOutlineVisibilityOff size={22} />
              )}
            </button>
          </div>

          {/* Confirm Password */}

          <div className="relative">
            <RiLockPasswordLine className="absolute left-4 top-4 text-[#8C8578] text-xl" />

            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Konfirmasi Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`${INPUT_CLASS} pr-12`}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-4 text-[#8C8578] hover:text-[#1F2723] transition focus-ring rounded"
              aria-label={
                showConfirmPassword
                  ? "Sembunyikan password"
                  : "Tampilkan password"
              }
            >
              {showConfirmPassword ? (
                <MdOutlineVisibility size={22} />
              ) : (
                <MdOutlineVisibilityOff size={22} />
              )}
            </button>
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2F5D50] hover:bg-[#24463C] transition text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-3 disabled:bg-[#B8B2A3] focus-ring"
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

        <div className="mt-8 text-center text-[#6B6459] text-sm">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-[#2F5D50] font-semibold hover:underline focus-ring rounded"
          >
            Masuk
          </Link>
        </div>
        <div className="mt-5 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#8C8578] hover:text-[#2F5D50] transition focus-ring rounded"
          >
            <FaArrowLeft size={14} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
