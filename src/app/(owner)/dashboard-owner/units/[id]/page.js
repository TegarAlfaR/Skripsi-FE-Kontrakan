"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { getUnitByIdOwner, updateUnit } from "@/services/unit";
import { createDetailUnit, updateDetailUnit } from "@/services/detailUnit";

import {
  FaArrowLeft,
  FaHouse,
  FaPhone,
  FaBed,
  FaBath,
  FaKitchenSet,
  FaCouch,
  FaBolt,
  FaDroplet,
  FaLocationDot,
  FaImage,
  FaXmark,
  FaDoorOpen,
  FaTriangleExclamation,
} from "react-icons/fa6";

const LocationPicker = dynamic(() => import("../create/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 rounded-2xl bg-[#EFEBE1] animate-pulse flex items-center justify-center text-[#8C8578] text-sm">
      Memuat peta...
    </div>
  ),
});

// Mencegah scroll wheel mengubah nilai input number
const noScroll = (e) => e.target.blur();

// ─── Design tokens shared with the rest of the app ───────────────────────────

function DesignTokens() {
  return (
    <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap");

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-[#D8D3C6] px-4 py-3 text-sm text-[#1F2723] placeholder:text-[#B8B2A3] focus:border-[#2F5D50] focus:ring-2 focus:ring-[#2F5D50]/15 outline-none transition";

const selectCls =
  "w-full rounded-xl border border-[#D8D3C6] px-4 py-3 text-sm text-[#1F2723] focus:border-[#2F5D50] focus:ring-2 focus:ring-[#2F5D50]/15 outline-none transition bg-white";

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#4A4640] mb-1.5">
        {label}
        {required && <span className="text-[#B5453D] ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-[#8C8578]">{hint}</p>}
    </div>
  );
}

function SectionCard({ icon, title, badge, children }) {
  return (
    <div className="bg-white rounded-3xl border border-[#E4E0D6] p-6 space-y-5">
      <h2 className="font-display font-semibold text-[#1F2723] flex items-center gap-2">
        {icon}
        {title}
        {badge}
      </h2>
      {children}
    </div>
  );
}

function EditSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-[#EFEBE1] rounded-xl" />
      <div className="bg-white rounded-3xl border border-[#E4E0D6] p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-[#EFEBE1] rounded-xl" />
        ))}
      </div>
      <div className="bg-white rounded-3xl border border-[#E4E0D6] p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-[#EFEBE1] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function EditUnit() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasDetail, setHasDetail] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);

  const [unitForm, setUnitForm] = useState({
    unit_name: "",
    rental_price: "",
    phone_number: "",
    total_units: "",
    unit_availability: "",
    latitude: "",
    longitude: "",
  });

  const [detailForm, setDetailForm] = useState({
    total_rooms: "",
    bedroom: "",
    bathroom: "",
    kitchen: "",
    livingroom: "",
    electricity_type: "prabayar",
    water_access: "privated",
    description: "",
  });

  useEffect(() => {
    if (!id) return;
    const fetchUnit = async () => {
      try {
        const result = await getUnitByIdOwner(id);
        const u = result.data;

        setUnitForm({
          unit_name: u.unit_name ?? "",
          rental_price: u.rental_price ?? "",
          phone_number: u.phone_number ?? "",
          total_units: u.total_units ?? "",
          unit_availability: u.unit_availability ?? "",
          latitude: u.latitude ?? "",
          longitude: u.longitude ?? "",
        });

        setExistingPhotos(u.unit_photo ?? []);

        if (u.detail_unit) {
          setHasDetail(true);
          setDetailId(u.detail_unit.detail_id);
          setDetailForm({
            total_rooms: u.detail_unit.total_rooms ?? "",
            bedroom: u.detail_unit.bedroom ?? "",
            bathroom: u.detail_unit.bathroom ?? "",
            kitchen: u.detail_unit.kitchen ?? "",
            livingroom: u.detail_unit.livingroom ?? "",
            electricity_type: u.detail_unit.electricity_type ?? "prabayar",
            water_access: u.detail_unit.water_access ?? "privated",
            description: u.detail_unit.description ?? "",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat data unit");
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
  }, [id]);

  const handleUnitChange = (e) =>
    setUnitForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleDetailChange = (e) =>
    setDetailForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleMapPick = (lat, lng) =>
    setUnitForm((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));

  const handleNewPhoto = (e) => {
    const files = Array.from(e.target.files);
    setNewPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    e.target.value = "";
  };

  const removeNewPhoto = (index) => {
    setNewPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateUnit = () => {
    const required = [
      ["unit_name", "Nama kontrakan"],
      ["rental_price", "Harga sewa"],
      ["phone_number", "Nomor telepon"],
      ["total_units", "Total unit"],
      ["unit_availability", "Unit tersedia"],
    ];
    for (const [key, label] of required) {
      if (!unitForm[key].toString().trim()) {
        toast.error(`${label} wajib diisi`);
        return false;
      }
    }
    if (!unitForm.latitude || !unitForm.longitude) {
      toast.error("Lokasi wajib dipilih");
      return false;
    }
    if (Number(unitForm.unit_availability) > Number(unitForm.total_units)) {
      toast.error("Unit tersedia tidak boleh melebihi total unit");
      return false;
    }
    return true;
  };

  const validateDetail = () => {
    if (!detailForm.total_rooms.toString().trim()) {
      toast.error("Total ruangan wajib diisi");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateUnit()) return;
    if (!validateDetail()) return;

    setSaving(true);
    try {
      const unitData = new FormData();
      unitData.append("unit_name", unitForm.unit_name);
      unitData.append("rental_price", unitForm.rental_price);
      unitData.append("phone_number", unitForm.phone_number);
      unitData.append("total_units", unitForm.total_units);
      unitData.append("unit_availability", unitForm.unit_availability);
      unitData.append("latitude", unitForm.latitude);
      unitData.append("longitude", unitForm.longitude);
      newPhotos.forEach(({ file }) => unitData.append("unit_photo", file));

      await updateUnit(id, unitData);

      const detailPayload = {
        total_rooms: detailForm.total_rooms,
        bedroom: detailForm.bedroom || "0",
        bathroom: detailForm.bathroom || "0",
        kitchen: detailForm.kitchen || "0",
        livingroom: detailForm.livingroom || "0",
        electricity_type: detailForm.electricity_type,
        water_access: detailForm.water_access,
        ...(detailForm.description && { description: detailForm.description }),
      };

      if (hasDetail && detailId) {
        await updateDetailUnit(detailId, detailPayload);
      } else {
        await createDetailUnit(detailPayload, id);
        setHasDetail(true);
      }

      toast.success("Kontrakan berhasil diperbarui!");
      router.push("/dashboard-owner");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="bg-[#F6F4EE] min-h-screen p-8 font-body">
        <DesignTokens />
        <div className="h-10 w-44 bg-[#EFEBE1] rounded-xl animate-pulse mb-6" />
        <EditSkeleton />
      </main>
    );
  }

  return (
    <main className="bg-[#F6F4EE] min-h-screen p-8 font-body">
      <DesignTokens />

      <Link
        href="/dashboard-owner"
        className="inline-flex items-center gap-2 bg-white hover:bg-[#F6F4EE] border border-[#E4E0D6] text-[#4A4640] hover:text-[#2F5D50] px-4 py-2.5 rounded-xl shadow-sm font-medium transition mb-6 focus-ring"
      >
        <FaArrowLeft className="text-[#2F5D50]" />
        Kembali ke Dashboard
      </Link>

      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-semibold text-[#1F2723]">
          Edit Kontrakan
        </h1>
        <p className="text-[#8C8578] mt-1">
          Perbarui informasi kontrakan dan detail unitnya.
        </p>

        {!hasDetail && (
          <div className="mt-6 flex items-start gap-3 bg-[#F0E4CC] border border-[#E3CB94] rounded-2xl p-4">
            <FaTriangleExclamation className="text-[#B98A3D] text-lg shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#8A6416]">
                Detail unit belum diisi
              </p>
              <p className="text-xs text-[#8A6416]/80 mt-0.5">
                Kamu sebelumnya melewati langkah ini. Lengkapi sekarang agar
                informasi kontrakan lebih lengkap.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {/* ── INFO UTAMA ── */}
          <SectionCard
            icon={<FaHouse className="text-[#2F5D50]" />}
            title="Informasi Utama"
          >
            <Field label="Nama Kontrakan" required>
              <input
                name="unit_name"
                value={unitForm.unit_name}
                onChange={handleUnitChange}
                className={inputCls}
              />
            </Field>

            <Field label="Harga Sewa per Bulan" required>
              <div className="relative">
                <span className="absolute left-4 top-3 text-sm text-[#8C8578] font-mono-num">
                  Rp
                </span>
                <input
                  name="rental_price"
                  type="number"
                  min="0"
                  value={unitForm.rental_price}
                  onChange={handleUnitChange}
                  onWheel={noScroll}
                  className={`${inputCls} pl-10 font-mono-num`}
                />
              </div>
            </Field>

            <Field label="Nomor Telepon / WhatsApp" required>
              <div className="relative">
                <FaPhone className="absolute left-4 top-3.5 text-[#8C8578] text-sm" />
                <input
                  name="phone_number"
                  type="tel"
                  value={unitForm.phone_number}
                  onChange={handleUnitChange}
                  className={`${inputCls} pl-10`}
                />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Total Unit" required>
                <input
                  name="total_units"
                  type="number"
                  min="1"
                  value={unitForm.total_units}
                  onChange={handleUnitChange}
                  onWheel={noScroll}
                  className={`${inputCls} font-mono-num`}
                />
              </Field>
              <Field label="Unit Tersedia" required>
                <input
                  name="unit_availability"
                  type="number"
                  min="0"
                  value={unitForm.unit_availability}
                  onChange={handleUnitChange}
                  onWheel={noScroll}
                  className={`${inputCls} font-mono-num`}
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── LOKASI ── */}
          <SectionCard
            icon={<FaLocationDot className="text-[#2F5D50]" />}
            title="Lokasi"
          >
            <p className="text-xs text-[#8C8578] -mt-1">
              Klik peta untuk memindahkan pin lokasi.
            </p>

            <LocationPicker
              lat={unitForm.latitude}
              lng={unitForm.longitude}
              onPick={handleMapPick}
            />

            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude">
                <input
                  name="latitude"
                  value={unitForm.latitude}
                  onChange={handleUnitChange}
                  className={`${inputCls} bg-[#F6F4EE] font-mono-num`}
                />
              </Field>
              <Field label="Longitude">
                <input
                  name="longitude"
                  value={unitForm.longitude}
                  onChange={handleUnitChange}
                  className={`${inputCls} bg-[#F6F4EE] font-mono-num`}
                />
              </Field>
            </div>

            {unitForm.latitude && unitForm.longitude && (
              <p className="text-xs text-[#2F5D50] flex items-center gap-1.5 font-mono-num">
                <FaLocationDot />
                {unitForm.latitude}, {unitForm.longitude}
              </p>
            )}
          </SectionCard>

          {/* ── DETAIL UNIT ── */}
          <SectionCard
            icon={<FaBed className="text-[#2F5D50]" />}
            title="Detail Unit"
            badge={
              !hasDetail && (
                <span className="ml-auto text-xs bg-[#F0E4CC] text-[#8A6416] px-2 py-0.5 rounded-full font-medium">
                  Belum diisi
                </span>
              )
            }
          >
            <Field label="Total Ruangan" required>
              <div className="relative">
                <FaDoorOpen className="absolute left-4 top-3.5 text-[#8C8578] text-sm" />
                <input
                  name="total_rooms"
                  type="number"
                  min="1"
                  value={detailForm.total_rooms}
                  onChange={handleDetailChange}
                  onWheel={noScroll}
                  placeholder="4"
                  className={`${inputCls} pl-10`}
                />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Kamar Tidur">
                <div className="relative">
                  <FaBed className="absolute left-4 top-3.5 text-[#8C8578] text-sm" />
                  <input
                    name="bedroom"
                    type="number"
                    min="0"
                    value={detailForm.bedroom}
                    onChange={handleDetailChange}
                    onWheel={noScroll}
                    placeholder="2"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </Field>
              <Field label="Kamar Mandi">
                <div className="relative">
                  <FaBath className="absolute left-4 top-3.5 text-[#8C8578] text-sm" />
                  <input
                    name="bathroom"
                    type="number"
                    min="0"
                    value={detailForm.bathroom}
                    onChange={handleDetailChange}
                    onWheel={noScroll}
                    placeholder="1"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </Field>
              <Field label="Dapur">
                <div className="relative">
                  <FaKitchenSet className="absolute left-4 top-3.5 text-[#8C8578] text-sm" />
                  <input
                    name="kitchen"
                    type="number"
                    min="0"
                    value={detailForm.kitchen}
                    onChange={handleDetailChange}
                    onWheel={noScroll}
                    placeholder="1"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </Field>
              <Field label="Ruang Tamu">
                <div className="relative">
                  <FaCouch className="absolute left-4 top-3.5 text-[#8C8578] text-sm" />
                  <input
                    name="livingroom"
                    type="number"
                    min="0"
                    value={detailForm.livingroom}
                    onChange={handleDetailChange}
                    onWheel={noScroll}
                    placeholder="1"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Jenis Listrik" required>
                <div className="relative">
                  <FaBolt className="absolute left-4 top-3.5 text-[#8C8578] text-sm" />
                  <select
                    name="electricity_type"
                    value={detailForm.electricity_type}
                    onChange={handleDetailChange}
                    className={`${selectCls} pl-10`}
                  >
                    <option value="prabayar">Prabayar (Token)</option>
                    <option value="pascabayar">Pascabayar</option>
                  </select>
                </div>
              </Field>
              <Field label="Akses Air" required>
                <div className="relative">
                  <FaDroplet className="absolute left-4 top-3.5 text-[#8C8578] text-sm" />
                  <select
                    name="water_access"
                    value={detailForm.water_access}
                    onChange={handleDetailChange}
                    className={`${selectCls} pl-10`}
                  >
                    <option value="privated">Pribadi</option>
                    <option value="shared">Bersama</option>
                  </select>
                </div>
              </Field>
            </div>

            <Field label="Deskripsi" hint="Opsional">
              <textarea
                name="description"
                value={detailForm.description}
                onChange={handleDetailChange}
                rows={3}
                placeholder="Kontrakan nyaman, dekat jalan utama..."
                className={`${inputCls} resize-none`}
              />
            </Field>
          </SectionCard>

          {/* ── FOTO ── */}
          <SectionCard
            icon={<FaImage className="text-[#2F5D50]" />}
            title="Foto Kontrakan"
          >
            {existingPhotos.length > 0 && (
              <div>
                <p className="text-xs text-[#8C8578] mb-2">Foto saat ini</p>
                <div className="grid grid-cols-3 gap-3">
                  {existingPhotos.map((url, i) => (
                    <div
                      key={i}
                      className="relative h-28 rounded-2xl overflow-hidden border border-[#E4E0D6]"
                    >
                      <Image
                        src={url}
                        alt={`Foto ${i + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newPhotos.length > 0 && (
              <div>
                <p className="text-xs text-[#8C8578] mb-2">
                  Foto baru (akan menggantikan foto lama)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {newPhotos.map(({ preview }, i) => (
                    <div
                      key={i}
                      className="relative h-28 rounded-2xl overflow-hidden group border border-[#E4E0D6]"
                    >
                      <Image
                        src={preview}
                        alt={`Baru ${i + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => removeNewPhoto(i)}
                        className="absolute top-1.5 right-1.5 bg-[#B5453D] hover:bg-[#9A3931] text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition focus-ring"
                        aria-label="Hapus foto ini"
                      >
                        <FaXmark className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#D8D3C6] hover:border-[#2F5D50]/50 rounded-2xl p-6 cursor-pointer transition group">
              <FaImage className="text-3xl text-[#D8D3C6] group-hover:text-[#2F5D50] transition" />
              <p className="mt-2 text-sm text-[#8C8578] group-hover:text-[#2F5D50] transition">
                {existingPhotos.length > 0
                  ? "Upload foto baru untuk mengganti"
                  : "Klik untuk upload foto"}
              </p>
              <p className="text-xs text-[#B8B2A3] mt-1">PNG, JPG, WEBP</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleNewPhoto}
                className="hidden"
              />
            </label>
          </SectionCard>

          {/* ── SUBMIT ── */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#2F5D50] hover:bg-[#24463C] disabled:bg-[#B8B2A3] disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg transition focus-ring"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </main>
  );
}
