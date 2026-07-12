"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { createPayment } from "@/services/payment";
import {
  FaArrowLeft,
  FaUser,
  FaRupiahSign,
  FaCalendarDays,
  FaNoteSticky,
  FaCamera,
} from "react-icons/fa6";

function DesignTokens() {
  return (
    <style jsx global>{`
      .input-field {
        width: 100%;
        border-radius: 0.75rem;
        border: 1px solid #d8d3c6;
        padding: 0.75rem 1rem 0.75rem 2.75rem;
        font-size: 0.875rem;
        color: #1f2723;
        outline: none;
        transition: all 0.2s;
      }
      .input-field:focus {
        border-color: #2f5d50;
        box-shadow: 0 0 0 2px rgba(47, 93, 80, 0.15);
      }
    `}</style>
  );
}

export default function CreatePaymentPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    tenant_name: "",
    amount: "",
    payment_date: "",
    notes: "",
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("tenant_name", form.tenant_name);
    formData.append("amount", form.amount);
    formData.append("payment_date", form.payment_date);
    formData.append("notes", form.notes);
    if (photo) formData.append("payment_photo", photo);

    try {
      await createPayment(formData);
      toast.success("Catatan pembayaran berhasil disimpan");
      router.push("/dashboard-owner/payments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan catatan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F4EE] p-6 font-body">
      <DesignTokens />
      <div className="max-w-md mx-auto">
        <Link
          href="/dashboard-owner/payments"
          className="mb-6 flex items-center gap-2 text-sm text-[#8C8578] hover:text-[#1F2723] transition"
        >
          <FaArrowLeft /> Kembali ke Daftar
        </Link>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-3xl border border-[#E4E0D6] shadow-sm"
        >
          <h2 className="font-display text-2xl font-semibold text-[#1F2723] mb-6">
            Tambah Catatan
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6B6459] mb-1">
                Nama Penyewa
              </label>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-3.5 text-[#8C8578] text-sm" />
                <input
                  required
                  type="text"
                  onChange={(e) =>
                    setForm({ ...form, tenant_name: e.target.value })
                  }
                  className="input-field"
                  placeholder="Nama lengkap penyewa..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B6459] mb-1">
                Jumlah Pembayaran (Rp)
              </label>
              <div className="relative">
                <FaRupiahSign className="absolute left-3.5 top-3.5 text-[#8C8578] text-sm" />
                <input
                  required
                  type="number"
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B6459] mb-1">
                Tanggal Pembayaran
              </label>
              <div className="relative">
                <FaCalendarDays className="absolute left-3.5 top-3.5 text-[#8C8578] text-sm" />
                <input
                  required
                  type="date"
                  onChange={(e) =>
                    setForm({ ...form, payment_date: e.target.value })
                  }
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B6459] mb-1">
                Foto Bukti Bayar
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="w-full text-sm text-[#8C8578] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E1ECE5] file:text-[#2F5D50] hover:file:bg-[#d0e4d7] cursor-pointer"
              />
              <p className="text-[10px] text-[#8C8578] mt-1">
                *Gunakan kamera atau pilih dari galeri
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B6459] mb-1">
                Catatan (Opsional)
              </label>
              <div className="relative">
                <FaNoteSticky className="absolute left-3.5 top-3.5 text-[#8C8578] text-sm" />
                <textarea
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows="3"
                  className="input-field resize-none"
                  placeholder="Contoh: Pembayaran bulan Juli..."
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-[#2F5D50] hover:bg-[#24463C] text-white py-3.5 rounded-xl font-semibold transition shadow-md disabled:bg-[#D8D3C6]"
          >
            {loading ? "Menyimpan..." : "Simpan Catatan"}
          </button>
        </form>
      </div>
    </main>
  );
}
