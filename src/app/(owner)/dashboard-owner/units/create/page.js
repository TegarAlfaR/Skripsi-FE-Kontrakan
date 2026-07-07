"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { createUnit } from "@/services/unit";

import {
  FaArrowLeft,
  FaHouse,
  FaPhone,
  FaLocationDot,
  FaImage,
  FaXmark,
} from "react-icons/fa6";

const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 rounded-2xl bg-[#EFEBE1] animate-pulse flex items-center justify-center text-[#8C8578] text-sm font-body">
      Memuat peta...
    </div>
  ),
});

// Shared design tokens matching Dashboard layout
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

      @media (prefers-reduced-motion: reduce) {
        * {
          transition-duration: 0.01ms !important;
          animation-duration: 0.01ms !important;
        }
      }
    `}</style>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <div className="font-body">
      <label className="block text-sm font-medium text-[#4A4640] mb-1.5">
        {label}
        {required && <span className="text-[#B5453D] ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-[#8C8578]">{hint}</p>}
    </div>
  );
}

const noScroll = (e) => e.target.blur();

const inputCls =
  "w-full rounded-xl border border-[#D8D3C6] bg-white px-4 py-3 text-sm text-[#1F2723] focus:border-[#2F5D50] placeholder-[#8C8578]/60 outline-none transition duration-200 focus-ring-input";

export default function CreateUnit() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);

  const [form, setForm] = useState({
    unit_name: "",
    rental_price: "",
    phone_number: "",
    total_units: "",
    unit_availability: "",
    latitude: "",
    longitude: "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleMapPick = (lat, lng) =>
    setForm((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    e.target.value = "";
  };

  const removePhoto = (index) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validate = () => {
    const required = [
      ["unit_name", "Nama kontrakan"],
      ["rental_price", "Harga sewa"],
      ["phone_number", "Nomor telepon"],
      ["total_units", "Total unit"],
      ["unit_availability", "Unit tersedia"],
    ];

    for (const [key, label] of required) {
      if (!form[key].toString().trim()) {
        toast.error(`${label} wajib diisi`);
        return false;
      }
    }

    if (!form.latitude || !form.longitude) {
      toast.error("Lokasi wajib dipilih di peta");
      return false;
    }

    if (photos.length === 0) {
      toast.error("Minimal satu foto wajib diupload");
      return false;
    }

    if (Number(form.unit_availability) > Number(form.total_units)) {
      toast.error("Unit tersedia tidak boleh melebihi total unit");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append("unit_name", form.unit_name);
    formData.append("rental_price", form.rental_price);
    formData.append("phone_number", form.phone_number);
    formData.append("total_units", form.total_units);
    formData.append("unit_availability", form.unit_availability);
    formData.append("latitude", form.latitude);
    formData.append("longitude", form.longitude);
    photos.forEach(({ file }) => formData.append("unit_photo", file));

    try {
      setLoading(true);
      const result = await createUnit(formData);
      const newUnitId = result.data.unit_id;

      toast.success("Kontrakan berhasil dibuat! Lengkapi detail unitnya.");
      router.push(`/dashboard-owner/units/${newUnitId}/create-detail`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menambahkan kontrakan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#F6F4EE] min-h-screen pb-12 font-body">
      <DesignTokens />

      {/* HERO SECTION — Menyelaraskan dengan header Dashboard */}
      <div className="bg-[#1F2723]">
        <div className="max-w-3xl mx-auto px-6 pt-6 pb-12">
          <Link
            href="/dashboard-owner"
            className="inline-flex items-center gap-2 text-sm text-[#B8B2A3] hover:text-white font-medium transition mb-8 focus-ring rounded"
          >
            <FaArrowLeft />
            Kembali ke Dashboard
          </Link>

          <h1 className="font-display text-3xl text-white font-semibold">
            Tambah Kontrakan
          </h1>
          <p className="text-[#8C8578] text-sm mt-1.5 leading-relaxed">
            Langkah 1: Isi informasi dasar dan tentukan koordinat lokasi
            kontrakan Anda.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-6">
        {/* STEPPER — Gaya minimalis menggunakan border tipis */}
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm flex items-center justify-between p-4 mb-6">
          <div className="flex items-center gap-3 pl-2">
            <div className="w-7 h-7 rounded-full bg-[#2F5D50] text-white flex items-center justify-center text-xs font-mono-num font-semibold">
              1
            </div>
            <span className="text-sm font-semibold text-[#1F2723]">
              Info Kontrakan
            </span>
          </div>
          <div className="flex-1 h-px bg-[#E4E0D6] mx-4" />
          <div className="flex items-center gap-3 pr-2">
            <div className="w-7 h-7 rounded-full bg-[#EFEBE1] text-[#8C8578] flex items-center justify-center text-xs font-mono-num font-semibold border border-[#D8D3C6]">
              2
            </div>
            <span className="text-sm font-medium text-[#8C8578]">
              Detail Unit
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {/* ── INFO UTAMA ── */}
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-6 space-y-5">
            <h2 className="font-display font-semibold text-lg text-[#1F2723] flex items-center gap-2.5 pb-3 border-b border-[#F6F4EE]">
              <FaHouse className="text-[#B98A3D] text-base" />
              Informasi Utama
            </h2>

            <Field label="Nama Kontrakan" required>
              <input
                name="unit_name"
                value={form.unit_name}
                onChange={handleChange}
                placeholder="Contoh: Rumah Kontrakan Al-Amin"
                className={inputCls}
              />
            </Field>

            <Field label="Harga Sewa per Bulan" required>
              <div className="relative">
                <span className="absolute left-4 top-3 text-sm font-mono-num text-[#8C8578]">
                  Rp
                </span>
                <input
                  name="rental_price"
                  type="number"
                  min="0"
                  value={form.rental_price}
                  onChange={handleChange}
                  onWheel={noScroll}
                  placeholder="700000"
                  className={`${inputCls} pl-12 font-mono-num`}
                />
              </div>
            </Field>

            <Field label="Nomor Telepon / WhatsApp" required>
              <div className="relative">
                <FaPhone className="absolute left-4 top-4 text-[#8C8578] text-xs" />
                <input
                  name="phone_number"
                  type="tel"
                  value={form.phone_number}
                  onChange={handleChange}
                  placeholder="08123456789"
                  className={`${inputCls} pl-10 font-mono-num`}
                />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Total Unit" required>
                <input
                  name="total_units"
                  type="number"
                  min="1"
                  value={form.total_units}
                  onChange={handleChange}
                  onWheel={noScroll}
                  placeholder="10"
                  className={`${inputCls} font-mono-num`}
                />
              </Field>
              <Field label="Unit Tersedia" required>
                <input
                  name="unit_availability"
                  type="number"
                  min="0"
                  value={form.unit_availability}
                  onChange={handleChange}
                  onWheel={noScroll}
                  placeholder="7"
                  className={`${inputCls} font-mono-num`}
                />
              </Field>
            </div>
          </div>

          {/* ── LOKASI ── */}
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-6 space-y-4">
            <h2 className="font-display font-semibold text-lg text-[#1F2723] flex items-center gap-2.5 pb-3 border-b border-[#F6F4EE]">
              <FaLocationDot className="text-[#B98A3D] text-base" />
              Lokasi Kontrakan
              <span className="text-[#B5453D] -ml-1">*</span>
            </h2>

            <p className="text-xs text-[#6B6459] leading-relaxed -mt-1">
              Klik pada peta untuk menyematkan lokasi koordinat. Pin penanda
              akan muncul secara otomatis pada titik yang Anda pilih.
            </p>

            <div className="rounded-xl overflow-hidden border border-[#D8D3C6]">
              <LocationPicker
                lat={form.latitude}
                lng={form.longitude}
                onPick={handleMapPick}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude">
                <input
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="Klik pada peta"
                  className={`${inputCls} bg-[#F6F4EE]/60 font-mono-num`}
                  readOnly
                />
              </Field>
              <Field label="Longitude">
                <input
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="Klik pada peta"
                  className={`${inputCls} bg-[#F6F4EE]/60 font-mono-num`}
                  readOnly
                />
              </Field>
            </div>

            {form.latitude && form.longitude && (
              <div className="inline-flex items-center gap-1.5 bg-[#E1ECE5] text-[#2F5D50] px-3 py-1 rounded-full text-xs font-mono-num font-medium">
                <FaLocationDot className="text-[10px]" />
                Tersemat: {form.latitude}, {form.longitude}
              </div>
            )}
          </div>

          {/* ── FOTO ── */}
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-6 space-y-4">
            <h2 className="font-display font-semibold text-lg text-[#1F2723] flex items-center gap-2.5 pb-3 border-b border-[#F6F4EE]">
              <FaImage className="text-[#B98A3D] text-base" />
              Foto Kontrakan
              <span className="text-[#B5453D] -ml-1">*</span>
            </h2>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {photos.map(({ preview }, i) => (
                  <div
                    key={i}
                    className="relative h-28 rounded-xl overflow-hidden border border-[#D8D3C6] group shadow-sm"
                  >
                    <Image
                      src={preview}
                      alt={`Pratinjau Foto ${i + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1.5 right-1.5 bg-[#B5453D] hover:bg-[#9A3931] text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 shadow focus-ring"
                      aria-label="Hapus Foto"
                    >
                      <FaXmark className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#D8D3C6] hover:border-[#2F5D50]/60 bg-[#F6F4EE]/30 hover:bg-[#F6F4EE]/60 rounded-xl p-8 cursor-pointer transition duration-200 group focus-ring">
              <FaImage className="text-3xl text-[#8C8578]/50 group-hover:text-[#2F5D50] transition duration-200" />
              <p className="mt-2 text-sm font-medium text-[#4A4640] group-hover:text-[#2F5D50] transition duration-200">
                Tekan untuk unggah berkas foto
              </p>
              <p className="text-xs text-[#8C8578] mt-0.5">
                PNG, JPG, atau WEBP
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>

          {/* ── SUBMIT BUTTON ── */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#2F5D50] hover:bg-[#24463C] disabled:bg-[#D8D3C6] disabled:text-[#8C8578] disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition duration-200 text-sm shadow-sm focus-ring"
          >
            {loading ? "Menyimpan data..." : "Lanjut ke Detail Unit →"}
          </button>
        </div>
      </div>
    </main>
  );
}
