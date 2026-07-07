import Link from "next/link";
import { FaHouse, FaArrowLeft } from "react-icons/fa6";

export default function NotFound() {
  return (
    <main className="bg-[#F6F4EE] min-h-screen flex flex-col items-center justify-center p-6 text-center selection:bg-[#B98A3D]/20">
      {/* Google Fonts Loader untuk Fraunces & Inter */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap");
        .font-display { font-family: "Fraunces", serif; }
        .font-body { font-family: "Inter", sans-serif; }
      `,
        }}
      />

      <div className="max-w-md font-body">
        {/* Ikon Rumah Minimalis Accent */}
        <div className="w-16 h-16 rounded-full bg-[#EFEBE1] flex items-center justify-center mx-auto mb-6 border border-[#E4E0D6] shadow-sm">
          <FaHouse className="text-[#B98A3D] text-2xl" />
        </div>

        {/* Angka 404 dengan Font Serif */}
        <h1 className="font-display text-8xl font-semibold text-[#1F2723] tracking-tight leading-none">
          404
        </h1>

        {/* Pesan Error */}
        <h2 className="font-display text-2xl font-medium text-[#1F2723] mt-4 leading-tight">
          Halaman Tidak Ditemukan
        </h2>

        <p className="mt-3 text-sm text-[#6B6459] leading-relaxed">
          Maaf, alamat kontrakan digital yang kamu cari tidak ada atau telah
          berpindah ke lokasi lain.
        </p>

        {/* Tombol Navigasi Kembali */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <button className="w-full inline-flex items-center justify-center gap-2 bg-[#2F5D50] hover:bg-[#24463C] text-white px-6 py-3 rounded-xl text-sm font-semibold transition duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B98A3D] focus:ring-offset-2">
              <FaHouse className="text-xs" />
              Kembali ke Beranda
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
