"use client";

import Link from "next/link";
import { MdOutlineShield } from "react-icons/md";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F4EE] px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F6DEDA]">
          <MdOutlineShield className="h-8 w-8 text-[#B5453D]" />
        </div>

        <h1 className="text-2xl font-bold text-[#1F2723] mb-2">
          Akses Ditolak
        </h1>

        <p className="text-[#6B6459] mb-8">
          Kamu tidak memiliki izin untuk mengakses halaman ini. Silakan
          kembali ke halaman beranda sesuai dengan peran akunmu.
        </p>

        <Link
          href="/"
          className="inline-block rounded-lg bg-[#2F5D50] px-6 py-3 font-medium text-white transition hover:bg-[#24463C]"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
