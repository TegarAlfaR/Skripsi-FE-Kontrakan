"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getUnitById } from "@/services/unit";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

import {
  FaArrowLeft,
  FaLocationDot,
  FaPhone,
  FaBed,
  FaBath,
  FaKitchenSet,
  FaCouch,
  FaBolt,
  FaDroplet,
  FaDoorOpen,
  FaHouseChimney,
} from "react-icons/fa6";

// Leaflet butuh `window`, harus SSR-disabled
const UnitMap = dynamic(() => import("./UnitMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-none bg-[#EFEBE1] animate-pulse flex items-center justify-center text-[#8C8578] text-sm font-body">
      Memuat peta interaktif...
    </div>
  ),
});

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
      .focus-ring:focus-visible {
        outline: 2px solid #b98a3d;
        outline-offset: 2px;
      }
    `}</style>
  );
}

const formatPrice = (price) => new Intl.NumberFormat("id-ID").format(price);
const toWaNumber = (phone = "") =>
  phone.startsWith("0") ? `62${phone.slice(1)}` : `62${phone}`;

const labelAir = (val) =>
  ({ privated: "Pribadi", private: "Pribadi", shared: "Bersama" }[
    val?.toLowerCase()
  ] ??
  val ??
  "-");
const labelListrik = (val) =>
  ({
    pascabayar: "Pascabayar",
    prabayar: "Prabayar",
    token: "Token / Prabayar",
  }[val?.toLowerCase()] ??
  val ??
  "-");
const buildGoogleMapsUrl = (lat, lng) =>
  `https://www.google.com/maps?q=${lat},${lng}`;

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F6F4EE] last:border-0">
      <div className="flex items-center gap-3 text-[#6B6459] text-sm">
        <span className="text-[#B98A3D] text-xs">{icon}</span>
        {label}
      </div>
      <span className="font-semibold text-[#1F2723] text-sm text-right max-w-[50%] leading-tight">
        {value ?? "-"}
      </span>
    </div>
  );
}

function StatChip({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-white border border-[#E4E0D6] rounded-2xl p-4 text-center shadow-sm">
      <span className="text-[#B98A3D] text-xl">{icon}</span>
      <span className="text-xl font-display font-semibold text-[#1F2723]">
        {value}
      </span>
      <span className="text-[10px] text-[#8C8578] uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}

export default function DetailUnit() {
  const { id } = useParams();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchUnit = async () => {
      try {
        const result = await getUnitById(id);
        setUnit(result.data);
      } catch (err) {
        setError("Gagal memuat data kontrakan.");
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
  }, [id]);

  if (loading) {
    return (
      <main className="bg-[#F6F4EE] min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-6 animate-pulse space-y-6">
          <div className="h-5 w-40 bg-[#EFEBE1] rounded-full" />
          <div className="h-100 bg-[#EFEBE1] rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !unit) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F6F4EE] px-6 font-body">
        <FaHouseChimney className="text-5xl text-[#D8D3C6]" />
        <p className="text-[#8C8578] text-sm">
          {error ?? "Kontrakan tidak ditemukan."}
        </p>
        <Link href="/">
          <button className="flex items-center gap-2 bg-[#2F5D50] text-white px-5 py-2.5 rounded-xl hover:bg-[#24463C] transition text-sm font-medium">
            <FaArrowLeft /> Kembali ke Beranda
          </button>
        </Link>
      </main>
    );
  }

  const d = unit.detail_unit;
  const available = unit.unit_availability > 0;
  const mapsUrl = buildGoogleMapsUrl(unit.latitude, unit.longitude);

  return (
    <main className="bg-[#F6F4EE] min-h-screen py-10 font-body pb-24">
      <DesignTokens />
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#8C8578] hover:text-[#1F2723] font-medium transition focus-ring rounded"
        >
          <FaArrowLeft /> Kembali ke Beranda
        </Link>

        {/* ── GAMBAR BERSIH ── */}
        <div className="relative h-75 sm:h-105 rounded-2xl overflow-hidden border border-[#E4E0D6] shadow-sm">
          <Image
            src={unit.unit_photo[0]}
            alt={unit.unit_name}
            fill
            priority
            className="object-cover"
            unoptimized
          />
          <div className="absolute top-4 left-4">
            <span
              className={`px-4 py-1.5 rounded-full font-mono-num font-semibold text-xs shadow-sm tracking-wide uppercase ${
                available
                  ? "bg-[#B98A3D] text-white"
                  : "bg-[#1F2723] text-[#F5E7CC]"
              }`}
            >
              {available ? "Tersedia" : "Penuh"}
            </span>
          </div>
        </div>

        {/* ── AREA TRANSAKSI (HARGA & BOOKING) ── */}
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-md p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[#1F2723] leading-tight">
              {unit.unit_name}
            </h1>
            <p className="mt-1 text-2xl font-mono-num font-bold text-[#2F5D50]">
              Rp {formatPrice(unit.rental_price)}
              <span className="text-sm font-normal text-[#8C8578] font-body">
                {" "}
                / bulan
              </span>
            </p>
          </div>

          <div className="w-full sm:w-auto flex flex-col gap-3">
            {available ? (
              <Link href={`/booking/${unit.unit_id}`} className="w-full">
                <button className="w-full bg-[#B98A3D] hover:bg-[#A47A34] text-white px-8 py-3.5 rounded-xl font-semibold shadow-sm transition duration-200 focus-ring text-center">
                  Ajukan Sewa Sekarang
                </button>
              </Link>
            ) : (
              <button
                disabled
                className="w-full bg-[#F6F4EE] text-[#8C8578] px-8 py-3.5 rounded-xl font-semibold border border-[#E4E0D6] cursor-not-allowed text-center"
              >
                Unit Sedang Penuh
              </button>
            )}

            <a
              href={`https://wa.me/${toWaNumber(unit.phone_number)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <button className="w-full flex items-center justify-center gap-2 bg-white border border-[#D8D3C6] text-[#4A4640] hover:bg-[#F6F4EE]/50 px-5 py-3 rounded-xl transition text-sm font-medium focus-ring">
                <FaPhone className="text-[#B98A3D]" /> Hubungi Pemilik
              </button>
            </a>
          </div>
        </div>

        {/* ── DESKRIPSI & STATISTIK ── */}
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-6 sm:p-8 space-y-8">
          {d?.description && (
            <div>
              <h2 className="font-display font-semibold text-[#1F2723] mb-3 text-lg">
                Deskripsi Kontrakan
              </h2>
              <p className="text-[#6B6459] text-sm leading-relaxed whitespace-pre-line">
                {d.description}
              </p>
            </div>
          )}

          <div>
            <h2 className="font-display font-semibold text-[#1F2723] mb-4 text-lg">
              Fasilitas Ruangan
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatChip
                icon={<FaBed />}
                label="Kamar Tidur"
                value={d?.bedroom ?? 0}
              />
              <StatChip
                icon={<FaBath />}
                label="Kamar Mandi"
                value={d?.bathroom ?? 0}
              />
              <StatChip
                icon={<FaKitchenSet />}
                label="Dapur"
                value={d?.kitchen ?? 0}
              />
              <StatChip
                icon={<FaCouch />}
                label="Ruang Tamu"
                value={d?.livingroom ?? 0}
              />
            </div>
          </div>
        </div>

        {/* ── INFO TAMBAHAN ── */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-6">
            <h2 className="font-display font-semibold text-[#1F2723] mb-3 pb-2 border-b border-[#F6F4EE]">
              Ketersediaan
            </h2>
            <InfoRow
              icon={<FaDoorOpen />}
              label="Total Kapasitas Unit"
              value={unit.total_units}
            />
            <InfoRow
              icon={<FaDoorOpen />}
              label="Unit Kosong Saat Ini"
              value={
                <span
                  className={available ? "text-[#2F5D50]" : "text-[#B5453D]"}
                >
                  {unit.unit_availability} Unit
                </span>
              }
            />
          </div>

          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-6">
            <h2 className="font-display font-semibold text-[#1F2723] mb-3 pb-2 border-b border-[#F6F4EE]">
              Informasi Utilitas
            </h2>
            <InfoRow
              icon={<FaBolt />}
              label="Sistem Listrik"
              value={labelListrik(d?.electricity_type)}
            />
            <InfoRow
              icon={<FaDroplet />}
              label="Sumber Air"
              value={labelAir(d?.water_access)}
            />
          </div>
        </div>

        {/* ── PETA LEAFLET (DIKEMBALIKAN KE ASLINYA) ── */}
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#F6F4EE] flex items-center gap-3">
            <FaLocationDot className="text-[#B98A3D] text-xl" />
            <h2 className="font-display font-semibold text-[#1F2723] text-lg">
              Lokasi Kontrakan
            </h2>
          </div>

          <UnitMap
            lat={unit.latitude}
            lng={unit.longitude}
            label={unit.unit_name}
          />

          {/* Link buka di Maps */}
          <div className="p-4 text-center bg-[#F6F4EE]/30">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#2F5D50] hover:text-[#1F2723] font-semibold transition"
            >
              Buka rute di Google Maps →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
