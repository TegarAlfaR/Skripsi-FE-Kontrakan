"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import { getAllUnits } from "@/services/unit";

import {
  FaHouse,
  FaLocationDot,
  FaPhone,
  FaBed,
  FaBath,
  FaKitchenSet,
  FaCouch,
  FaBoxOpen,
  FaEnvelope,
} from "react-icons/fa6";

import Image from "next/image";

// Leaflet pakai `window`, harus di-disable SSR
const UnitMap = dynamic(() => import("./UnitMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 rounded-3xl bg-[#EFEBE1] animate-pulse flex items-center justify-center text-[#8C8578]">
      Memuat peta...
    </div>
  ),
});

// Koordinat sekretariat Kontrakan Al-Amin
const OFFICE_LAT = -6.419139;
const OFFICE_LNG = 107.002778;

// ─── Helper ───────────────────────────────────────────────────────────────────

const formatPrice = (price) => new Intl.NumberFormat("id-ID").format(price);

const toWaNumber = (phone = "") =>
  phone.startsWith("0") ? `62${phone.slice(1)}` : `62${phone}`;

// Buat link Google Maps dari koordinat (bukan location string lagi)
const buildGoogleMapsUrl = (lat, lng) =>
  `https://www.google.com/maps?q=${lat},${lng}`;

// Map nilai API → label Indonesia
const WATER_LABEL = {
  privated: "Pribadi",
  private: "Pribadi",
  shared: "Bersama",
};
const ELEC_LABEL = {
  pascabayar: "Pascabayar",
  prabayar: "Prabayar",
  token: "Token",
};
const labelAir = (v) => WATER_LABEL[v?.toLowerCase()] ?? v ?? "-";
const labelListrik = (v) => ELEC_LABEL[v?.toLowerCase()] ?? v ?? "-";

// Design tokens shared with the owner dashboard, kept local to this page
// since there's no shared layout file to hold them.
function DesignTokens() {
  return (
    <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap");

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

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-[#E4E0D6] animate-pulse">
      <div className="h-64 bg-[#EFEBE1]" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-[#EFEBE1] rounded w-3/4" />
        <div className="h-8 bg-[#EFEBE1] rounded w-1/2" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-[#EFEBE1] rounded" />
          ))}
        </div>
        <div className="h-28 bg-[#F6F4EE] rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-11 bg-[#EFEBE1] rounded-xl" />
          <div className="h-11 bg-[#EFEBE1] rounded-xl" />
        </div>
        <div className="h-11 bg-[#EFEBE1] rounded-xl" />
      </div>
    </div>
  );
}

// ─── Unit card ────────────────────────────────────────────────────────────────

function UnitCard({ unit }) {
  const available = unit.unit_availability > 0;
  const d = unit.detail_unit; // bisa null

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-[#E4E0D6] hover:border-[#2F5D50]/40 hover:shadow-xl duration-300 hover:-translate-y-1 transition">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={unit.unit_photo[0]}
          alt={`Foto ${unit.unit_name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover hover:scale-110 transition duration-500"
          unoptimized
        />
        <div className="absolute top-4 left-4">
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono-num tracking-wide ${
              available
                ? "bg-[#B98A3D] text-white"
                : "bg-[#1F2723]/80 text-white"
            }`}
          >
            {available ? "TERSEDIA" : "PENUH"}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-display text-2xl font-semibold text-[#1F2723]">
          {unit.unit_name}
        </h3>

        <p className="mt-3 text-3xl font-semibold text-[#2F5D50] font-mono-num">
          Rp {formatPrice(unit.rental_price)}
          <span className="text-base font-normal font-body text-[#8C8578]">
            {" "}
            /bulan
          </span>
        </p>

        {/* Fasilitas — tampil "-" kalau detail_unit null */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-[#4A4640]">
          <div className="flex items-center gap-2">
            <FaBed className="text-[#B98A3D] shrink-0" />
            <span>{d?.bedroom ?? "-"} Kamar</span>
          </div>
          <div className="flex items-center gap-2">
            <FaBath className="text-[#B98A3D] shrink-0" />
            <span>{d?.bathroom ?? "-"} K. Mandi</span>
          </div>
          <div className="flex items-center gap-2">
            <FaKitchenSet className="text-[#B98A3D] shrink-0" />
            <span>{d?.kitchen ?? "-"} Dapur</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCouch className="text-[#B98A3D] shrink-0" />
            <span>{d?.livingroom ?? "-"} Ruang Tamu</span>
          </div>
        </div>

        <div className="mt-6 border-t border-[#E4E0D6] pt-5 space-y-3 text-[#6B6459] text-sm">
          <div className="flex justify-between">
            <span>Total Unit</span>
            <span className="font-semibold text-[#1F2723] font-mono-num">
              {unit.total_units}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Unit Tersedia</span>
            <span className="font-semibold text-[#2F5D50] font-mono-num">
              {unit.unit_availability}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Listrik</span>
            <span className="font-semibold text-[#1F2723]">
              {labelListrik(d?.electricity_type)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Air</span>
            <span className="font-semibold text-[#1F2723]">
              {labelAir(d?.water_access)}
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {/* Lokasi pakai koordinat, bukan unit.location */}
          <a
            href={buildGoogleMapsUrl(unit.latitude, unit.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Lihat lokasi ${unit.unit_name} di peta`}
          >
            <button className="w-full flex justify-center items-center gap-2 border border-[#2F5D50] text-[#2F5D50] py-3 rounded-xl hover:bg-[#2F5D50]/5 transition text-sm font-medium focus-ring">
              <FaLocationDot />
              Lokasi
            </button>
          </a>

          <a
            href={`https://wa.me/${toWaNumber(unit.phone_number)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Hubungi pemilik ${unit.unit_name} via WhatsApp`}
          >
            <button className="w-full flex justify-center items-center gap-2 bg-[#2F5D50] hover:bg-[#24463C] text-white py-3 rounded-xl transition text-sm font-medium focus-ring">
              <FaPhone />
              Hubungi
            </button>
          </a>
        </div>

        <Link href={`/units/${unit.unit_id}`}>
          <button className="w-full mt-3 bg-[#1F2723] hover:bg-black text-white py-3 rounded-xl transition text-sm font-medium focus-ring">
            Lihat Detail
          </button>
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    setIsLoggedIn(!!token);

    const fetchUnits = async () => {
      try {
        const result = await getAllUnits();
        setUnits(result.data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data kontrakan. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const totalUnits = units.reduce((sum, item) => sum + item.total_units, 0);
  const availableUnits = units.reduce(
    (sum, item) => sum + item.unit_availability,
    0
  );

  const stats = [
    { value: units.length, label: "Kontrakan" },
    { value: totalUnits, label: "Total Unit" },
    { value: availableUnits, label: "Unit Tersedia" },
  ];

  return (
    <main className="bg-[#F6F4EE] min-h-screen font-body">
      <DesignTokens />

      {/* ── HERO ── */}
      <section className="bg-[#1F2723] text-white">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <p className="inline-flex items-center gap-2 border border-[#B98A3D]/50 text-[#B98A3D] rounded-full px-5 py-2 text-sm font-medium font-mono-num tracking-wide">
            <FaHouse />
            KONTRAKAN TERPERCAYA
          </p>

          <h1 className="mt-7 font-display text-5xl md:text-6xl font-semibold leading-tight">
            Temukan kontrakan
            <br />
            yang nyaman untukmu
          </h1>

          <p className="mt-7 text-lg max-w-2xl text-[#B8B2A3] leading-8">
            Kontrakan Al-Amin menyediakan hunian yang nyaman, aman, dan
            strategis dengan proses booking secara online.
          </p>

          <div className="mt-10 flex gap-4 flex-wrap">
            <Link href="#kontrakan">
              <button className="bg-[#B98A3D] hover:bg-[#A47A34] text-white px-6 py-3 rounded-xl font-semibold transition focus-ring">
                Lihat Kontrakan
              </button>
            </Link>
            {!isLoggedIn && (
              <Link href="/register">
                <button className="border border-white/40 px-6 py-3 rounded-xl hover:bg-white hover:text-[#1F2723] transition font-medium focus-ring">
                  Daftar Sekarang
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── STATISTIK — ledger strip, konsisten dengan dashboard owner ── */}
      <section className="-mt-10 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-lg flex flex-wrap divide-x divide-[#E4E0D6] overflow-hidden">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="flex-1 min-w-36 text-center py-7 px-6"
              >
                <h2 className="font-mono-num text-4xl font-semibold text-[#1F2723]">
                  {loading ? (
                    <span className="inline-block w-14 h-9 bg-[#EFEBE1] rounded animate-pulse" />
                  ) : (
                    value
                  )}
                </h2>
                <p className="mt-2 text-xs uppercase tracking-wider text-[#8C8578] font-medium">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIST KONTRAKAN ── */}
      <section id="kontrakan" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-display text-4xl font-semibold text-center text-[#1F2723]">
          Daftar Kontrakan
        </h2>
        <p className="text-center text-[#8C8578] mt-4">
          Pilih kontrakan yang sesuai dengan kebutuhanmu.
        </p>

        {loading ? (
          <div className="grid gap-8 mt-14 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-[#B5453D] text-lg font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-[#2F5D50] text-white px-6 py-3 rounded-xl hover:bg-[#24463C] transition focus-ring"
            >
              Coba Lagi
            </button>
          </div>
        ) : units.length === 0 ? (
          <div className="text-center py-20">
            <FaBoxOpen className="text-6xl text-[#D8D3C6] mx-auto" />
            <h2 className="font-display text-2xl font-semibold text-[#1F2723] mt-6">
              Belum ada kontrakan
            </h2>
            <p className="text-[#8C8578] mt-3">
              Silakan kembali beberapa saat lagi.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 mt-14 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <UnitCard key={unit.unit_id} unit={unit} />
            ))}
          </div>
        )}
      </section>

      {/* ── MENGAPA MEMILIH KAMI ── */}
      <section className="bg-white py-24 border-y border-[#E4E0D6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="font-display text-4xl font-semibold text-[#1F2723]">
              Mengapa memilih Kontrakan Al-Amin?
            </h2>
            <p className="mt-4 text-[#8C8578] max-w-2xl mx-auto">
              Kami menyediakan hunian yang nyaman, aman, dan mudah diakses
              dengan proses booking yang praktis.
            </p>
          </div>

          <div className="grid md:grid-cols-3 mt-16 divide-y md:divide-y-0 md:divide-x divide-[#E4E0D6] border border-[#E4E0D6] rounded-2xl overflow-hidden">
            {[
              {
                icon: <FaHouse className="text-2xl text-[#B98A3D]" />,
                title: "Hunian Nyaman",
                desc: "Lingkungan bersih, aman, dan cocok untuk mahasiswa maupun keluarga.",
              },
              {
                icon: <FaLocationDot className="text-2xl text-[#B98A3D]" />,
                title: "Lokasi Strategis",
                desc: "Dekat jalan utama, minimarket, tempat makan, dan fasilitas umum.",
              },
              {
                icon: <FaPhone className="text-2xl text-[#B98A3D]" />,
                title: "Booking Mudah",
                desc: "Hubungi pemilik atau lakukan booking secara online kapan saja.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="p-10 text-center bg-white">
                <div className="w-14 h-14 rounded-full bg-[#F6F4EE] flex items-center justify-center mx-auto">
                  {icon}
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-[#1F2723]">
                  {title}
                </h3>
                <p className="mt-3 text-[#6B6459] leading-7 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}

      {!isLoggedIn && (
        <section className="bg-[#1F2723] text-white py-24">
          <div className="max-w-5xl mx-auto text-center px-6">
            <h2 className="font-display text-4xl font-semibold">
              Siap menemukan kontrakan impian?
            </h2>
            <p className="mt-5 text-[#B8B2A3] text-lg">
              Daftar sekarang dan lakukan booking kontrakan secara online.
            </p>
            <Link href="/register">
              <button className="mt-10 bg-[#B98A3D] hover:bg-[#A47A34] text-white px-8 py-4 rounded-xl font-semibold transition focus-ring">
                Daftar Sekarang
              </button>
            </Link>
          </div>
        </section>
      )}

      {/* ── KONTAK ── */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="font-display text-4xl font-semibold text-[#1F2723]">
              Hubungi Kami
            </h2>
            <p className="mt-4 text-[#8C8578]">
              Kami siap membantu Anda kapan saja.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 mt-16 items-start">
            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="w-14 h-14 rounded-full bg-[#F6F4EE] flex items-center justify-center shrink-0">
                  <FaLocationDot className="text-[#2F5D50] text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#1F2723]">
                    Alamat
                  </h3>
                  <p className="text-[#6B6459] leading-7">
                    Gang Al-Amin, Gandoang,
                    <br />
                    Kecamatan Cileungsi,
                    <br />
                    Kabupaten Bogor
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-14 h-14 rounded-full bg-[#F6F4EE] flex items-center justify-center shrink-0">
                  <FaPhone className="text-[#2F5D50] text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#1F2723]">
                    Telepon
                  </h3>
                  <p className="text-[#6B6459]">0858-1709-4923</p>
                </div>
              </div>
            </div>

            {/* Peta Leaflet pakai UnitMap reusable */}
            <UnitMap
              lat={OFFICE_LAT}
              lng={OFFICE_LNG}
              label="Kontrakan Al-Amin — Gang Al-Amin, Gandoang, Cileungsi, Bogor"
              heightClass="h-96 rounded-3xl border border-[#E4E0D6]"
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1F2723] text-[#B8B2A3]">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">
                Kontrakan Al-Amin
              </h2>
              <p className="mt-4 leading-7 text-sm">
                Platform penyewaan kontrakan yang memudahkan calon penyewa
                menemukan hunian terbaik secara online.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">Menu</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <Link href="/" className="hover:text-white transition">
                  Beranda
                </Link>
                <Link href="#kontrakan" className="hover:text-white transition">
                  Kontrakan
                </Link>
                <Link href="/login" className="hover:text-white transition">
                  Login
                </Link>
                <Link href="/register" className="hover:text-white transition">
                  Register
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">Kontak</h3>
              <div className="mt-4 space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <FaLocationDot className="text-[#B98A3D]" /> Gang Al-Amin,
                  Gandoang, Cileungsi, Bogor
                </p>
                <p className="flex items-center gap-2">
                  <FaPhone className="text-[#B98A3D]" /> 0858-1709-4923
                </p>
                <p className="flex items-center gap-2">
                  <FaEnvelope className="text-[#B98A3D]" />{" "}
                  admin@kontrakanalamin.com
                </p>
              </div>
            </div>
          </div>

          <hr className="my-10 border-white/10" />

          <p className="text-center text-sm">
            © 2026 Kontrakan Al-Amin. All Rights Reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
