"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { getAllTenantBooking } from "@/services/booking";
import {
  FaArrowLeft,
  FaClipboardList,
  FaChevronRight,
  FaHouse,
} from "react-icons/fa6";

const STATUS_STYLE = {
  pending: "bg-[#F5E7CC] text-[#8A6416] border border-[#E9D5B3]",
  accepted: "bg-[#E1ECE5] text-[#2F5D50] border border-[#C6DEC0]",
  rejected: "bg-[#F6DEDA] text-[#B5453D] border border-[#E2B6AF]",
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

const TABS = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "accepted", label: "Diterima" },
  { key: "rejected", label: "Ditolak" },
];

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const result = await getAllTenantBooking();
        setBookings(result.data);
      } catch (err) {
        toast.error("Gagal memuat riwayat booking");
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

      <div className="bg-[#1F2723]">
        <div className="max-w-3xl mx-auto px-6 pt-6 pb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#B8B2A3] hover:text-white font-medium transition mb-8 focus-ring rounded"
          >
            <FaArrowLeft /> Kembali ke Beranda
          </Link>
          <h1 className="font-display text-3xl text-white font-semibold">
            Booking Saya
          </h1>
          <p className="text-[#8C8578] text-sm mt-1.5 leading-relaxed">
            Pantau status pengajuan sewa kontrakan yang telah Anda kirimkan.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-6">
        <div className="flex gap-2 flex-wrap mb-6">
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

        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm overflow-hidden">
          {loading ? (
            <div className="divide-y divide-[#E4E0D6]">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-6 py-5 animate-pulse"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#EFEBE1] shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 bg-[#EFEBE1] rounded" />
                    <div className="h-3 w-24 bg-[#EFEBE1] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FaClipboardList className="text-4xl text-[#D8D3C6] mx-auto" />
              <p className="mt-4 text-sm text-[#8C8578]">
                Tidak ada riwayat{" "}
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
                  href={`/booking-history/${b.booking_id}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between px-5 py-4 hover:bg-[#F6F4EE]/50 transition duration-200 focus-ring">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#D8D3C6] shrink-0 bg-[#EFEBE1] flex items-center justify-center">
                        {b.unit?.unit_photo?.[0] ? (
                          <Image
                            src={b.unit.unit_photo[0]}
                            alt={b.unit.unit_name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <FaHouse className="text-[#D8D3C6] text-xl" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1F2723] text-base truncate group-hover:text-[#2F5D50] transition">
                          {b.unit?.unit_name}
                        </p>
                        <p className="text-xs text-[#8C8578] mt-0.5 font-body">
                          Diajukan pada:{" "}
                          <span className="font-medium text-[#4A4640]">
                            {formatDate(b.booking_date)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          STATUS_STYLE[b.booking_status] ??
                          "bg-[#EFEBE1] text-[#6B6459]"
                        }`}
                      >
                        {STATUS_LABEL[b.booking_status]}
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
