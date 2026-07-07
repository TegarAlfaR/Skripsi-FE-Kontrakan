"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  getTenantBookingById,
  deleteTenantBooking,
  updateTenantBooking,
} from "@/services/booking";
import {
  FaArrowLeft,
  FaCalendarDays,
  FaHouse,
  FaLocationDot,
  FaUser,
  FaCircleXmark,
  FaPenToSquare,
  FaCheck,
  FaXmark,
  FaCakeCandles,
  FaVenusMars,
} from "react-icons/fa6";

const STATUS_STYLE = {
  pending: "bg-[#F5E7CC] text-[#8A6416] border border-[#E9D5B3]",
  accepted: "bg-[#E1ECE5] text-[#2F5D50] border border-[#C6DEC0]",
  rejected: "bg-[#F6DEDA] text-[#B5453D] border border-[#E2B6AF]",
};

const STATUS_LABEL = {
  pending: "Menunggu Konfirmasi Pemilik",
  accepted: "Sewa Disetujui",
  rejected: "Sewa Ditolak",
};

const formatDate = (str) =>
  new Date(str).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// Helper untuk memotong format tanggal ISO dari DB agar cocok dengan <input type="date">
const formatDateForInput = (str) => {
  if (!str) return "";
  try {
    return new Date(str).toISOString().split("T")[0];
  } catch (error) {
    return "";
  }
};

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
      .focus-ring:focus-visible,
      .focus-ring-input:focus {
        outline: 2px solid #b98a3d;
        outline-offset: 2px;
      }
    `}</style>
  );
}

const inputCls =
  "w-full rounded-xl border border-[#D8D3C6] bg-white pl-10 px-4 py-2.5 text-sm text-[#1F2723] focus:border-[#2F5D50] outline-none transition duration-200 focus-ring-input placeholder-[#8C8578]/60";
const selectCls =
  "w-full rounded-xl border border-[#D8D3C6] bg-white pl-10 px-4 py-2.5 text-sm text-[#1F2723] focus:border-[#2F5D50] outline-none transition duration-200 focus-ring-input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%238C8578%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%2011%201.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat";

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F6F4EE] last:border-0">
      <div className="flex items-center gap-3 text-[#6B6459] text-sm">
        <span className="text-[#B98A3D] text-xs">{icon}</span>
        {label}
      </div>
      <span className="font-semibold text-[#1F2723] text-sm text-right max-w-[55%] truncate">
        {value ?? "-"}
      </span>
    </div>
  );
}

export default function TenantBookingDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // States untuk Fitur Edit
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    tenant_name: "",
    hometown: "",
    birth_place_date: "",
    gender: "Laki-laki",
    move_in_date: "",
    booking_date: "",
  });

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        const result = await getTenantBookingById(id);
        const data = result.data;
        setBooking(data);

        // Inisialisasi data form edit dengan data dari backend
        setEditForm({
          tenant_name: data.tenant_name || "",
          hometown: data.hometown || "",
          birth_place_date: data.birth_place_date || "",
          gender: data.gender || "Laki-laki",
          move_in_date: formatDateForInput(data.move_in_date), // <-- Tanggal masuk diformat khusus agar muncul
          booking_date: data.booking_date || "",
        });
      } catch (err) {
        toast.error("Gagal memuat detail booking");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateTenantBooking(id, editForm);
      setBooking(res.data);
      setIsEditing(false);
      toast.success("Pengajuan sewa berhasil diperbarui!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pengajuan sewa ini?"))
      return;

    setDeleting(true);
    try {
      await deleteTenantBooking(id);
      toast.success("Pengajuan sewa berhasil dibatalkan.");
      router.push("/booking-history");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membatalkan pengajuan");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Kembalikan form ke state semula jika batal edit
    setEditForm({
      tenant_name: booking.tenant_name,
      hometown: booking.hometown,
      birth_place_date: booking.birth_place_date,
      gender: booking.gender,
      move_in_date: formatDateForInput(booking.move_in_date), // <-- Kembalikan pakai helper
      booking_date: booking.booking_date,
    });
  };

  if (loading) {
    return (
      <main className="bg-[#F6F4EE] min-h-screen p-8 font-body">
        <DesignTokens />
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl border border-[#E4E0D6] animate-pulse h-64" />
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F6F4EE] font-body">
        <DesignTokens />
        <p className="text-[#8C8578] text-sm">Booking tidak ditemukan.</p>
        <Link href="/booking-history">
          <button className="flex items-center gap-2 bg-[#2F5D50] text-white px-5 py-2.5 rounded-xl hover:bg-[#24463C] transition text-sm font-medium focus-ring">
            <FaArrowLeft className="text-xs" /> Kembali
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

      <div className="bg-[#1F2723]">
        <div className="max-w-2xl mx-auto px-6 pt-6 pb-12">
          <Link
            href="/booking-history"
            className="inline-flex items-center gap-2 text-sm text-[#B8B2A3] hover:text-white font-medium transition mb-8 focus-ring rounded"
          >
            <FaArrowLeft /> Kembali ke Daftar
          </Link>

          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-mono-num text-[#8C8578]">
                ID Booking #{booking.booking_id}
              </p>
              <h1 className="font-display text-3xl text-white font-semibold mt-1">
                Detail Sewa
              </h1>
            </div>
            <div
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm ${
                STATUS_STYLE[booking.booking_status]
              }`}
            >
              {STATUS_LABEL[booking.booking_status]}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-6 space-y-6">
        {/* Info Kontrakan */}
        {u && (
          <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm overflow-hidden p-3 flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-[#E4E0D6]">
              <Image
                src={u.unit_photo[0]}
                alt={u.unit_name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="pr-4">
              <h2 className="font-display font-semibold text-[#1F2723] text-lg leading-tight">
                {u.unit_name}
              </h2>
              <Link
                href={`/units/${u.unit_id}`}
                className="text-[#2F5D50] text-xs font-medium hover:underline mt-1 inline-block"
              >
                Lihat Halaman Kontrakan →
              </Link>
            </div>
          </div>
        )}

        {/* Info Pengajuan / Form Edit */}
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-[#F6F4EE]/40 border-b border-[#E4E0D6] flex justify-between items-center">
            <h2 className="font-display font-semibold text-base text-[#1F2723] flex items-center gap-2">
              <FaCalendarDays className="text-[#B98A3D] text-sm" />
              Manifes Booking
            </h2>
            {isPending && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs text-[#2F5D50] hover:text-[#1F2723] font-semibold transition flex items-center gap-1.5 focus-ring px-2 py-1 rounded"
              >
                <FaPenToSquare /> Edit Data
              </button>
            )}
          </div>

          <div className="p-6">
            {isEditing ? (
              <form
                onSubmit={handleUpdate}
                className="space-y-4 animate-[fadeIn_0.2s_ease-out]"
              >
                <div>
                  <label className="block text-xs font-medium text-[#6B6459] mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-3.5 text-[#8C8578] text-xs" />
                    <input
                      type="text"
                      name="tenant_name"
                      value={editForm.tenant_name}
                      onChange={handleChange}
                      className={inputCls}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6B6459] mb-1">
                      Asal Daerah
                    </label>
                    <div className="relative">
                      <FaLocationDot className="absolute left-4 top-3.5 text-[#8C8578] text-xs" />
                      <input
                        type="text"
                        name="hometown"
                        value={editForm.hometown}
                        onChange={handleChange}
                        className={inputCls}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B6459] mb-1">
                      Jenis Kelamin
                    </label>
                    <div className="relative">
                      <FaVenusMars className="absolute left-4 top-3.5 text-[#8C8578] text-xs z-10" />
                      <select
                        name="gender"
                        value={editForm.gender}
                        onChange={handleChange}
                        className={selectCls}
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6B6459] mb-1">
                    Tempat & Tanggal Lahir
                  </label>
                  <div className="relative">
                    <FaCakeCandles className="absolute left-4 top-3.5 text-[#8C8578] text-xs" />
                    <input
                      type="text"
                      name="birth_place_date"
                      value={editForm.birth_place_date}
                      onChange={handleChange}
                      className={inputCls}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6B6459] mb-1">
                    Rencana Menempati
                  </label>
                  <div className="relative">
                    <FaHouse className="absolute left-4 top-3.5 text-[#8C8578] text-xs" />
                    {/* Nilai tanggal sekarang sudah masuk ke dalam input */}
                    <input
                      type="date"
                      name="move_in_date"
                      value={editForm.move_in_date}
                      onChange={handleChange}
                      className={`${inputCls} font-mono-num`}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-[#F6F4EE] mt-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex items-center gap-1.5 border border-[#D8D3C6] text-[#4A4640] hover:bg-[#F6F4EE]/50 px-4 py-2 rounded-xl text-xs font-medium transition focus-ring"
                  >
                    <FaXmark /> Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-[#2F5D50] hover:bg-[#24463C] text-white px-4 py-2 rounded-xl text-xs font-semibold transition focus-ring shadow-sm disabled:bg-[#D8D3C6]"
                  >
                    <FaCheck /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="divide-y divide-[#F6F4EE]">
                <InfoRow
                  icon={<FaUser />}
                  label="Nama Pengaju"
                  value={booking.tenant_name}
                />
                <InfoRow
                  icon={<FaLocationDot />}
                  label="Asal Daerah"
                  value={booking.hometown}
                />
                <InfoRow
                  icon={<FaVenusMars />}
                  label="Jenis Kelamin"
                  value={booking.gender}
                />
                <InfoRow
                  icon={<FaCakeCandles />}
                  label="Tanggal Lahir"
                  value={booking.birth_place_date}
                />
                <InfoRow
                  icon={<FaCalendarDays />}
                  label="Tanggal Pengajuan"
                  value={formatDate(booking.booking_date)}
                />
                <InfoRow
                  icon={<FaHouse />}
                  label="Rencana Menempati"
                  value={formatDate(booking.move_in_date)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Tombol Batalkan - Sembunyikan saat mode edit aktif */}
        {isPending && !isEditing && (
          <div className="bg-[#F6DEDA]/30 border border-[#E2B6AF] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-[#B5453D] font-semibold text-sm">
                Batalkan Pengajuan?
              </h3>
              <p className="text-xs text-[#B5453D]/80 mt-1">
                Pengajuan ini belum diproses oleh pemilik dan masih bisa
                dibatalkan secara permanen.
              </p>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-[#E2B6AF] hover:bg-[#B5453D] hover:text-white text-[#B5453D] px-5 py-2.5 rounded-xl text-sm font-medium transition duration-200 focus-ring shrink-0"
            >
              <FaCircleXmark />{" "}
              {deleting ? "Membatalkan..." : "Batalkan Booking"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
