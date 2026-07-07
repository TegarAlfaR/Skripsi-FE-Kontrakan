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
import { FaHouse, FaArrowLeft, FaBan } from "react-icons/fa6";

import LoadingSpinner from "@/components/common/LoadingSpinner";

const COOKIE_OPTIONS = { expires: 1, sameSite: "Lax" };

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

export default function Login() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      const response = await login(form.email, form.password);

      // Simpan token + payload ke cookie (bukan localStorage)
      Cookies.set("token", response.data.token, COOKIE_OPTIONS);
      Cookies.set(
        "payload",
        JSON.stringify(response.data.payload),
        COOKIE_OPTIONS
      );

      toast.success(response.message || "Login berhasil!");
      router.push("/");
      router.refresh(); // Memaksa navbar mendeteksi user yang baru login
    } catch (error) {
      // PERBAIKAN: Menangkap status 403 (Diblokir) dari backend
      if (error.response?.status === 403) {
        toast.error(
          "Akses Ditolak. Akun Anda telah diblokir oleh Administrator.",
          {
            duration: 4000,
            icon: "🚫",
          }
        );
      } else {
        toast.error(
          error.response?.data?.message || "Email atau password salah"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE] flex items-center justify-center px-4 font-body py-10">
      <DesignTokens />

      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E4E0D6] shadow-xl p-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#1F2723] flex items-center justify-center">
            <FaHouse className="text-[#B98A3D] text-3xl" />
          </div>
        </div>

        <h1 className="mt-5 text-center font-display text-3xl font-semibold text-[#1F2723]">
          Kontrakan Al-Amin
        </h1>
        <p className="text-center text-[#8C8578] mt-2">
          Selamat datang kembali 👋
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* EMAIL */}
          <div className="relative">
            <MdOutlineEmail className="absolute left-4 top-4 text-[#8C8578] text-2xl" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Masukkan Email"
              className="w-full rounded-xl border border-[#D8D3C6] py-3 pl-12 pr-4 text-[#1F2723] placeholder:text-[#8C8578] focus:border-[#2F5D50] focus:ring-2 focus:ring-[#2F5D50]/15 outline-none transition"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <RiLockPasswordLine className="absolute left-4 top-4 text-[#8C8578] text-xl" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan Password"
              className="w-full rounded-xl border border-[#D8D3C6] py-3 pl-12 pr-12 text-[#1F2723] placeholder:text-[#8C8578] focus:border-[#2F5D50] focus:ring-2 focus:ring-[#2F5D50]/15 outline-none transition"
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

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2F5D50] hover:bg-[#24463C] transition-all duration-300 text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-3 disabled:bg-[#B8B2A3] disabled:cursor-not-allowed focus-ring shadow-sm"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Memproses...
              </>
            ) : (
              "Masuk ke Akun"
            )}
          </button>
        </form>

        {/* PERINGATAN BLOKIR (Ditambahkan di Sini) */}
        <div className="mt-5 p-4 bg-[#F6DEDA]/30 border border-[#E2B6AF] rounded-xl flex items-start gap-3">
          <FaBan className="text-[#B5453D] text-lg shrink-0 mt-0.5" />
          <p className="text-xs text-[#B5453D] leading-relaxed">
            Tidak bisa masuk meski password benar? Kemungkinan akun Anda
            ditangguhkan. Hubungi admin jika ini adalah kesalahan.
          </p>
        </div>

        <div className="mt-8 text-center text-[#6B6459] text-sm">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-[#2F5D50] font-semibold hover:underline focus-ring rounded"
          >
            Daftar Sekarang
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
