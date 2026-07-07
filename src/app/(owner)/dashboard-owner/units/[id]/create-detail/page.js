"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { createDetailUnit } from "@/services/detailUnit";

import {
  FaArrowLeft,
  FaBed,
  FaBath,
  FaKitchenSet,
  FaCouch,
  FaBolt,
  FaDroplet,
  FaDoorOpen,
} from "react-icons/fa6";

const noScroll = (e) => e.target.blur();

// Shared design tokens matching Dashboard & Create Unit layouts
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

const inputCls =
  "w-full rounded-xl border border-[#D8D3C6] bg-white px-4 py-3 text-sm text-[#1F2723] focus:border-[#2F5D50] placeholder-[#8C8578]/60 outline-none transition duration-200 focus-ring-input";

const selectCls =
  "w-full rounded-xl border border-[#D8D3C6] bg-white px-4 py-3 text-sm text-[#1F2723] focus:border-[#2F5D50] outline-none transition duration-200 focus-ring-input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%238C8578%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%2011%201.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat";

export default function CreateDetailUnit() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    total_rooms: "",
    bedroom: "",
    bathroom: "",
    kitchen: "",
    livingroom: "",
    electricity_type: "prabayar",
    water_access: "privated",
    description: "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.total_rooms.toString().trim()) {
      toast.error("Total ruangan wajib diisi");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      total_rooms: form.total_rooms,
      bedroom: form.bedroom || "0",
      bathroom: form.bathroom || "0",
      kitchen: form.kitchen || "0",
      livingroom: form.livingroom || "0",
      electricity_type: form.electricity_type,
      water_access: form.water_access,
      ...(form.description && { description: form.description }),
    };

    try {
      setLoading(true);
      await createDetailUnit(payload, id);
      toast.success("Detail unit berhasil disimpan!");
      router.push("/dashboard-owner");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan detail unit");
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
            Detail Unit
          </h1>
          <p className="text-[#8C8578] text-sm mt-1.5 leading-relaxed">
            Langkah 2: Lengkapi arsitektur ruangan, utilitas, serta fasilitas
            penunjang kontrakan.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-6">
        {/* STEPPER — Gaya minimalis centang hijau tenang */}
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm flex items-center justify-between p-4 mb-6">
          <div className="flex items-center gap-3 pl-2">
            <div className="w-7 h-7 rounded-full bg-[#E1ECE5] text-[#2F5D50] flex items-center justify-center text-xs font-semibold">
              ✓
            </div>
            <span className="text-sm font-medium text-[#6B6459]">
              Info Kontrakan
            </span>
          </div>
          <div className="flex-1 h-px bg-[#2F5D50]/30 mx-4" />
          <div className="flex items-center gap-3 pr-2">
            <div className="w-7 h-7 rounded-full bg-[#2F5D50] text-white flex items-center justify-center text-xs font-mono-num font-semibold">
              2
            </div>
            <span className="text-sm font-semibold text-[#1F2723]">
              Detail Unit
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {/* ── FASILITAS RUANGAN ── */}
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-6 space-y-5">
            <h2 className="font-display font-semibold text-lg text-[#1F2723] flex items-center gap-2.5 pb-3 border-b border-[#F6F4EE]">
              <FaBed className="text-[#B98A3D] text-base" />
              Fasilitas Ruangan
            </h2>

            <Field label="Total Ruangan" required>
              <div className="relative">
                <FaDoorOpen className="absolute left-4 top-4 text-[#8C8578] text-xs" />
                <input
                  name="total_rooms"
                  type="number"
                  min="1"
                  value={form.total_rooms}
                  onChange={handleChange}
                  onWheel={noScroll}
                  placeholder="4"
                  className={`${inputCls} pl-10 font-mono-num`}
                />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Kamar Tidur">
                <div className="relative">
                  <FaBed className="absolute left-4 top-4 text-[#8C8578] text-xs" />
                  <input
                    name="bedroom"
                    type="number"
                    min="0"
                    value={form.bedroom}
                    onChange={handleChange}
                    onWheel={noScroll}
                    placeholder="2"
                    className={`${inputCls} pl-10 font-mono-num`}
                  />
                </div>
              </Field>

              <Field label="Kamar Mandi">
                <div className="relative">
                  <FaBath className="absolute left-4 top-4 text-[#8C8578] text-xs" />
                  <input
                    name="bathroom"
                    type="number"
                    min="0"
                    value={form.bathroom}
                    onChange={handleChange}
                    onWheel={noScroll}
                    placeholder="1"
                    className={`${inputCls} pl-10 font-mono-num`}
                  />
                </div>
              </Field>

              <Field label="Dapur">
                <div className="relative">
                  <FaKitchenSet className="absolute left-4 top-4 text-[#8C8578] text-xs" />
                  <input
                    name="kitchen"
                    type="number"
                    min="0"
                    value={form.kitchen}
                    onChange={handleChange}
                    onWheel={noScroll}
                    placeholder="1"
                    className={`${inputCls} pl-10 font-mono-num`}
                  />
                </div>
              </Field>

              <Field label="Ruang Tamu">
                <div className="relative">
                  <FaCouch className="absolute left-4 top-4 text-[#8C8578] text-xs" />
                  <input
                    name="livingroom"
                    type="number"
                    min="0"
                    value={form.livingroom}
                    onChange={handleChange}
                    onWheel={noScroll}
                    placeholder="1"
                    className={`${inputCls} pl-10 font-mono-num`}
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* ── UTILITAS & DESKRIPSI ── */}
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-6 space-y-5">
            <h2 className="font-display font-semibold text-lg text-[#1F2723] flex items-center gap-2.5 pb-3 border-b border-[#F6F4EE]">
              <FaBolt className="text-[#B98A3D] text-base" />
              Utilitas & Lingkungan
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Jenis Listrik" required>
                <div className="relative">
                  <FaBolt className="absolute left-4 top-4 text-[#8C8578] text-xs z-10" />
                  <select
                    name="electricity_type"
                    value={form.electricity_type}
                    onChange={handleChange}
                    className={`${selectCls} pl-10`}
                  >
                    <option value="prabayar">Prabayar (Token)</option>
                    <option value="pascabayar">Pascabayar</option>
                  </select>
                </div>
              </Field>

              <Field label="Akses Air" required>
                <div className="relative">
                  <FaDroplet className="absolute left-4 top-4 text-[#8C8578] text-xs z-10" />
                  <select
                    name="water_access"
                    value={form.water_access}
                    onChange={handleChange}
                    className={`${selectCls} pl-10`}
                  >
                    <option value="privated">Pribadi</option>
                    <option value="shared">Bersama</option>
                  </select>
                </div>
              </Field>
            </div>

            <Field
              label="Deskripsi Tambahan"
              hint="Opsional — ceritakan kelebihan atau detail aturan lingkungan kontrakan Anda."
            >
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Misal: Kontrakan strategis dekat dengan minimarket, lingkungan tenang, dan dilengkapi ventilasi udara yang baik..."
                className={`${inputCls} resize-none leading-relaxed`}
              />
            </Field>
          </div>

          {/* ── ACTION ACTIONS ── */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard-owner")}
              className="flex-1 border border-[#D8D3C6] text-[#4A4640] hover:bg-white py-3.5 rounded-xl font-medium text-sm transition duration-200 focus-ring"
            >
              Isi Nanti, Lewati Saja
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-[#2F5D50] hover:bg-[#24463C] disabled:bg-[#D8D3C6] disabled:text-[#8C8578] disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-sm transition duration-200 shadow-sm focus-ring"
            >
              {loading ? "Menyimpan data..." : "Simpan & Selesai"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
