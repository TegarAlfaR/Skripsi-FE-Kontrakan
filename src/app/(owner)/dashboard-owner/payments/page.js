"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaPlus,
  FaWallet,
  FaNoteSticky,
  FaCalendarDays,
  FaChevronRight,
  FaRupiahSign,
} from "react-icons/fa6";
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

export default function PaymentListPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPayment();
        setPayments(res.data || []);
      } catch (err) {
        toast.error("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <main className="min-h-screen bg-[#F6F4EE] font-body pb-16">
      <DesignTokens />
      <div className="bg-[#1F2723] text-white">
        <div className="max-w-4xl mx-auto px-6 pt-6 pb-12">
          <Link
            href="/dashboard-owner"
            className="inline-flex items-center gap-2 text-sm text-[#B8B2A3] hover:text-white mb-8 transition"
          >
            <FaArrowLeft /> Kembali Ke Dashboard
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-display font-semibold">
                Buku Pembayaran
              </h1>
              <p className="text-[#8C8578] text-sm mt-2">
                Rekapitulasi catatan keuangan manual.
              </p>
            </div>
            <Link
              href="/dashboard-owner/payments/create"
              className="bg-[#B98A3D] hover:bg-[#A47A34] px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-sm"
            >
              <FaPlus /> Tambah Catatan
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm p-6 mb-8 flex justify-between items-center">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#8C8578] font-medium">
              Total Pemasukan
            </p>
            <p className="text-3xl font-mono-num font-semibold text-[#2F5D50]">
              Rp {new Intl.NumberFormat("id-ID").format(totalRevenue)}
            </p>
          </div>
          <div className="bg-[#F6F4EE] px-4 py-2 rounded-xl text-sm font-medium text-[#4A4640]">
            {payments.length} Transaksi
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-[#8C8578]">Memuat...</div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center text-[#8C8578]">
              Belum ada catatan pembayaran.
            </div>
          ) : (
            <div className="divide-y divide-[#E4E0D6]">
              {payments.map((p) => (
                <Link
                  key={p.payment_id}
                  href={`/dashboard-owner/payments/${p.payment_id}`}
                  className="group block p-5 hover:bg-[#F6F4EE]/50 transition"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#E1ECE5] text-[#2F5D50] flex items-center justify-center relative">
                        <FaRupiahSign />
                        {p.payment_photo && (
                          <div
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#B98A3D] rounded-full border-2 border-white"
                            title="Ada bukti foto"
                          ></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1F2723] flex items-center gap-2">
                          {p.tenant_name}
                          {p.payment_photo && (
                            <span className="text-[10px] bg-[#E1ECE5] text-[#2F5D50] px-1.5 py-0.5 rounded uppercase">
                              Bukti
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-[#8C8578] flex items-center gap-2 mt-0.5">
                          <FaCalendarDays />{" "}
                          {new Date(p.payment_date).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "long", year: "numeric" }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono-num font-semibold text-[#1F2723]">
                        Rp {new Intl.NumberFormat("id-ID").format(p.amount)}
                      </span>
                      <FaChevronRight className="text-[#D8D3C6] group-hover:text-[#2F5D50] transition" />
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
