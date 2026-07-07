"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { getOwnerBookingById, updateStatusBooking } from "@/services/booking";
import {
  FaArrowLeft,
  FaUser,
  FaHouse,
  FaCalendarDays,
  FaLocationDot,
  FaVenusMars,
  FaCakeCandles,
  FaCircleCheck,
  FaCircleXmark,
  FaClockRotateLeft,
} from "react-icons/fa6";

const STATUS_STYLE = {
  pending: "bg-[#F5E7CC] text-[#8A6416] border border-[#E9D5B3]",
  accepted: "bg-[#E1ECE5] text-[#2F5D50] border border-[#C6DEC0]",
  rejected: "bg-[#F6DEDA] text-[#B5453D] border border-[#E2B6AF]",
};
const STATUS_LABEL = {
  pending: "Menunggu Konfirmasi",
  accepted: "Diterima",
  rejected: "Ditolak",
};
const STATUS_ICON = {
  pending: <FaClockRotateLeft className="text-[#8A6416]" />,
  accepted: <FaCircleCheck className="text-[#2F5D50]" />,
  rejected: <FaCircleXmark className="text-[#B5453D]" />,
};

const formatDate = (str) =>
  new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatPrice = (price) => new Intl.NumberFormat("id-ID").format(price);

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

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start justify-between py-3 border-b last:border-0 border-[#F6F4EE]">
      <div className="flex items-center gap-3 text-[#6B6459] text-sm">
        <span className="text-[#B98A3D] text-xs">{icon}</span>
        {label}
      </div>
      <span className="text-sm font-semibold text-[#1F2723] text-right max-w-[55%] truncate">
        {value ?? "-"}
      </span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      <div className="bg-white rounded-2xl border border-[#E4E0D6] p-6 space-y-4">
        <div className="h-6 w-32 bg-[#EFEBE1] rounded" />
        <div className="h-4 w-48 bg-[#EFEBE1] rounded" />
      </div>
      <div className="bg-white rounded-2xl border border-[#E4E0D6] p-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 bg-[#EFEBE1] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingOwnerDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchBooking = async () => {
      try {
        const result = await getOwnerBookingById(id);
        setBooking(result.data);
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat detail booking");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handleUpdateStatus = async (status) => {
    setUpdating(true);
    try {
      await updateStatusBooking(id, status);
      setBooking((prev) => ({ ...prev, booking_status: status }));
      toast.success(
        status === "accepted"
          ? "Booking berhasil diterima!"
          : "Booking ditolak."
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengubah status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <main className="bg-[#F6F4EE] min-h-screen p-8 font-body">
        <DesignTokens />
        <div className="h-10 w-44 bg-[#E4E0D6] rounded-xl animate-pulse mb-6" />
        <DetailSkeleton />
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F6F4EE] font-body">
        <DesignTokens />
        <p className="text-[#8C8578] text-sm">Booking tidak ditemukan.</p>
        <Link href="/dashboard-owner/bookings">
          <button className="flex items-center gap-2 bg-[#2F5D50] text-white px-5 py-2.5 rounded-xl hover:bg-[#24463C] transition text-sm font-medium focus-ring">
            <FaArrowLeft className="text-xs" />
            Kembali
          </button>
        </Link>
      </main>
    );
  }

  const u = booking.unit;
  const isPending = booking.booking_status === "pending";

  return (
    <main className="bg-[#F6F4EE] min-h-screen pb-12 font-body">
      <DesignTokens />

      {/* HERO SECTION — Menyelaraskan dengan header dashboard utama */}
      <div className="bg-[#1F2723]">
        <div className="max-w-2xl mx-auto px-6 pt-6 pb-12">
          <Link
            href="/dashboard-owner/bookings"
            className="inline-flex items-center gap-2 text-sm text-[#B8B2A3] hover:text-white font-medium transition mb-8 focus-ring rounded"
          >
            <FaArrowLeft />
            Kembali ke Daftar Booking
          </Link>

          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-mono-num text-[#8C8578]">
                ID Booking #{booking.booking_id}
              </p>
              <h1 className="font-display text-3xl text-white font-semibold mt-1">
                {booking.tenant_name}
              </h1>
            </div>
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm ${
                STATUS_STYLE[booking.booking_status]
              }`}
            >
              {STATUS_ICON[booking.booking_status]}
              {STATUS_LABEL[booking.booking_status]}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-6 space-y-6">
        {/* INFO UNIT KONTRAKAN */}
        {u && (
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm overflow-hidden group">
            <div className="relative h-44">
              <Image
                src={u.unit_photo[0]}
                alt={u.unit_name}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#1F2723]/80 via-[#1F2723]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-wrap justify-between items-end gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#B8B2A3] font-medium mb-0.5">
                    Unit Kontrakan
                  </p>
                  <p className="text-white font-display font-semibold text-lg leading-tight">
                    {u.unit_name}
                  </p>
                </div>
                <p className="text-[#F5E7CC] font-mono-num font-semibold text-base">
                  Rp {formatPrice(u.rental_price)}
                  <span className="text-xs font-normal font-body text-[#B8B2A3]">
                    {" "}
                    /bulan
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DATA PENYEWA */}
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-6">
          <h2 className="font-display font-semibold text-base text-[#1F2723] flex items-center gap-2 mb-4 pb-2 border-b border-[#F6F4EE]">
            <FaUser className="text-[#B98A3D] text-sm" />
            Profil Singkat Penyewa
          </h2>
          <div className="divide-y divide-[#F6F4EE]">
            <InfoRow
              icon={<FaUser />}
              label="Nama Lengkap"
              value={booking.tenant_name}
            />
            <InfoRow
              icon={<FaLocationDot />}
              label="Asal Kota / Daerah"
              value={booking.hometown}
            />
            <InfoRow
              icon={<FaCakeCandles />}
              label="Tanggal Lahir"
              value={formatDate(booking.birth_place_date)}
            />
            <InfoRow
              icon={<FaVenusMars />}
              label="Jenis Kelamin"
              value={booking.gender}
            />
          </div>
        </div>

        {/* DETAIL BOOKING */}
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-6">
          <h2 className="font-display font-semibold text-base text-[#1F2723] flex items-center gap-2 mb-4 pb-2 border-b border-[#F6F4EE]">
            <FaCalendarDays className="text-[#B98A3D] text-sm" />
            Manifes Detail Sewa
          </h2>
          <div className="divide-y divide-[#F6F4EE]">
            <InfoRow
              icon={<FaCalendarDays />}
              label="Tanggal Pengajuan"
              value={formatDate(booking.booking_date)}
            />
            <InfoRow
              icon={<FaHouse />}
              label="Rencana Masuk"
              value={formatDate(booking.move_in_date)}
            />
            <InfoRow
              icon={<FaHouse />}
              label="Nama Objek Unit"
              value={u?.unit_name}
            />
          </div>
        </div>

        {/* ACTION BUTTONS — Tergantung status pending */}
        {isPending ? (
          <div className="flex gap-4">
            <button
              onClick={() => handleUpdateStatus("rejected")}
              disabled={updating}
              className="flex-1 flex items-center justify-center gap-2 border border-[#E2B6AF] text-[#B5453D] hover:bg-[#F6DEDA]/30 py-3.5 rounded-xl text-sm font-semibold transition duration-200 disabled:opacity-50 focus-ring"
            >
              <FaCircleXmark className="text-xs" />
              Tolak Permintaan
            </button>
            <button
              onClick={() => handleUpdateStatus("accepted")}
              disabled={updating}
              className="flex-1 flex items-center justify-center gap-2 bg-[#2F5D50] hover:bg-[#24463C] text-white py-3.5 rounded-xl text-sm font-semibold transition duration-200 disabled:opacity-50 shadow-sm focus-ring"
            >
              <FaCircleCheck className="text-xs" />
              {updating ? "Memproses..." : "Terima & Setujui"}
            </button>
          </div>
        ) : (
          <div
            className={`rounded-xl py-3 px-4 text-center text-sm font-medium ${
              STATUS_STYLE[booking.booking_status]
            }`}
          >
            Permintaan berkas sewa ini sudah{" "}
            {STATUS_LABEL[booking.booking_status]?.toLowerCase()}.
          </div>
        )}
      </div>
    </main>
  );
}
