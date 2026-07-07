"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { getAllUsers, updateUserStatus } from "@/services/user";
import {
  FaArrowLeft,
  FaUsers,
  FaUserShield,
  FaBan,
  FaCheck,
  FaUserLock,
  FaUserTag,
} from "react-icons/fa6";

// ─── Design Tokens ────────────────────────────────────────────────────────────
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

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_LABEL = {
  admin: "Administrator",
  owner: "Pemilik (Owner)",
  tenant: "Penyewa (Tenant)",
};

const TABS = [
  { key: "all", label: "Semua Akun" },
  { key: "owner", label: "Pemilik Kontrakan" },
  { key: "tenant", label: "Penyewa" },
  { key: "blocked", label: "Diblokir" },
];

export default function DashboardAdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [adminName, setAdminName] = useState("");
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    // Ambil nama admin yang sedang login dari cookie
    const rawPayload = Cookies.get("payload");
    if (rawPayload) {
      try {
        const payload = JSON.parse(rawPayload);
        setAdminName(payload.name);
        setAdminId(payload.id);
      } catch (e) {}
    }

    const fetchUsers = async () => {
      try {
        const res = await getAllUsers();
        // Asumsi API mengembalikan { data: [...] }
        setUsers(res.data || []);
      } catch (err) {
        toast.error("Gagal memuat data pengguna sistem.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    // Mencegah admin memblokir dirinya sendiri secara tidak sengaja
    if (user.user_id === adminId) {
      return toast.error("Anda tidak bisa mengubah status akun Anda sendiri!");
    }

    const newStatus = user.status === "active" ? "blocked" : "active";
    const actionText = newStatus === "blocked" ? "memblokir" : "mengaktifkan";

    if (!confirm(`Apakah Anda yakin ingin ${actionText} akun ${user.name}?`))
      return;

    setProcessingId(user.user_id);
    const loadingToast = toast.loading("Memproses perubahan status...");

    try {
      await updateUserStatus(user.user_id, newStatus);

      // Update state lokal tanpa perlu refresh halaman
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === user.user_id ? { ...u, status: newStatus } : u
        )
      );

      toast.success(
        `Akun ${user.name} berhasil di-${
          newStatus === "blocked" ? "blokir" : "aktifkan"
        }.`,
        { id: loadingToast }
      );
    } catch (err) {
      toast.error(`Gagal ${actionText} akun.`, { id: loadingToast });
    } finally {
      setProcessingId(null);
    }
  };

  // ─── Filter & Statistik ───
  const filteredUsers = users.filter((u) => {
    if (activeTab === "all") return true;
    if (activeTab === "blocked") return u.status === "blocked";
    return u.role === activeTab;
  });

  const totalUsers = users.length;
  const totalOwners = users.filter((u) => u.role === "owner").length;
  const totalTenants = users.filter((u) => u.role === "tenant").length;
  const totalBlocked = users.filter((u) => u.status === "blocked").length;

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="bg-[#F6F4EE] min-h-screen pb-16 font-body">
      <DesignTokens />

      {/* ── HEADER ADMIN ── */}
      <div className="bg-[#1F2723]">
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#B8B2A3] hover:text-white font-medium transition mb-8 focus-ring rounded"
          >
            <FaArrowLeft /> Kembali ke Beranda
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest font-mono-num text-[#8C8578] mb-1">
                {today}
              </p>
              <h1 className="font-display text-3xl text-white font-semibold">
                Control Panel Admin
              </h1>
              <p className="text-[#8C8578] text-sm mt-1.5">
                Selamat bekerja, {adminName || "Admin"}. Kelola akses seluruh
                pengguna sistem di sini.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#2F5D50]/20 border border-[#2F5D50]/40 px-4 py-2 rounded-xl">
              <FaUserShield className="text-[#B98A3D] text-lg" />
              <span className="text-[#F5E7CC] text-sm font-semibold tracking-wide">
                SYSTEM ADMINISTRATOR
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-6 space-y-6">
        {/* ── STATISTIK MANIFEST ── */}
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm flex flex-wrap divide-y sm:divide-y-0 sm:divide-x divide-[#E4E0D6] overflow-hidden">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 min-w-[200px] p-5 animate-pulse">
                <div className="h-3 w-16 bg-[#EFEBE1] rounded mb-3" />
                <div className="h-8 w-12 bg-[#EFEBE1] rounded" />
              </div>
            ))
          ) : (
            <>
              <div className="flex-1 min-w-[150px] p-5 hover:bg-[#F6F4EE]/30 transition">
                <p className="text-[11px] uppercase tracking-wider text-[#8C8578] font-medium flex items-center gap-1.5">
                  <FaUsers className="text-[#2F5D50]" /> Total Akun
                </p>
                <p className="mt-1.5 text-3xl font-display font-semibold text-[#1F2723]">
                  {totalUsers}
                </p>
              </div>
              <div className="flex-1 min-w-[150px] p-5 hover:bg-[#F6F4EE]/30 transition">
                <p className="text-[11px] uppercase tracking-wider text-[#8C8578] font-medium flex items-center gap-1.5">
                  <FaUserTag className="text-[#B98A3D]" /> Total Pemilik
                </p>
                <p className="mt-1.5 text-3xl font-display font-semibold text-[#1F2723]">
                  {totalOwners}
                </p>
              </div>
              <div className="flex-1 min-w-[150px] p-5 hover:bg-[#F6F4EE]/30 transition">
                <p className="text-[11px] uppercase tracking-wider text-[#8C8578] font-medium flex items-center gap-1.5">
                  <FaUsers className="text-[#B98A3D]" /> Total Penyewa
                </p>
                <p className="mt-1.5 text-3xl font-display font-semibold text-[#1F2723]">
                  {totalTenants}
                </p>
              </div>
              <div className="flex-1 min-w-[150px] p-5 hover:bg-[#F6DEDA]/30 transition">
                <p className="text-[11px] uppercase tracking-wider text-[#B5453D] font-medium flex items-center gap-1.5">
                  <FaBan /> Akun Diblokir
                </p>
                <p className="mt-1.5 text-3xl font-display font-semibold text-[#B5453D]">
                  {totalBlocked}
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── FILTER TABS ── */}
        <div className="flex gap-2 flex-wrap pt-4">
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
              </button>
            );
          })}
        </div>

        {/* ── TABEL / LIST PENGGUNA ── */}
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm overflow-hidden">
          {loading ? (
            <div className="divide-y divide-[#E4E0D6]">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-5 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#EFEBE1]" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-[#EFEBE1] rounded" />
                      <div className="h-3 w-48 bg-[#EFEBE1] rounded" />
                    </div>
                  </div>
                  <div className="h-9 w-24 bg-[#EFEBE1] rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-16 text-center">
              <FaUserLock className="text-5xl text-[#D8D3C6] mx-auto" />
              <p className="mt-4 text-[#8C8578] text-sm">
                Tidak ada pengguna yang ditemukan dalam kategori ini.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E4E0D6]">
              {filteredUsers.map((u) => {
                const isActive = u.status === "active";
                const isSelf = u.user_id === adminId;

                return (
                  <div
                    key={u.user_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 hover:bg-[#F6F4EE]/40 transition"
                  >
                    {/* Profil Kiri */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                          isActive
                            ? "bg-[#1F2723] border-[#2F5D50]"
                            : "bg-[#F6DEDA] border-[#E2B6AF]"
                        }`}
                      >
                        <span
                          className={`font-display font-semibold text-lg ${
                            isActive ? "text-[#B98A3D]" : "text-[#B5453D]"
                          }`}
                        >
                          {u.name?.[0]?.toUpperCase() ?? "?"}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-semibold text-base truncate ${
                              isActive
                                ? "text-[#1F2723]"
                                : "text-[#B5453D] line-through decoration-[#B5453D]/50"
                            }`}
                          >
                            {u.name}
                          </p>
                          {isSelf && (
                            <span className="text-[9px] bg-[#B98A3D] text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#8C8578] font-mono-num truncate">
                          {u.email}
                        </p>
                        <p className="text-[10px] text-[#6B6459] font-medium uppercase tracking-wider mt-1 bg-[#F6F4EE] inline-block px-2 py-0.5 rounded border border-[#D8D3C6]">
                          {ROLE_LABEL[u.role] || u.role}
                        </p>
                      </div>
                    </div>

                    {/* Aksi Kanan */}
                    <div className="flex items-center justify-end sm:shrink-0 mt-2 sm:mt-0">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={processingId === u.user_id || isSelf}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition duration-200 focus-ring shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                          isActive
                            ? "bg-white border border-[#E2B6AF] text-[#B5453D] hover:bg-[#F6DEDA]/50"
                            : "bg-[#2F5D50] border border-[#2F5D50] text-white hover:bg-[#24463C]"
                        }`}
                      >
                        {processingId === u.user_id ? (
                          "Memproses..."
                        ) : isActive ? (
                          <>
                            <FaBan /> Blokir Akses
                          </>
                        ) : (
                          <>
                            <FaCheck /> Pulihkan Akun
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
