"use client";

import { useEffect, useState } from "react";
import { getAllUnits } from "@/services/unit";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const result = await getAllUnits();
        setUnits(result.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUnits();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID").format(price);
  };

  return (
    <main className="bg-slate-50">
      {/* HERO */}
      <section className="bg-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h1 className="text-5xl font-bold mb-4">Temukan Kontrakan Nyaman</h1>

          <p className="text-xl text-emerald-100 max-w-2xl">
            Kontrakan Al-Amin menyediakan berbagai pilihan kontrakan dengan
            harga terjangkau, lokasi strategis, dan lingkungan yang nyaman.
          </p>

          <Link href="#kontrakan">
            <button className="mt-8 bg-white text-emerald-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition">
              Lihat Kontrakan
            </button>
          </Link>
        </div>
      </section>

      {/* LIST KONTRAKAN */}
      <section id="kontrakan" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Daftar Kontrakan
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => (
            <div
              key={unit.unit_id}
              className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition"
            >
              <div className="relative h-56">
                <Image
                  src={unit.unit_photo?.[0]}
                  alt={unit.unit_name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">{unit.unit_name}</h3>

                <p className="text-emerald-600 text-2xl font-bold mb-3">
                  Rp {formatPrice(unit.rental_price)}
                </p>

                <div className="space-y-2 text-gray-600">
                  <p>🏠 {unit.unit_availability} Unit Tersedia</p>

                  <p>📞 {unit.phone_number}</p>
                </div>

                <Link href={`/units/${unit.unit_id}`}>
                  <button className="w-full mt-5 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium transition">
                    Lihat Detail
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TENTANG */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Tentang Kontrakan Al-Amin{" "}
          </h2>

          <p className="text-gray-600 leading-8">
            Kontrakan Al-Amin merupakan platform penyewaan kontrakan yang
            memudahkan calon penyewa dalam mencari hunian yang nyaman dan
            terjangkau. Melalui sistem ini, penyewa dapat melihat informasi
            kontrakan, melakukan booking, serta memantau status booking secara
            online.
          </p>
        </div>
      </section>

      {/* KONTAK */}
      <section className="bg-slate-100 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Hubungi Kami</h2>

          <div className="space-y-3 text-gray-700">
            <p>📍 Gang Al-Amin, Gandoang, Bogor</p>
            <p>📞 085817094923</p>
            <p>✉️ admin@alaminkontrakan.com</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-emerald-700 text-white py-6">
        <div className="max-w-7xl mx-auto text-center">
          © {new Date().getFullYear()} Kontrakan Al-Amin. All Rights Reserved.
        </div>
      </footer>
    </main>
  );
}
