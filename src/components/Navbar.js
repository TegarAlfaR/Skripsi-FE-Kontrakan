import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-emerald-600">
          Kontrakan Al-Amin
        </Link>

        <div className="flex items-center gap-8">
          <a href="#kontrakan">Kontrakan</a>
          <a href="#tentang">Tentang</a>
          <a href="#kontak">Kontak</a>

          <Link
            href="/login"
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
