import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "KontrakanAl-Amin",
  description: "Kontrakan di Gang Al-Amin",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kontrakan Al-Amin",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full">
      <head>
        {/* Tambahan manual untuk PWA agar lebih stabil */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C19A6B" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body
        className={`${poppins.className} min-h-screen bg-gray-50 text-gray-900`}
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
          }}
        />
      </body>
    </html>
  );
}