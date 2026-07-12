"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getUserById } from "@/services/user";
import {
  FaChevronDown,
  FaRightFromBracket,
  FaTableColumns,
  FaClockRotateLeft,
  FaUser,
  FaHouse,
  FaBars,
  FaXmark,
} from "react-icons/fa6";

// ─── Shared Design Tokens ────────────────────────────────────────────────────
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

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          max-height: 0;
        }
        to {
          opacity: 1;
          max-height: 400px;
        }
      }
    `}</style>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const DASHBOARD_PATH = {
  owner: "/dashboard-owner",
  admin: "/dashboard-admin",
};

// ─── Dropdown foto profil (desktop only, hanya logout + profil) ─────────────
function AvatarDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative font-body">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 hover:opacity-80 transition duration-200 outline-none focus-ring rounded-full p-0.5"
      >
        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-[#B98A3D] shadow-sm bg-[#1F2723] flex items-center justify-center shrink-0">
          {user?.profile_photo ? (
            <Image
              src={user.profile_photo}
              alt={user.name ?? "Foto profil"}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-[#B98A3D] font-display font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          )}
        </div>
        <FaChevronDown
          className={`text-[#8C8578] text-[10px] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#E4E0D6] overflow-hidden z-50 animate-[fadeIn_0.15s_ease-out]">
            <div className="px-4 py-3 bg-[#F6F4EE]/60 border-b border-[#E4E0D6]">
              <p className="text-sm font-semibold text-[#1F2723] truncate">
                {user?.name}
              </p>
              <span className="mt-1 inline-block text-[10px] bg-[#F5E7CC] text-[#8A6416] font-mono-num font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {user?.role || "Tenant"}
              </span>
            </div>

            <div className="p-1.5 space-y-0.5">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#4A4640] hover:bg-[#F6F4EE] hover:text-[#2F5D50] transition duration-200"
              >
                <FaUser className="text-[#8C8578] text-[11px]" />
                Profil Saya
              </Link>
            </div>

            <div className="p-1.5 border-t border-[#F6F4EE]">
              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#B5453D] hover:bg-[#F6DEDA]/50 transition duration-200 text-left"
              >
                <FaRightFromBracket className="text-[#B5453D] text-[11px]" />
                Keluar Sesi
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const token = Cookies.get("token");
        const raw = Cookies.get("payload");
        if (!token || !raw) return;

        const payload = JSON.parse(raw);
        const result = await getUserById(payload.id);
        setUser(result.data);
      } catch (err) {
        console.error("Gagal fetch user:", err);
        Cookies.remove("token");
        Cookies.remove("payload");
      } finally {
        setLoadingUser(false);
      }
    };

    init();
  }, []);

  // Tutup mobile menu otomatis kalau layar di-resize ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("payload");
    setUser(null);
    setMobileOpen(false);
    router.push("/login");
  };

  const role = user?.role;
  const dashboardPath = DASHBOARD_PATH[role];

  const navLinks = [
    { href: "/#kontrakan", label: "Kontrakan", icon: null, show: true },
    {
      href: dashboardPath,
      label: "Dashboard",
      icon: FaTableColumns,
      show: !loadingUser && !!dashboardPath,
    },
    {
      href: "/booking-history",
      label: "Booking Saya",
      icon: FaClockRotateLeft,
      show: !loadingUser && role === "tenant",
    },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-[#E4E0D6] shadow-sm font-body selection:bg-[#B98A3D]/30">
      <DesignTokens />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group outline-none focus-ring rounded-lg shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#2F5D50] flex items-center justify-center shadow-sm group-hover:bg-[#24463C] transition duration-200">
            <FaHouse className="text-[#F6F4EE] text-sm" />
          </div>
          <span className="font-display font-semibold text-base sm:text-lg text-[#1F2723]">
            Al-Amin Kost
          </span>
        </Link>

        {/* Menu Kanan — Desktop */}
        <div className="hidden sm:flex items-center gap-6">
          {navLinks
            .filter((l) => l.show)
            .map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#6B6459] hover:text-[#2F5D50] transition flex items-center gap-1.5 focus-ring rounded"
              >
                {link.icon && <link.icon className="text-[#B98A3D] text-xs" />}
                {link.label}
              </Link>
            ))}

          <div className="h-6 w-px bg-[#E4E0D6]" />

          {loadingUser ? (
            <div className="w-9 h-9 rounded-full bg-[#EFEBE1] animate-pulse border border-[#D8D3C6]" />
          ) : user ? (
            <AvatarDropdown user={user} onLogout={handleLogout} />
          ) : (
            <Link
              href="/login"
              className="bg-[#B98A3D] hover:bg-[#A47A34] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition duration-200 focus-ring"
            >
              Login
            </Link>
          )}
        </div>

        {/* Menu Kanan — Mobile: avatar/login kecil + hamburger */}
        <div className="flex sm:hidden items-center gap-3">
          {loadingUser ? (
            <div className="w-8 h-8 rounded-full bg-[#EFEBE1] animate-pulse border border-[#D8D3C6]" />
          ) : user ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#B98A3D] shadow-sm bg-[#1F2723] flex items-center justify-center shrink-0">
              {user?.profile_photo ? (
                <Image
                  src={user.profile_photo}
                  alt={user.name ?? "Foto profil"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-[#B98A3D] font-display font-semibold text-xs">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </span>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-[#B98A3D] hover:bg-[#A47A34] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition duration-200 focus-ring"
            >
              Login
            </Link>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#1F2723] hover:bg-[#F6F4EE] transition duration-200 focus-ring"
          >
            {mobileOpen ? (
              <FaXmark className="text-lg" />
            ) : (
              <FaBars className="text-lg" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Panel */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-30 sm:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="sm:hidden absolute top-16 left-0 right-0 bg-white border-b border-[#E4E0D6] shadow-[0_12px_24px_rgb(0,0,0,0.06)] z-40 animate-[slideDown_0.2s_ease-out] overflow-hidden">
            <div className="px-4 py-3 space-y-0.5">
              {navLinks
                .filter((l) => l.show)
                .map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-[#4A4640] hover:bg-[#F6F4EE] hover:text-[#2F5D50] transition duration-200"
                  >
                    {link.icon ? (
                      <link.icon className="text-[#B98A3D] text-sm" />
                    ) : (
                      <FaHouse className="text-[#B98A3D] text-sm" />
                    )}
                    {link.label}
                  </Link>
                ))}
            </div>

            {!loadingUser && user && (
              <div className="border-t border-[#F6F4EE] px-4 py-3 space-y-0.5">
                <div className="px-3 pb-2 flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#1F2723] truncate">
                    {user?.name}
                  </p>
                  <span className="inline-block text-[10px] bg-[#F5E7CC] text-[#8A6416] font-mono-num font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {user?.role || "Tenant"}
                  </span>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-[#4A4640] hover:bg-[#F6F4EE] hover:text-[#2F5D50] transition duration-200"
                >
                  <FaUser className="text-[#8C8578] text-sm" />
                  Profil Saya
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-[#B5453D] hover:bg-[#F6DEDA]/50 transition duration-200 text-left"
                >
                  <FaRightFromBracket className="text-[#B5453D] text-sm" />
                  Keluar Sesi
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
