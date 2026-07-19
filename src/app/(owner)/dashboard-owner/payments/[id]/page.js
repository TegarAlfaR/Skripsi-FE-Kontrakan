"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  getRentByIdOwner,
  updateRentOwner,
  deleteRentOwner,
  endRentOwner,
} from "@/services/rent";
import {
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
} from "@/services/payment";
import {
  FaArrowLeft,
  FaTrash,
  FaPenToSquare,
  FaPlus,
  FaCalendarDays,
  FaRupiahSign,
  FaCircleNotch,
  FaXmark,
  FaTriangleExclamation,
  FaImage,
  FaChevronRight,
} from "react-icons/fa6";

function formatDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// ── Komponen modal konfirmasi, ditaro lokal di file ini biar ngga ada masalah import ──
function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Ya, Lanjutkan",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
  children,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              danger
                ? "bg-[#F3E4E2] text-[#B5453D]"
                : "bg-[#E1ECE5] text-[#2F5D50]"
            }`}
          >
            <FaTriangleExclamation />
          </div>
          <h3 className="font-display text-lg font-semibold text-[#1F2723]">
            {title}
          </h3>
        </div>

        {description && (
          <p className="text-sm text-[#6B6459] mb-4">{description}</p>
        )}

        {children}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border py-3 rounded-xl font-medium text-sm disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60 ${
              danger ? "bg-[#B5453D]" : "bg-[#2F5D50]"
            }`}
          >
            {loading && <FaCircleNotch className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal lightbox buat liat foto ukuran penuh ──
function ImageLightbox({ src, onClose }) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
      >
        <FaXmark />
      </button>
      <img
        src={src}
        alt="Bukti pembayaran"
        className="max-w-full max-h-full rounded-xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ── Modal detail pembayaran, nampilin foto bukti + info lengkap ──
function PaymentDetailModal({ payment, onClose, onEdit, onDelete }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 sm:p-6 pb-0">
          <h3 className="font-display text-lg sm:text-xl font-semibold text-[#1F2723]">
            Detail Pembayaran
          </h3>
          <button onClick={onClose}>
            <FaXmark className="text-[#8C8578]" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {payment.payment_photo ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="block w-full mb-5 rounded-2xl overflow-hidden border border-[#E4E0D6]"
            >
              <img
                src={payment.payment_photo}
                alt="Bukti pembayaran"
                className="w-full max-h-72 object-contain bg-[#F6F4EE]"
              />
            </button>
          ) : (
            <div className="mb-5 rounded-2xl border border-dashed border-[#D8D3C6] py-10 flex flex-col items-center justify-center gap-2 text-[#8C8578]">
              <FaImage className="text-2xl" />
              <p className="text-xs">Tidak ada foto bukti</p>
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[#8C8578]">Jumlah</span>
              <span className="font-mono-num font-semibold text-[#1F2723]">
                Rp {new Intl.NumberFormat("id-ID").format(payment.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8C8578]">Tanggal Bayar</span>
              <span className="font-medium text-[#1F2723]">
                {formatDate(payment.payment_date)}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[#8C8578]">Catatan</span>
              <span className="font-medium text-[#1F2723] text-right max-w-[60%]">
                {payment.notes || "-"}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onEdit(payment)}
              className="flex-1 border border-[#D8D3C6] py-2.5 rounded-xl font-semibold text-sm text-[#6B6459] flex items-center justify-center gap-2"
            >
              <FaPenToSquare /> Edit
            </button>
            <button
              onClick={() => onDelete(payment)}
              className="flex-1 bg-[#B5453D] text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            >
              <FaTrash /> Hapus
            </button>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox
          src={payment.payment_photo}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

export default function RentDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [rent, setRent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingTenant, setEditingTenant] = useState(false);
  const [tenantForm, setTenantForm] = useState({});
  const [savingTenant, setSavingTenant] = useState(false);

  const [paymentModal, setPaymentModal] = useState(null); // null | "create" | payment object
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_date: "",
    notes: "",
  });
  const [paymentPhoto, setPaymentPhoto] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const [savingPayment, setSavingPayment] = useState(false);

  const [viewingPayment, setViewingPayment] = useState(null);

  const [endRentModal, setEndRentModal] = useState(false);
  const [endDate, setEndDate] = useState(todayISO());
  const [endingRent, setEndingRent] = useState(false);

  const [deleteRentModal, setDeleteRentModal] = useState(false);
  const [deletingRent, setDeletingRent] = useState(false);

  const [deletePaymentTarget, setDeletePaymentTarget] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rentRes, paymentRes] = await Promise.all([
        getRentByIdOwner(id),
        getPayment(id),
      ]);
      setRent(rentRes.data);
      setTenantForm(rentRes.data);
      setPayments(paymentRes.data || []);
    } catch (err) {
      toast.error("Gagal memuat data sewa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const totalPembayaran = payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  const handleUpdateTenant = async () => {
    setSavingTenant(true);
    try {
      await updateRentOwner(id, {
        tenant_name: tenantForm.tenant_name,
        hometown: tenantForm.hometown,
        birth_place_date: tenantForm.birth_place_date,
        gender: tenantForm.gender,
        phone_number: tenantForm.phone_number,
        start_date: tenantForm.start_date,
      });
      toast.success("Data penyewa diperbarui");
      setEditingTenant(false);
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memperbarui data");
    } finally {
      setSavingTenant(false);
    }
  };

  const handleEndRent = async () => {
    setEndingRent(true);
    try {
      await endRentOwner(id, { end_date: endDate });
      toast.success("Sewa diakhiri");
      setEndRentModal(false);
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengakhiri sewa");
    } finally {
      setEndingRent(false);
    }
  };

  const handleDeleteRent = async () => {
    setDeletingRent(true);
    try {
      await deleteRentOwner(id);
      toast.success("Data sewa dihapus");
      router.push("/dashboard-owner/payments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus data sewa");
      setDeletingRent(false);
    }
  };

  const openCreatePayment = () => {
    setPaymentForm({ amount: "", payment_date: "", notes: "" });
    setPaymentPhoto(null);
    setExistingPhoto(null);
    setPaymentModal("create");
  };

  const openEditPayment = (p) => {
    setPaymentForm({
      amount: p.amount,
      payment_date: new Date(p.payment_date).toISOString().split("T")[0],
      notes: p.notes || "",
    });
    setPaymentPhoto(null);
    setExistingPhoto(p.payment_photo || null);
    setPaymentModal(p);
    setViewingPayment(null);
  };

  const handleSavePayment = async () => {
    setSavingPayment(true);
    const formData = new FormData();
    formData.append("amount", paymentForm.amount);
    formData.append("payment_date", paymentForm.payment_date);
    formData.append("notes", paymentForm.notes);
    if (paymentPhoto) formData.append("payment_photo", paymentPhoto);

    try {
      if (paymentModal === "create") {
        formData.append("rent_id", id);
        await createPayment(formData);
        toast.success("Pembayaran ditambahkan");
      } else {
        await updatePayment(paymentModal.payment_id, formData);
        toast.success("Pembayaran diperbarui");
      }
      setPaymentModal(null);
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan pembayaran");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDeletePayment = async () => {
    setDeletingPayment(true);
    try {
      await deletePayment(deletePaymentTarget.payment_id);
      toast.success("Pembayaran dihapus");
      setDeletePaymentTarget(null);
      setViewingPayment(null);
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus pembayaran");
    } finally {
      setDeletingPayment(false);
    }
  };

  if (loading || !rent)
    return (
      <main className="min-h-screen bg-[#F6F4EE] flex items-center justify-center gap-2 text-[#8C8578]">
        <FaCircleNotch className="animate-spin" /> Memuat...
      </main>
    );

  const isEnded = rent.status_rent === "ended";

  return (
    <main className="min-h-screen bg-[#F6F4EE] p-4 sm:p-6 font-body">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.push("/dashboard-owner/payments")}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-sm text-[#8C8578] hover:text-[#1F2723] transition"
        >
          <FaArrowLeft /> Kembali
        </button>

        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-[#E4E0D6] shadow-sm mb-6">
          <div className="flex justify-between items-start gap-3 mb-6">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-[#1F2723] truncate">
                {rent.tenant_name}
              </h2>
              <span
                className={`inline-block mt-2 text-[10px] px-1.5 py-0.5 rounded uppercase ${
                  isEnded
                    ? "bg-[#F3E4E2] text-[#B5453D]"
                    : "bg-[#E1ECE5] text-[#2F5D50]"
                }`}
              >
                {isEnded ? "Sewa Berakhir" : "Sewa Aktif"} ·{" "}
                {rent.source_rent === "website" ? "Web" : "Manual"}
              </span>
            </div>
            <button
              onClick={() => setEditingTenant(!editingTenant)}
              disabled={savingTenant}
            >
              <FaPenToSquare className="text-[#8C8578] hover:text-[#2F5D50]" />
            </button>
          </div>

          {editingTenant ? (
            <div className="space-y-3">
              <input
                value={tenantForm.tenant_name || ""}
                onChange={(e) =>
                  setTenantForm({ ...tenantForm, tenant_name: e.target.value })
                }
                className="w-full border border-[#D8D3C6] p-3 rounded-xl text-sm"
                placeholder="Nama Penyewa"
              />
              <input
                value={tenantForm.hometown || ""}
                onChange={(e) =>
                  setTenantForm({ ...tenantForm, hometown: e.target.value })
                }
                className="w-full border border-[#D8D3C6] p-3 rounded-xl text-sm"
                placeholder="Asal Daerah"
              />
              <input
                value={tenantForm.birth_place_date || ""}
                onChange={(e) =>
                  setTenantForm({
                    ...tenantForm,
                    birth_place_date: e.target.value,
                  })
                }
                className="w-full border border-[#D8D3C6] p-3 rounded-xl text-sm"
                placeholder="Tempat, Tanggal Lahir"
              />
              <input
                value={tenantForm.phone_number || ""}
                onChange={(e) =>
                  setTenantForm({ ...tenantForm, phone_number: e.target.value })
                }
                className="w-full border border-[#D8D3C6] p-3 rounded-xl text-sm"
                placeholder="Nomor HP"
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingTenant(false)}
                  disabled={savingTenant}
                  className="flex-1 border py-2.5 rounded-xl font-medium text-sm disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateTenant}
                  disabled={savingTenant}
                  className="flex-1 bg-[#2F5D50] text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {savingTenant && <FaCircleNotch className="animate-spin" />}
                  Simpan
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 gap-y-3 text-sm">
              <div>
                <p className="text-[11px] text-[#8C8578] uppercase">Asal</p>
                <p className="font-medium text-[#1F2723]">
                  {rent.hometown || "-"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#8C8578] uppercase">No. HP</p>
                <p className="font-medium text-[#1F2723]">
                  {rent.phone_number || "-"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#8C8578] uppercase">
                  Tanggal Masuk
                </p>
                <p className="font-medium text-[#1F2723]">
                  {formatDate(rent.start_date)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#8C8578] uppercase">
                  Tanggal Keluar
                </p>
                <p className="font-medium text-[#1F2723]">
                  {rent.end_date
                    ? formatDate(rent.end_date)
                    : "Sedang Berlangsung"}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {!isEnded && (
              <button
                onClick={() => {
                  setEndDate(todayISO());
                  setEndRentModal(true);
                }}
                className="flex-1 border border-[#D8D3C6] py-2.5 rounded-xl font-semibold text-sm text-[#6B6459]"
              >
                Akhiri Sewa
              </button>
            )}
            <button
              onClick={() => setDeleteRentModal(true)}
              className="flex-1 bg-[#B5453D] text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            >
              <FaTrash /> Hapus Data Sewa
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#E4E0D6] shadow-sm p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
            <div>
              <h3 className="font-display text-lg sm:text-xl font-semibold text-[#1F2723]">
                Riwayat Pembayaran
              </h3>
              <p className="text-sm text-[#8C8578] mt-1">
                Total: Rp{" "}
                {new Intl.NumberFormat("id-ID").format(totalPembayaran)}
              </p>
            </div>
            <button
              onClick={openCreatePayment}
              className="bg-[#B98A3D] hover:bg-[#A47A34] px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <FaPlus /> Tambah
            </button>
          </div>

          {payments.length === 0 ? (
            <p className="text-center text-[#8C8578] py-8 text-sm">
              Belum ada pembayaran tercatat.
            </p>
          ) : (
            <div className="divide-y divide-[#E4E0D6]">
              {payments.map((p) => (
                <button
                  key={p.payment_id}
                  onClick={() => setViewingPayment(p)}
                  className="w-full py-4 flex justify-between items-center text-left hover:bg-[#F6F4EE]/50 transition rounded-xl px-2 -mx-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {p.payment_photo ? (
                      <img
                        src={p.payment_photo}
                        alt="Bukti pembayaran"
                        className="w-9 h-9 rounded-full object-cover border border-[#E4E0D6] shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#E1ECE5] text-[#2F5D50] flex items-center justify-center shrink-0">
                        <FaRupiahSign className="text-sm" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1F2723] text-sm font-mono-num">
                        Rp {new Intl.NumberFormat("id-ID").format(p.amount)}
                      </p>
                      <p className="text-xs text-[#8C8578] flex items-center gap-1.5 mt-0.5 truncate">
                        <FaCalendarDays className="shrink-0" />{" "}
                        {formatDate(p.payment_date)}
                        {p.notes ? ` · ${p.notes}` : ""}
                      </p>
                    </div>
                  </div>
                  <FaChevronRight className="text-[#D8D3C6] text-xs shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <PaymentDetailModal
        payment={viewingPayment}
        onClose={() => setViewingPayment(null)}
        onEdit={openEditPayment}
        onDelete={(p) => setDeletePaymentTarget(p)}
      />

      {paymentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-lg sm:text-xl font-semibold">
                {paymentModal === "create"
                  ? "Tambah Pembayaran"
                  : "Edit Pembayaran"}
              </h3>
              <button onClick={() => !savingPayment && setPaymentModal(null)}>
                <FaXmark className="text-[#8C8578]" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: e.target.value })
                }
                className="w-full border border-[#D8D3C6] p-3 rounded-xl text-sm"
                placeholder="Jumlah (Rp)"
              />
              <input
                type="date"
                value={paymentForm.payment_date}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    payment_date: e.target.value,
                  })
                }
                className="w-full border border-[#D8D3C6] p-3 rounded-xl text-sm"
              />
              <textarea
                value={paymentForm.notes}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, notes: e.target.value })
                }
                className="w-full border border-[#D8D3C6] p-3 rounded-xl text-sm"
                placeholder="Catatan (opsional)"
                rows={2}
              />
              <div>
                <label className="text-xs text-[#6B6459]">
                  Foto Bukti (opsional)
                </label>

                {existingPhoto && !paymentPhoto && (
                  <div className="mt-2 relative w-fit">
                    <img
                      src={existingPhoto}
                      alt="Foto bukti saat ini"
                      className="h-24 rounded-xl border border-[#E4E0D6] object-cover"
                    />
                    <p className="text-[11px] text-[#8C8578] mt-1">
                      Foto saat ini. Pilih file baru untuk menggantinya.
                    </p>
                  </div>
                )}

                {paymentPhoto && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(paymentPhoto)}
                      alt="Preview foto baru"
                      className="h-24 rounded-xl border border-[#E4E0D6] object-cover"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentPhoto(e.target.files[0])}
                  className="w-full mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#E1ECE5] file:text-[#2F5D50]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setPaymentModal(null)}
                disabled={savingPayment}
                className="flex-1 border py-3 rounded-xl font-medium text-sm disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSavePayment}
                disabled={savingPayment}
                className="flex-1 bg-[#2F5D50] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {savingPayment && <FaCircleNotch className="animate-spin" />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={endRentModal}
        title="Akhiri Sewa"
        description="Unit akan otomatis tersedia lagi buat penyewa baru setelah ini."
        confirmLabel="Akhiri Sewa"
        loading={endingRent}
        onConfirm={handleEndRent}
        onCancel={() => !endingRent && setEndRentModal(false)}
      >
        <label className="block text-xs font-medium text-[#6B6459] mb-1">
          Tanggal Berakhir
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border border-[#D8D3C6] p-3 rounded-xl text-sm"
        />
      </ConfirmModal>

      <ConfirmModal
        open={deleteRentModal}
        title="Hapus Data Sewa"
        description="Seluruh riwayat pembayaran penyewa ini juga akan ikut terhapus. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus"
        danger
        loading={deletingRent}
        onConfirm={handleDeleteRent}
        onCancel={() => !deletingRent && setDeleteRentModal(false)}
      />

      <ConfirmModal
        open={!!deletePaymentTarget}
        title="Hapus Pembayaran"
        description="Catatan pembayaran ini akan dihapus permanen."
        confirmLabel="Hapus"
        danger
        loading={deletingPayment}
        onConfirm={handleDeletePayment}
        onCancel={() => !deletingPayment && setDeletePaymentTarget(null)}
      />
    </main>
  );
}
