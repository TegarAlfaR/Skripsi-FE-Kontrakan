"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { getAllUsers, updateUserStatus } from "@/services/user";
import { 
  FaArrowLeft, FaUsers, FaUserShield, FaBan, FaCheck, FaUserLock, FaUserTag, FaTriangleExclamation 
} from "react-icons/fa6";

// ─── Design Tokens ────────────────────────────────────────────────────────────
function DesignTokens() {
  return (
    <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap");
      .font-display { font-family: "Fraunces", serif; font-optical-sizing: auto; }
      .font-mono-num { font-family: "IBM Plex Mono", monospace; }
      .font-body { font-family: "Inter", sans-serif; }
      .focus-ring:focus-visible { outline: 2px solid #b98a3d; outline-offset: 2px; }
    `}</style>
  );
}

const ROLE_LABEL = { admin: "Administrator", owner: "Pemilik (Owner)", tenant: "Penyewa (Tenant)" };
const TABS = [
  { key: "all", label: "Semua Akun" },
  { key: "owner", label: "Pemilik" },
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
  const [modal, setModal] = useState({ isOpen: false, user: null });

  useEffect(() => {
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
        setUsers(res.data || []);
      } catch (err) {
        toast.error("Gagal memuat data pengguna.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const confirmAction = async () => {
    const user = modal.user;
    const newStatus = user.status === "active" ? "blocked" : "active";
    
    setProcessingId(user.user_id);
    const loadingToast = toast.loading("Memproses perubahan...");

    try {
      await updateUserStatus(user.user_id, newStatus);
      setUsers((prev) => 
        prev.map((u) => u.user_id === user.user_id ? { ...u, status: newStatus } : u)
      );
      toast.success(`Akun ${user.name} berhasil di-${newStatus === "blocked" ? "blokir" : "aktifkan"}.`, { id: loadingToast });
    } catch (err) {
      toast.error("Gagal memproses perubahan.", { id: loadingToast });
    } finally {
      setProcessingId(null);
      setModal({ isOpen: false, user: null });
    }
  };

  const filteredUsers = users.filter((u) => {
    if (activeTab === "all") return true;
    if (activeTab === "blocked") return u.status === "blocked";
    return u.role === activeTab;
  });

  return (
    <main className="bg-[#F6F4EE] min-h-screen pb-16 font-body">
      <DesignTokens />

      {/* Modal Custom */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#1F2723]/60 backdrop-blur-sm" onClick={() => setModal({ isOpen: false, user: null })} />
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-[#F6DEDA] rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTriangleExclamation className="text-[#B5453D] text-xl" />
            </div>
            <h3 className="text-lg font-display font-semibold text-center text-[#1F2723]">Konfirmasi Tindakan</h3>
            <p className="text-sm text-[#8C8578] text-center mt-2">
              Apakah Anda yakin ingin {modal.user.status === "active" ? "memblokir" : "mengaktifkan"} akun <strong>{modal.user.name}</strong>?
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal({ isOpen: false, user: null })} className="flex-1 border border-[#D8D3C6] py-2.5 rounded-xl text-sm font-medium hover:bg-[#F6F4EE] transition">Batal</button>
              <button onClick={confirmAction} className="flex-1 bg-[#2F5D50] hover:bg-[#24463C] text-white py-2.5 rounded-xl text-sm font-semibold transition">Ya, Lanjutkan</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#1F2723]">
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#B8B2A3] hover:text-white font-medium mb-8">
            <FaArrowLeft /> Kembali ke Beranda
          </Link>
          <h1 className="font-display text-3xl text-white font-semibold">Control Panel Admin</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-6 space-y-6">
        {/* Stats */}
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm flex flex-wrap divide-y sm:divide-y-0 sm:divide-x divide-[#E4E0D6] overflow-hidden">
          <div className="flex-1 p-5"><p className="text-[11px] uppercase text-[#8C8578]">Total Akun</p><p className="text-3xl font-semibold">{users.length}</p></div>
          <div className="flex-1 p-5"><p className="text-[11px] uppercase text-[#8C8578]">Pemilik</p><p className="text-3xl font-semibold">{users.filter(u=>u.role==='owner').length}</p></div>
          <div className="flex-1 p-5"><p className="text-[11px] uppercase text-[#8C8578]">Penyewa</p><p className="text-3xl font-semibold">{users.filter(u=>u.role==='tenant').length}</p></div>
          <div className="flex-1 p-5"><p className="text-[11px] uppercase text-[#B5453D]">Diblokir</p><p className="text-3xl font-semibold text-[#B5453D]">{users.filter(u=>u.status==='blocked').length}</p></div>
        </div>

        {/* Tab Filter */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 rounded-xl text-sm font-medium ${activeTab === tab.key ? "bg-[#2F5D50] text-white" : "bg-white border border-[#E4E0D6]"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* List User */}
        <div className="bg-white rounded-2xl border border-[#E4E0D6] shadow-sm overflow-hidden">
          {filteredUsers.map((u) => (
            <div key={u.user_id} className="flex items-center justify-between p-5 border-b last:border-0 hover:bg-[#F6F4EE]/40">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.status === 'active' ? 'bg-[#1F2723] text-[#B98A3D]' : 'bg-[#F6DEDA] text-[#B5453D]'}`}>
                  {u.name[0].toUpperCase()}
                </div>
                <div>
                  <p className={`font-semibold ${u.status === 'blocked' ? 'line-through text-gray-400' : ''}`}>{u.name}</p>
                  <p className="text-xs text-[#8C8578]">{u.email} • {ROLE_LABEL[u.role]}</p>
                </div>
              </div>
              <button onClick={() => setModal({ isOpen: true, user: u })} disabled={u.user_id === adminId} className="text-xs font-semibold px-4 py-2 rounded-lg border border-[#D8D3C6]">
                {u.status === 'active' ? 'Blokir' : 'Pulihkan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}