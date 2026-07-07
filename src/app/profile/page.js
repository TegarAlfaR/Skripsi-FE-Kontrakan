"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { getUserById, updateUser } from "@/services/user";
import {
  FaArrowLeft,
  FaUser,
  FaPenToSquare,
  FaCamera,
  FaXmark,
  FaCheck,
  FaPhone,
  FaLock,
  FaShieldHalved,
  FaEnvelope,
} from "react-icons/fa6";

function DesignTokens() {
  return (
    <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap");

      .font-display {
        font-family: "Fraunces", serif;
        font-optical-sizing: auto;
      }
      .font-mono-num {
        font-family: "IBM Plex Mono", monospace;
      }
      .font-body {
        font-family: "Inter", sans-serif;
      }
      .focus-ring:focus-visible,
      .focus-ring-input:focus {
        outline: 2px solid #b98a3d;
        outline-offset: 2px;
      }
    `}</style>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // UX Toggle States (Memisahkan form edit data diri & edit password)
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const rawPayload = Cookies.get("payload");
        if (!rawPayload) throw new Error("Sesi tidak ditemukan");

        const payload = JSON.parse(rawPayload);
        const res = await getUserById(payload.id);
        const userData = res.data;

        setUser(userData);
        setName(userData.name || "");
        setPhoneNumber(userData.phone_number || "");
        if (userData.profile_photo) {
          setPhotoPreview(userData.profile_photo);
        }
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat profil pengguna");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handler ganti foto langsung otomatis upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("user_photo", file);

    const loadingToast = toast.loading("Mengunggah foto profil baru...");
    try {
      const res = await updateUser(user.user_id, formData);
      setUser(res.data);
      toast.success("Foto profil berhasil diperbarui!", { id: loadingToast });
    } catch (err) {
      setPhotoPreview(user?.profile_photo || "");
      toast.error("Gagal mengunggah foto profil", { id: loadingToast });
    }
  };

  // Simpan Data Diri
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nama tidak boleh kosong");

    setSubmitLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone_number", phoneNumber);

    try {
      const res = await updateUser(user.user_id, formData);
      toast.success("Informasi profil berhasil disimpan!");
      setUser(res.data);
      setIsEditingInfo(false);

      // Sinkronisasi cookie payload
      const rawPayload = Cookies.get("payload");
      if (rawPayload) {
        const currentPayload = JSON.parse(rawPayload);
        currentPayload.name = res.data.name;
        Cookies.set("payload", JSON.stringify(currentPayload));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memperbarui data");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Simpan Password Baru
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!password.trim()) return toast.error("Password baru belum diisi");
    if (password.length < 6) return toast.error("Password minimal 6 karakter");

    setSubmitLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("password", password);

    try {
      await updateUser(user.user_id, formData);
      toast.success("Password berhasil diganti!");
      setPassword("");
      setIsEditingPassword(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengganti password");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="bg-[#F6F4EE] min-h-screen flex items-center justify-center font-body">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#2F5D50] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#8C8578]">Sinkronisasi profil...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#F6F4EE] min-h-screen pb-16 font-body">
      <DesignTokens />

      {/* ── HEADER UTAMA ── */}
      <div className="bg-[#1F2723]">
        <div className="max-w-xl mx-auto px-6 pt-6 pb-16">
          {/* Diubah langsung ke "/" (Beranda Utama) */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#B8B2A3] hover:text-white font-medium transition mb-8 focus-ring rounded"
          >
            <FaArrowLeft />
            Kembali ke Beranda
          </Link>

          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-full border-2 border-[#B98A3D] shadow-md group overflow-hidden bg-[#1F2723] flex items-center justify-center shrink-0">
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="Profil"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-[#B98A3D] text-2xl font-display font-semibold">
                  {user?.name?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
              <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition duration-200 text-white text-[9px] font-medium">
                <FaCamera className="text-sm mb-1 text-[#F5E7CC]" />
                Ganti
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="min-w-0">
              <span className="text-[10px] font-mono-num font-semibold text-[#B98A3D] bg-[#B98A3D]/10 border border-[#B98A3D]/20 px-2 py-0.5 rounded-full tracking-wider uppercase">
                {user?.role || "Tenant"}
              </span>
              <h1 className="font-display text-2xl text-white font-semibold mt-1.5 truncate leading-tight">
                {user?.name}
              </h1>
              <p className="text-[#8C8578] text-xs font-mono-num truncate mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KONTEN FORM ── */}
      <div className="max-w-xl mx-auto px-6 -mt-8 space-y-6">
        {/* KARTU 1: DATA PRIBADI */}
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-[#F6F4EE]/40 border-b border-[#E4E0D6] flex justify-between items-center">
            <h2 className="font-display font-semibold text-[#1F2723] flex items-center gap-2">
              <FaUser className="text-[#B98A3D] text-sm" />
              Informasi Pribadi
            </h2>
            {!isEditingInfo && (
              <button
                type="button"
                onClick={() => setIsEditingInfo(true)}
                className="text-xs text-[#2F5D50] hover:text-[#1F2723] font-semibold transition flex items-center gap-1.5 focus-ring px-2 py-1 rounded"
              >
                <FaPenToSquare />
                Edit
              </button>
            )}
          </div>

          <div className="p-6">
            {isEditingInfo ? (
              <form onSubmit={handleSaveInfo} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#6B6459] mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-3.5 text-[#8C8578] text-xs" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="w-full rounded-xl border border-[#D8D3C6] bg-white pl-10 px-4 py-2.5 text-sm text-[#1F2723] focus:border-[#2F5D50] outline-none transition focus-ring-input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6B6459] mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-3.5 text-[#8C8578] text-xs" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Contoh: 0812345678"
                      className="w-full rounded-xl border border-[#D8D3C6] bg-white pl-10 px-4 py-2.5 text-sm text-[#1F2723] focus:border-[#2F5D50] outline-none transition focus-ring-input font-mono-num"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingInfo(false);
                      setName(user?.name || "");
                      setPhoneNumber(user?.phone_number || "");
                    }}
                    className="border border-[#D8D3C6] text-[#4A4640] hover:bg-[#F6F4EE]/50 px-4 py-2 rounded-xl text-xs font-medium transition focus-ring"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="bg-[#2F5D50] hover:bg-[#24463C] text-white px-4 py-2 rounded-xl text-xs font-semibold transition focus-ring flex items-center gap-1 shadow-sm"
                  >
                    <FaCheck />
                    Simpan
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 divide-y divide-[#F6F4EE]">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-[#6B6459]">Nama Lengkap</span>
                  <span className="text-sm font-semibold text-[#1F2723]">
                    {user?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-sm text-[#6B6459]">Nomor Telepon</span>
                  <span className="text-sm font-semibold text-[#1F2723] font-mono-num">
                    {user?.phone_number || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-sm text-[#6B6459]">
                    Email Terdaftar
                  </span>
                  <span className="text-sm text-[#8C8578] font-mono-num flex items-center gap-1.5">
                    <FaEnvelope className="text-[10px]" /> {user?.email}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KARTU 2: KEAMANAN (GANTI PASSWORD) */}
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-[#F6F4EE]/40 border-b border-[#E4E0D6] flex justify-between items-center">
            <h2 className="font-display font-semibold text-[#1F2723] flex items-center gap-2">
              <FaShieldHalved className="text-[#B98A3D] text-sm" />
              Keamanan Akun
            </h2>
            {!isEditingPassword && (
              <button
                type="button"
                onClick={() => setIsEditingPassword(true)}
                className="text-xs text-[#2F5D50] hover:text-[#1F2723] font-semibold transition flex items-center gap-1.5 focus-ring px-2 py-1 rounded"
              >
                Ganti Password
              </button>
            )}
          </div>

          <div className="p-6">
            {isEditingPassword ? (
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#6B6459] mb-1">
                    Password Baru
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-3.5 text-[#8C8578] text-xs" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full rounded-xl border border-[#D8D3C6] bg-white pl-10 px-4 py-2.5 text-sm text-[#1F2723] focus:border-[#2F5D50] outline-none transition focus-ring-input"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPassword(false);
                      setPassword("");
                    }}
                    className="border border-[#D8D3C6] text-[#4A4640] hover:bg-[#F6F4EE]/50 px-4 py-2 rounded-xl text-xs font-medium transition focus-ring"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="bg-[#2F5D50] hover:bg-[#24463C] text-white px-4 py-2 rounded-xl text-xs font-semibold transition focus-ring flex items-center gap-1 shadow-sm"
                  >
                    <FaCheck />
                    Update Password
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#2F5D50]"></div>
                  <span className="text-sm text-[#6B6459]">
                    Kredensial Password
                  </span>
                </div>
                <span className="text-xs text-[#8C8578] font-mono-num">
                  ••••••••
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
