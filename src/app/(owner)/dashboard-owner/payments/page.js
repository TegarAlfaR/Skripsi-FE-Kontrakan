"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaPlus,
  FaCalendarDays,
  FaChevronRight,
  FaGlobe,
  FaUserPen,
  FaCircleNotch,
} from "react-icons/fa6";
import { getAllRentOwner } from "@/services/rent";
import { getPayment } from "@/services/payment";

function DesignTokens() {
  return (
    <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap");
      .font-display {
        font-family: "Fraunces", serif;
      }
      .font-mono-num {
        font-family: "IBM Plex Mono", monospace;
      }
      .font-body {
        font-family: "Inter", sans-serif;
      }
    `}</style>
  );
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function RentCard({ r, paid }) {
  return (
    <Link
      href={`/dashboard-owner/payments/${r.rent_id}`}
      className="group block p-4 sm:p-5 hover:bg-[#F6F4EE]/50 transition"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-[#E1ECE5] text-[#2F5D50] flex items-center justify-center">
            {r.source_rent === "website" ? <FaGlobe /> : <FaUserPen />}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-[#1F2723] text-sm sm:text-base truncate">
              {r.tenant_name}
            </h3>
            <p className="text-xs text-[#8C8578] flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5">
              <FaCalendarDays className="shrink-0" /> Masuk{" "}
              {formatDate(r.start_date)}
              {r.end_date ? ` · Keluar ${formatDate(r.end_date)}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-12 sm:pl-0">
          <span className="font-mono-num font-semibold text-[#1F2723] text-sm sm:text-base">
            Rp {new Intl.NumberFormat("id-ID").format(paid)}
          </span>
          <FaChevronRight className="text-[#D8D3C6] group-hover:text-[#2F5D50] transition shrink-0" />
        </div>
      </div>
    </Link>
  );
}

export default function RentListPage() {
  const [rents, setRents] = useState([]);
  const [paymentsByRent, setPaymentsByRent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rentRes, paymentRes] = await Promise.all([
          getAllRentOwner(),
          getPayment(),
        ]);

        const rentList = rentRes.data || [];
        const paymentList = paymentRes.data || [];

        const grouped = {};
        for (const p of paymentList) {
          if (!grouped[p.rent_id]) grouped[p.rent_id] = 0;
          grouped[p.rent_id] += Number(p.amount);
        }

        setRents(rentList);
        setPaymentsByRent(grouped);
      } catch (err) {
        toast.error("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = Object.values(paymentsByRent).reduce(
    (sum, v) => sum + v,
    0
  );

  const active = rents.filter((r) => r.status_rent !== "ended");
  const ended = rents.filter((r) => r.status_rent === "ended");

  return (
    <main className="min-h-screen bg-[#F6F4EE] font-body pb-16">
      <DesignTokens />
      <div className="bg-[#1F2723] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-10 sm:pb-12">
          <Link
            href="/dashboard-owner"
            className="inline-flex items-center gap-2 text-sm text-[#B8B2A3] hover:text-white mb-6 sm:mb-8 transition"
          >
            <FaArrowLeft /> Kembali Ke Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-semibold">
                Pencatatan Sewa
              </h1>
              <p className="text-[#8C8578] text-sm mt-2">
                Data penyewa dan riwayat pembayarannya.
              </p>
            </div>
            <Link
              href="/dashboard-owner/payments/create"
              className="bg-[#B98A3D] hover:bg-[#A47A34] px-4 sm:px-5 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition shadow-sm w-full sm:w-auto"
            >
              <FaPlus /> Tambah Sewa Manual
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8">
        {/* Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-4 sm:p-5">
            <p className="text-[11px] uppercase tracking-wider text-[#8C8578] font-medium">
              Total Pemasukan
            </p>
            <p className="text-lg sm:text-xl font-mono-num font-semibold text-[#2F5D50] mt-1 wrap-break-word">
              Rp {new Intl.NumberFormat("id-ID").format(totalRevenue)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-4 sm:p-5">
            <p className="text-[11px] uppercase tracking-wider text-[#8C8578] font-medium">
              Masih Menyewa
            </p>
            <p className="text-lg sm:text-xl font-mono-num font-semibold text-[#2F5D50] mt-1">
              {active.length} Penyewa
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-4 sm:p-5">
            <p className="text-[11px] uppercase tracking-wider text-[#8C8578] font-medium">
              Sudah Keluar
            </p>
            <p className="text-lg sm:text-xl font-mono-num font-semibold text-[#B5453D] mt-1">
              {ended.length} Penyewa
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-8 sm:p-10 text-center text-[#8C8578] flex items-center justify-center gap-2">
            <FaCircleNotch className="animate-spin" /> Memuat...
          </div>
        ) : rents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-8 sm:p-12 text-center text-[#8C8578]">
            Belum ada data sewa.
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Sedang Ngontrak */}
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-2 h-2 rounded-full bg-[#2F5D50]"></span>
                <h2 className="text-xs sm:text-sm font-semibold text-[#1F2723] uppercase tracking-wide">
                  Masih Menyewa :
                </h2>
                <span className="text-sm sm:text-md font-bold text-[#2F5D50]">
                  ({active.length})
                </span>
              </div>
              <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm overflow-hidden">
                {active.length === 0 ? (
                  <p className="p-6 sm:p-8 text-center text-sm text-[#8C8578]">
                    Nggak ada penyewa yang lagi aktif.
                  </p>
                ) : (
                  <div className="divide-y divide-[#E4E0D6]">
                    {active.map((r) => (
                      <RentCard
                        key={r.rent_id}
                        r={r}
                        paid={paymentsByRent[r.rent_id] || 0}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sudah Keluar */}
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-2 h-2 rounded-full bg-[#B5453D]"></span>
                <h2 className="text-xs sm:text-sm font-semibold text-[#1F2723] uppercase tracking-wide">
                  Sudah Keluar :
                </h2>
                <span className="text-sm sm:text-md font-bold text-[#B5453D]">
                  ({ended.length})
                </span>
              </div>
              <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm overflow-hidden opacity-80">
                {ended.length === 0 ? (
                  <p className="p-6 sm:p-8 text-center text-sm text-[#8C8578]">
                    Belum ada penyewa yang keluar.
                  </p>
                ) : (
                  <div className="divide-y divide-[#E4E0D6]">
                    {ended.map((r) => (
                      <RentCard
                        key={r.rent_id}
                        r={r}
                        paid={paymentsByRent[r.rent_id] || 0}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
