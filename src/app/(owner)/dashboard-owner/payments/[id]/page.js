"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  getPaymentById,
  updatePayment,
  deletePayment,
} from "@/services/payment";
import {
  FaArrowLeft,
  FaTrash,
  FaPenToSquare,
  FaUser,
  FaRupiahSign,
  FaCalendarDays,
  FaNoteSticky,
  FaCircleNotch,
  FaCamera,
} from "react-icons/fa6";

export default function DetailPaymentPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [payment, setPayment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    tenant_name: "",
    amount: "",
    payment_date: "",
    notes: "",
  });
  const [newPhoto, setNewPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPaymentById(id);
      setPayment(res.data);
      setForm({
        tenant_name: res.data.tenant_name,
        amount: res.data.amount,
        payment_date: new Date(res.data.payment_date)
          .toISOString()
          .split("T")[0],
        notes: res.data.notes || "",
      });
    } catch (err) {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("tenant_name", form.tenant_name);
    formData.append("amount", form.amount);
    formData.append("payment_date", form.payment_date);
    formData.append("notes", form.notes);
    if (newPhoto) formData.append("payment_photo", newPhoto);

    try {
      await updatePayment(id, formData);
      await fetchData();
      setNewPhoto(null);
      toast.success("Berhasil diperbarui");
      setIsEditing(false);
    } catch (err) {
      toast.error("Gagal memperbarui");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading)
    return (
      <main className="min-h-screen bg-[#F6F4EE] flex items-center justify-center">
        Memuat...
      </main>
    );

  return (
    <main className="min-h-screen bg-[#F6F4EE] p-6 font-body relative">
      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-[#F6F4EE]/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <FaCircleNotch className="text-[#2F5D50] text-4xl animate-spin mb-3" />
          <p className="text-[#1F2723] font-medium">Menyimpan perubahan...</p>
        </div>
      )}

      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm text-[#8C8578] hover:text-[#1F2723] transition"
        >
          <FaArrowLeft /> Kembali
        </button>

        <div className="bg-white p-8 rounded-3xl border border-[#E4E0D6] shadow-sm">
          {isEditing ? (
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-semibold mb-6">
                Edit Catatan
              </h2>
              <input
                value={form.tenant_name}
                onChange={(e) =>
                  setForm({ ...form, tenant_name: e.target.value })
                }
                className="w-full border border-[#D8D3C6] p-3 rounded-xl"
                placeholder="Nama Penyewa"
              />
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-[#D8D3C6] p-3 rounded-xl"
                placeholder="Jumlah"
              />
              <input
                type="date"
                value={form.payment_date}
                onChange={(e) =>
                  setForm({ ...form, payment_date: e.target.value })
                }
                className="w-full border border-[#D8D3C6] p-3 rounded-xl"
              />
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-[#D8D3C6] p-3 rounded-xl"
                placeholder="Catatan"
              />

              <div className="pt-2">
                <label className="text-xs text-[#6B6459]">
                  Ganti Foto Bukti:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewPhoto(e.target.files[0])}
                  className="w-full mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#E1ECE5] file:text-[#2F5D50]"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 border py-3 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-[#2F5D50] text-white py-3 rounded-xl font-semibold"
                >
                  Simpan
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-[#E1ECE5] text-[#2F5D50] flex items-center justify-center overflow-hidden">
                  {payment.payment_photo ? (
                    <img
                      src={payment.payment_photo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-2xl" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-display font-semibold">
                    {payment.tenant_name}
                  </h2>
                  <p className="text-sm text-[#8C8578]">
                    Riwayat Pencatatan Manual
                  </p>
                </div>
              </div>

              {/* Tampilan Bukti Foto */}
              {payment.payment_photo && (
                <div className="mb-6">
                  <p className="text-[11px] text-[#8C8578] uppercase mb-2">
                    Foto Bukti
                  </p>
                  <img
                    src={payment.payment_photo}
                    alt="Bukti Bayar"
                    className="w-full rounded-2xl border shadow-sm"
                  />
                </div>
              )}

              <div className="space-y-5 text-sm">
                <div className="flex gap-4 p-4 bg-[#F6F4EE] rounded-xl">
                  <FaRupiahSign className="text-[#B98A3D] text-lg" />
                  <div>
                    <p className="text-[11px] text-[#8C8578] uppercase">
                      Jumlah
                    </p>
                    <p className="font-semibold text-[#1F2723]">
                      Rp {new Intl.NumberFormat("id-ID").format(payment.amount)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-[#F6F4EE] rounded-xl">
                  <FaCalendarDays className="text-[#B98A3D] text-lg" />
                  <div>
                    <p className="text-[11px] text-[#8C8578] uppercase">
                      Tanggal
                    </p>
                    <p className="font-semibold text-[#1F2723]">
                      {new Date(payment.payment_date).toLocaleDateString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-10">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 border py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <FaPenToSquare /> Edit
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Hapus?")) {
                      setIsProcessing(true);
                      await deletePayment(id);
                      router.push("/dashboard-owner/payments");
                    }
                  }}
                  className="flex-1 bg-[#B5453D] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <FaTrash /> Hapus
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
