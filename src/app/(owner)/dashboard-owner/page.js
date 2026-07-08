"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import {
  FaHouse,
  FaBuilding,
  FaClipboardList,
  FaCircleCheck,
  FaPlus,
  FaArrowLeft,
  FaBed,
  FaBath,
  FaDoorOpen,
  FaPenToSquare,
  FaTrash,
  FaXmark,
  FaChevronRight,
  FaWallet,
} from "react-icons/fa6";
import { getUnitOwner, deleteUnit } from "@/services/unit";
import { getAllOwnerBooking } from "@/services/booking";

const formatPrice = (price) => new Intl.NumberFormat("id-ID").format(price);

const STATUS_STYLE = {
  pending: "bg-[#F5E7CC] text-[#8A6416]",
  accepted: "bg-[#E1ECE5] text-[#2F5D50]",
  rejected: "bg-[#F6DEDA] text-[#B5453D]",
};
const STATUS_LABEL = {
  pending: "Menunggu",
  accepted: "Diterima",
  rejected: "Ditolak",
};

// Shared type + palette setup
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

      @media (prefers-reduced-motion: reduce) {
        * {
          transition-duration: 0.01ms !important;
          animation-duration: 0.01ms !important;
        }
      }
    `}</style>
  );
}

// ─── Modal hapus ──────────────────────────────────────────────────────────────

function DeleteModal({ unit, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-body">
      <div
        className="absolute inset-0 bg-[#1F2723]/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-[#F6F4EE] rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-[#E4E0D6] animate-[fadeIn_0.2s_ease-out]">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-[#8C8578] hover:text-[#1F2723] transition focus-ring rounded"
          aria-label="Tutup"
        >
          <FaXmark />
        </button>
        <div className="w-12 h-12 rounded-full bg-[#F6DEDA] flex items-center justify-center mx-auto">
          <FaTrash className="text-[#B5453D]" />
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold text-[#1F2723] text-center">
          Hapus kontrakan ini?
        </h2>
        <p className="mt-2 text-[#6B6459] text-center text-sm leading-relaxed">
          <span className="font-semibold text-[#1F2723]">{unit.unit_name}</span>{" "}
          akan dihapus permanen dan tidak bisa dikembalikan.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-[#D8D3C6] text-[#4A4640] hover:bg-white py-2.5 rounded-xl text-sm font-medium transition focus-ring"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-[#B5453D] hover:bg-[#9A3931] disabled:bg-[#D8D3C6] text-white py-2.5 rounded-xl text-sm font-semibold transition focus-ring"
          >
            {loading ? "Menghapus…" : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonLedgerStat() {
  return (
    <div className="flex-1 min-w-28 py-4 px-5 animate-pulse">
      <div className="h-3 w-16 bg-[#E4E0D6] rounded mb-3" />
      <div className="h-7 w-10 bg-[#E4E0D6] rounded" />
    </div>
  );
}

function SkeletonUnitCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#E4E0D6] overflow-hidden animate-pulse">
      <div className="h-44 bg-[#EFEBE1]" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-[#EFEBE1] rounded" />
        <div className="h-6 w-1/2 bg-[#EFEBE1] rounded" />
        <div className="flex gap-3">
          <div className="h-4 w-16 bg-[#EFEBE1] rounded" />
          <div className="h-4 w-16 bg-[#EFEBE1] rounded" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-9 bg-[#EFEBE1] rounded-xl" />
          <div className="h-9 bg-[#EFEBE1] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Unit card ────────────────────────────────────────────────────────────────

function UnitCard({ unit, onDeleteClick }) {
  const available = unit.unit_availability > 0;
  const d = unit.detail_unit;

  return (
    <div className="bg-white rounded-2xl border border-[#E4E0D6] hover:border-[#2F5D50]/40 hover:shadow-md transition overflow-hidden group flex flex-col h-full">
      <div className="relative h-44 overflow-hidden shrink-0">
        <Image
          src={unit.unit_photo[0]}
          alt={`Foto ${unit.unit_name}`}
          fill
          className="object-cover group-hover:scale-105 transition duration-500"
          unoptimized
        />
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold font-mono-num tracking-tight ${
              available
                ? "bg-[#B98A3D] text-white"
                : "bg-[#1F2723]/80 text-white"
            }`}
          >
            {available ? "TERSEDIA" : "PENUH"}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-[#1F2723] leading-tight text-base line-clamp-2">
          {unit.unit_name}
        </h3>
        <p className="mt-1 text-lg font-semibold text-[#2F5D50] font-mono-num">
          Rp {formatPrice(unit.rental_price)}
          <span className="text-xs font-normal font-body text-[#8C8578]">
            {" "}
            /bulan
          </span>
        </p>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#6B6459] mb-auto">
          <span className="flex items-center gap-1.5">
            <FaBed className="text-[#B98A3D]" />
            {d?.bedroom ?? 0} kamar
          </span>
          <span className="flex items-center gap-1.5">
            <FaBath className="text-[#B98A3D]" />
            {d?.bathroom ?? 0} k. mandi
          </span>
          <span className="flex items-center gap-1.5">
            <FaDoorOpen className="text-[#B98A3D]" />
            {unit.unit_availability}/{unit.total_units} unit
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-[#F6F4EE]">
          <Link href={`/dashboard-owner/units/${unit.unit_id}`}>
            <button className="w-full flex items-center justify-center gap-1.5 bg-[#2F5D50] hover:bg-[#24463C] text-white py-2 rounded-xl text-xs font-medium transition focus-ring">
              <FaPenToSquare /> Edit
            </button>
          </Link>
          <button
            onClick={() => onDeleteClick(unit)}
            className="w-full flex items-center justify-center gap-1.5 border border-[#E2B6AF] text-[#B5453D] hover:bg-[#F6DEDA]/50 py-2 rounded-xl text-xs font-medium transition focus-ring"
          >
            <FaTrash /> Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardOwner() {
  const [units, setUnits] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const ownerName = (() => {
    try {
      const raw = Cookies.get("payload");
      return raw ? JSON.parse(raw).name : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [unitRes, bookingRes] = await Promise.all([
          getUnitOwner(),
          getAllOwnerBooking(),
        ]);
        setUnits(unitRes.data);
        setBookings(bookingRes.data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleDeleteClick = (unit) => setDeleteTarget(unit);
  const handleCancelDelete = () => setDeleteTarget(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUnit(deleteTarget.unit_id);
      toast.success(`${deleteTarget.unit_name} berhasil dihapus`);
      setUnits((prev) =>
        prev.filter((u) => u.unit_id !== deleteTarget.unit_id)
      );
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus kontrakan");
    } finally {
      setDeleting(false);
    }
  };

  const totalUnits = units.reduce((sum, u) => sum + u.total_units, 0);
  const totalAvail = units.reduce((sum, u) => sum + u.unit_availability, 0);
  const occupied = totalUnits - totalAvail;
  const occupancyRate =
    totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0;
  const pendingCount = bookings.filter(
    (b) => b.booking_status === "pending"
  ).length;

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const ledgerStats = [
    { label: "Kontrakan", value: units.length },
    { label: "Total Unit", value: totalUnits },
    { label: "Booking Masuk", value: bookings.length },
    { label: "Unit Tersedia", value: totalAvail },
  ];

  return (
    <main className="bg-[#F6F4EE] min-h-screen font-body pb-12">
      <DesignTokens />

      {/* HERO */}
      <div className="bg-[#1F2723]">
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#B8B2A3] hover:text-white font-medium transition mb-8 focus-ring rounded"
          >
            <FaArrowLeft /> Beranda
          </Link>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#8C8578]">
                {today}
              </p>
              <h1 className="mt-2 font-display text-2xl text-white">
                Halo, Selamat Datang Kembali
              </h1>

              <div className="mt-6 flex items-baseline gap-3">
                {loading ? (
                  <div className="h-14 w-28 bg-white/10 rounded animate-pulse" />
                ) : (
                  <span className="font-display text-6xl text-white leading-none">
                    {occupancyRate}%
                  </span>
                )}
                <div className="leading-tight">
                  <p className="text-sm text-[#B8B2A3]">unit terisi</p>
                  {!loading && (
                    <p className="text-xs font-mono-num text-[#8C8578]">
                      {occupied}/{totalUnits} unit
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Link href="/dashboard-owner/units/create">
              <button className="flex items-center gap-2 bg-[#B98A3D] hover:bg-[#A47A34] text-white px-5 py-3 rounded-xl transition text-sm font-semibold focus-ring shadow-sm">
                <FaPlus /> Tambah Kontrakan
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-6">
        {/* LEDGER STRIP */}
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm flex flex-wrap divide-y sm:divide-y-0 sm:divide-x divide-[#E4E0D6] overflow-hidden mb-8">
          {loading
            ? [...Array(4)].map((_, i) => <SkeletonLedgerStat key={i} />)
            : ledgerStats.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex-1 min-w-35 py-4 px-5 hover:bg-[#F6F4EE]/40 transition"
                >
                  <p className="text-[11px] uppercase tracking-wider text-[#8C8578] font-medium">
                    {label}
                  </p>
                  <p className="mt-1.5 text-2xl font-mono-num font-semibold text-[#1F2723]">
                    {value}
                  </p>
                </div>
              ))}
        </div>

        {/* KONTEN UTAMA */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* KIRI — Kontrakan Saya */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-[#1F2723] text-lg">
                Kontrakan Saya
              </h2>
              <Link
                href="/dashboard-owner/units/create"
                className="text-xs text-[#2F5D50] hover:text-[#1F2723] font-medium transition flex items-center gap-1 focus-ring rounded"
              >
                <FaPlus className="text-xs" /> Tambah Baru
              </Link>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <SkeletonUnitCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl border border-[#E4E0D6] p-8 text-center shadow-sm">
                <p className="text-[#B5453D] text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 text-sm text-[#2F5D50] hover:underline focus-ring rounded"
                >
                  Coba lagi
                </button>
              </div>
            ) : units.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-[#D8D3C6]">
                <FaHouse className="text-4xl text-[#D8D3C6] mx-auto" />
                <p className="mt-3 text-sm text-[#8C8578]">
                  Belum ada kontrakan yang terdaftar.
                </p>
                <Link href="/dashboard-owner/units/create">
                  <button className="mt-4 bg-[#2F5D50] text-white px-5 py-2.5 rounded-xl hover:bg-[#24463C] transition text-sm font-semibold focus-ring">
                    Tambah Sekarang
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {units.map((unit) => (
                  <UnitCard
                    key={unit.unit_id}
                    unit={unit}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </div>

          {/* KANAN — Panel Navigasi Ekstra & Booking */}
          <div className="space-y-6">
            {/* BOOKING TERBARU */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-[#1F2723] text-lg flex items-center">
                  Booking Masuk
                  {!loading && pendingCount > 0 && (
                    <span className="ml-2 bg-[#B98A3D] text-white text-[11px] font-mono-num font-semibold px-2 py-0.5 rounded-full">
                      {pendingCount} baru
                    </span>
                  )}
                </h2>
                <Link
                  href="/dashboard-owner/bookings"
                  className="text-xs text-[#2F5D50] hover:text-[#1F2723] font-medium transition focus-ring rounded"
                >
                  Lihat Semua
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm overflow-hidden">
                {loading ? (
                  <div className="divide-y divide-[#E4E0D6]">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-3 animate-pulse"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#EFEBE1] shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3.5 w-28 bg-[#EFEBE1] rounded" />
                          <div className="h-3 w-20 bg-[#EFEBE1] rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="p-8 text-center">
                    <FaClipboardList className="text-3xl text-[#D8D3C6] mx-auto" />
                    <p className="mt-3 text-xs text-[#8C8578]">
                      Belum ada booking yang masuk.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E4E0D6]">
                    {bookings.slice(0, 5).map((b) => (
                      <Link
                        key={b.booking_id}
                        href={"/dashboard-owner/bookings"}
                      >
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#F6F4EE] transition focus-ring">
                          <div className="w-8 h-8 rounded-full bg-[#1F2723] flex items-center justify-center shrink-0">
                            <span className="text-[#B98A3D] text-xs font-display font-semibold">
                              {b.tenant_name?.[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1F2723] truncate">
                              {b.tenant_name}
                            </p>
                            <p className="text-[11px] text-[#8C8578] truncate">
                              {b.unit?.unit_name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                STATUS_STYLE[b.booking_status] ??
                                "bg-[#EFEBE1] text-[#6B6459]"
                              }`}
                            >
                              {STATUS_LABEL[b.booking_status] ??
                                b.booking_status}
                            </span>
                            <FaChevronRight className="text-[#D8D3C6] text-[10px]" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* PINTU MASUK BUKU PEMBAYARAN */}
            <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-[#E1ECE5] text-[#2F5D50] rounded-full flex items-center justify-center mb-4">
                <FaWallet className="text-2xl" />
              </div>
              <h2 className="font-display font-semibold text-[#1F2723] text-lg">
                Buku Pembayaran
              </h2>
              <p className="text-sm text-[#8C8578] mt-2 mb-6 leading-relaxed">
                Pencatatan kas manual. Pantau pemasukan dari penyewa di luar
                sistem booking otomatis.
              </p>
              <Link href="/dashboard-owner/payments" className="w-full">
                <button className="w-full flex items-center justify-center gap-2 bg-[#F6F4EE] hover:bg-[#E4E0D6] text-[#2F5D50] py-3 rounded-xl text-sm font-semibold transition focus-ring">
                  Buka Buku Catatan <FaChevronRight className="text-xs" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DELETE */}
      {deleteTarget && (
        <DeleteModal
          unit={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          loading={deleting}
        />
      )}
    </main>
  );
}
