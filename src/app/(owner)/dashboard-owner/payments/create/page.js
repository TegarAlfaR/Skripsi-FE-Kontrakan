"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { createRentOwner } from "@/services/rent";
import { getUnitOwner } from "@/services/unit"; // sesuaikan nama fungsi kalau beda
import { FaArrowLeft } from "react-icons/fa6";

export default function CreateManualRentPage() {
  const router = useRouter();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    unit_id: "",
    tenant_name: "",
    hometown: "",
    birth_place_date: "",
    gender: "",
    phone_number: "",
    start_date: "",
  });

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await getUnitOwner();
        setUnits(res.data || []);
      } catch (err) {
        toast.error("Gagal memuat daftar unit");
      }
    };
    fetchUnits();
  }, []);

  const handleChange = (key) => (e) =>
    setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRentOwner({ ...form, source_rent: "manual" });
      toast.success("Data sewa berhasil disimpan");
      router.push("/dashboard-owner/payments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan data sewa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F4EE] p-6 font-body">
      <div className="max-w-md mx-auto">
        <Link
          href="/dashboard-owner/payments"
          className="mb-6 flex items-center gap-2 text-sm text-[#8C8578] hover:text-[#1F2723] transition"
        >
          <FaArrowLeft /> Kembali ke Daftar
        </Link>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-3xl border border-[#E4E0D6] shadow-sm space-y-4"
        >
          <h2 className="font-display text-2xl font-semibold text-[#1F2723] mb-2">
            Tambah Sewa Manual
          </h2>
          <p className="text-xs text-[#8C8578] mb-4">
            Untuk penyewa yang menyewa langsung ke pemilik, tanpa lewat booking
            website.
          </p>

          <div>
            <label className="block text-xs font-medium text-[#6B6459] mb-1">
              Unit
            </label>
            <select
              required
              value={form.unit_id}
              onChange={handleChange("unit_id")}
              className="w-full border border-[#D8D3C6] p-3 rounded-xl text-sm"
            >
              <option value="">Pilih unit...</option>
              {units.map((u) => (
                <option key={u.unit_id} value={u.unit_id}>
                  {u.unit_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6459] mb-1">
              Nama Penyewa
            </label>
            <input
              required
              value={form.tenant_name}
              onChange={handleChange("tenant_name")}
              className="w-full border border-[#D8D3C6] p-3 rounded-xl text-sm"
              placeholder="Nama lengkap penyewa..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6459] mb-1">
              Asal Daerah
            </label>
            <input
              required
              value={form.hometown}
              onChange={handleChange("hometown")}
              className="w-full border border-[#D8D3C6] p-3 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6459] mb-1">
              Tempat, Tanggal Lahir
            </label>
            <input
              required
              value={form.birth_place_date}
              onChange={handleChange("birth_place_date")}
              className="w-full border border-[#D8D3C6] p-3 rounded-xl text-sm"
              placeholder="Contoh: Pekanbaru, 12 Januari 2000"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6459] mb-1">
              Jenis Kelamin
            </label>
            <select
              required
              value={form.gender}
              onChange={handleChange("gender")}
              className="w-full border border-[#D8D3C6] p-3 rounded-xl text-sm"
            >
              <option value="">Pilih...</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6459] mb-1">
              Nomor HP
            </label>
            <input
              value={form.phone_number}
              onChange={handleChange("phone_number")}
              className="w-full border border-[#D8D3C6] p-3 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B6459] mb-1">
              Tanggal Mulai Sewa
            </label>
            <input
              required
              type="date"
              value={form.start_date}
              onChange={handleChange("start_date")}
              className="w-full border border-[#D8D3C6] p-3 rounded-xl text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-[#2F5D50] hover:bg-[#24463C] text-white py-3.5 rounded-xl font-semibold transition shadow-md disabled:bg-[#D8D3C6]"
          >
            {loading ? "Menyimpan..." : "Simpan Data Sewa"}
          </button>
        </form>
      </div>
    </main>
  );
}
