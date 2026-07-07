"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getAllOwnerBooking } from "@/services/booking";
import {
  FaArrowLeft,
  FaClipboardList,
  FaUser,
  FaChevronRight,
} from "react-icons/fa6";

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

const formatDate = (str) =>
  new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
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

const TABS = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "accepted", label: "Diterima" },
  { key: "rejected", label: "Ditolak" },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E0D6] animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#EFEBE1] shrink-0" />
        <div className="space-y-2">
          <div className="h-4 w-36 bg-[#EFEBE1] rounded" />
          <div className="h-3 w-24 bg-[#EFEBE1] rounded" />
        </div>
      </div>
      <div className="h-6 w-20 bg-[#EFEBE1] rounded-full" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingOwner() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const result = await getAllOwnerBooking();
        setBookings(result.data);
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat data booking");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filtered =
    activeTab === "all"
      ? bookings
      : bookings.filter((b) => b.booking_status === activeTab);

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.booking_status === "pending").length,
    accepted: bookings.filter((b) => b.booking_status === "accepted").length,
    rejected: bookings.filter((b) => b.booking_status === "rejected").length,
  };

  return (
    <main className="bg-[#F6F4EE] min-h-screen pb-12 font-body">
      <DesignTokens />

      {/* HERO SECTION — Menggunakan warna gelap khas dashboard */}
      <div className="bg-[#1F2723]">
        <div className="max-w-4xl mx-auto px-6 pt-6 pb-12">
          <Link
            href="/dashboard-owner"
            className="inline-flex items-center gap-2 text-sm text-[#B8B2A3] hover:text-white font-medium transition mb-8 focus-ring rounded"
          >
            <FaArrowLeft />
            Kembali ke Dashboard
          </Link>

          <h1 className="font-display text-3xl text-white font-semibold">
            Daftar Booking
          </h1>
          <p className="text-[#8C8578] text-sm mt-1.5 leading-relaxed">
            Kelola dan tinjau semua pengajuan sewa unit kontrakan masuk dari
            calon penyewa.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-6">
        {/* Filter tab — Bergaya minimalis tenang */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition duration-200 focus-ring shadow-sm ${
                  isActive
                    ? "bg-[#2F5D50] text-white"
                    : "bg-white text-[#6B6459] hover:bg-[#F6F4EE] border border-[#E4E0D6]"
                }`}
              >
                {tab.label}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono-num font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#F6F4EE] text-[#8C8578]"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* List Manifest / Ledger Style */}
        <div className="mt-6 bg-white rounded-2xl border border-[#E4E0D6] shadow-sm overflow-hidden">
          {loading ? (
            <div className="divide-y divide-[#E4E0D6]">
              {[...Array(4)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FaClipboardList className="text-4xl text-[#D8D3C6] mx-auto" />
              <p className="mt-4 text-sm text-[#8C8578]">
                Tidak ada data booking{" "}
                {activeTab !== "all"
                  ? STATUS_LABEL[activeTab]?.toLowerCase()
                  : ""}
                .
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E4E0D6]">
              {filtered.map((b) => (
                <Link
                  key={b.booking_id}
                  href={`/dashboard-owner/bookings/${b.booking_id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between px-6 py-4 hover:bg-[#F6F4EE]/50 transition duration-200 focus-ring">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#1F2723] flex items-center justify-center shrink-0 shadow-sm">
                        <span className="text-[#B98A3D] text-sm font-display font-semibold">
                          {b.tenant_name?.[0]?.toUpperCase() ?? "?"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1F2723] text-base truncate">
                          {b.tenant_name}
                        </p>
                        <p className="text-xs text-[#8C8578] mt-0.5 font-body truncate">
                          <span className="font-medium text-[#4A4640]">
                            {b.unit?.unit_name}
                          </span>{" "}
                          · {formatDate(b.booking_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          STATUS_STYLE[b.booking_status] ??
                          "bg-[#EFEBE1] text-[#6B6459]"
                        }`}
                      >
                        {STATUS_LABEL[b.booking_status] ?? b.booking_status}
                      </span>
                      <FaChevronRight className="text-[#D8D3C6] text-xs" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
