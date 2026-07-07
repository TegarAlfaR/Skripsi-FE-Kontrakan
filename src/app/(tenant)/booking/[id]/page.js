"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { createTenantBooking } from "@/services/booking";
import {
  FaArrowLeft,
  FaUser,
  FaLocationDot,
  FaCakeCandles,
  FaVenusMars,
  FaHouse,
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

const inputCls =
  "w-full rounded-xl border border-[#D8D3C6] bg-white pl-10 px-4 py-3 text-sm text-[#1F2723] focus:border-[#2F5D50] outline-none transition duration-200 focus-ring-input placeholder-[#8C8578]/60";
const selectCls =
  "w-full rounded-xl border border-[#D8D3C6] bg-white pl-10 px-4 py-3 text-sm text-[#1F2723] focus:border-[#2F5D50] outline-none transition duration-200 focus-ring-input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%238C8578%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%2011%201.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat";

export default function BookUnitPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    tenant_name: "",
    hometown: "",
    birth_place_date: "",
    gender: "Laki-laki",
    move_in_date: "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.tenant_name ||
      !form.hometown ||
      !form.birth_place_date ||
      !form.move_in_date
    ) {
      return toast.error("Harap lengkapi semua data formulir");
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        booking_date: new Date().toISOString().split("T")[0],
      };

      await createTenantBooking(id, payload);
      toast.success("Pengajuan sewa berhasil dikirim!");
      router.push("/booking-history");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Gagal mengirim pengajuan sewa"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#F6F4EE] min-h-screen pb-12 font-body">
      <DesignTokens />

      <div className="bg-[#1F2723]">
        <div className="max-w-2xl mx-auto px-6 pt-6 pb-16">
          <Link
            href={`/units/${id}`}
            className="inline-flex items-center gap-2 text-sm text-[#B8B2A3] hover:text-white font-medium transition mb-8 focus-ring rounded"
          >
            <FaArrowLeft /> Batal & Kembali
          </Link>
          <h1 className="font-display text-3xl text-white font-semibold">
            Formulir Pengajuan Sewa
          </h1>
          <p className="text-[#8C8578] text-sm mt-1.5 leading-relaxed">
            Harap isi data diri dengan benar. Data ini akan ditinjau oleh
            pemilik kontrakan sebelum disetujui.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Data Pribadi */}
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-6 sm:p-8 space-y-5">
            <h2 className="font-display font-semibold text-lg text-[#1F2723] flex items-center gap-2 pb-3 border-b border-[#F6F4EE]">
              <FaUser className="text-[#B98A3D] text-base" />
              Data Diri Penyewa
            </h2>

            <div>
              <label className="block text-sm font-medium text-[#4A4640] mb-1.5">
                Nama Lengkap Sesuai KTP
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-4 text-[#8C8578] text-xs" />
                <input
                  type="text"
                  name="tenant_name"
                  value={form.tenant_name}
                  onChange={handleChange}
                  placeholder="Contoh: Budi Santoso"
                  className={inputCls}
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#4A4640] mb-1.5">
                  Asal Kota / Daerah
                </label>
                <div className="relative">
                  <FaLocationDot className="absolute left-4 top-4 text-[#8C8578] text-xs" />
                  <input
                    type="text"
                    name="hometown"
                    value={form.hometown}
                    onChange={handleChange}
                    placeholder="Contoh: Jakarta"
                    className={inputCls}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A4640] mb-1.5">
                  Jenis Kelamin
                </label>
                <div className="relative">
                  <FaVenusMars className="absolute left-4 top-4 text-[#8C8578] text-xs z-10" />
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A4640] mb-1.5">
                Tempat & Tanggal Lahir
              </label>
              <div className="relative">
                <FaCakeCandles className="absolute left-4 top-4 text-[#8C8578] text-xs" />
                <input
                  type="text"
                  name="birth_place_date"
                  value={form.birth_place_date}
                  onChange={handleChange}
                  placeholder="Contoh: Bandung, 12 Agustus 1998"
                  className={inputCls}
                  required
                />
              </div>
              <p className="mt-1.5 text-xs text-[#8C8578]">
                Tulis kota lahir beserta tanggalnya secara lengkap.
              </p>
            </div>
          </div>

          {/* Section 2: Jadwal Masuk */}
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-6 sm:p-8 space-y-5">
            <h2 className="font-display font-semibold text-lg text-[#1F2723] flex items-center gap-2 pb-3 border-b border-[#F6F4EE]">
              <FaHouse className="text-[#B98A3D] text-base" />
              Rencana Menempati Unit
            </h2>

            <div>
              <label className="block text-sm font-medium text-[#4A4640] mb-1.5">
                Kapan Anda akan mulai masuk?
              </label>
              <div className="relative">
                <FaHouse className="absolute left-4 top-4 text-[#8C8578] text-xs" />
                <input
                  type="date"
                  name="move_in_date"
                  value={form.move_in_date}
                  onChange={handleChange}
                  className={`${inputCls} font-mono-num`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2F5D50] hover:bg-[#24463C] disabled:bg-[#D8D3C6] disabled:text-[#8C8578] text-white py-4 rounded-xl font-semibold shadow-md transition duration-200 focus-ring"
          >
            {loading ? "Memproses Data..." : "Kirim Pengajuan Sekarang"}
          </button>
        </form>
      </div>
    </main>
  );
}
