import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Al-Amin Kost",
  description: "Kontrakan di Gang Al-Amin",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full">
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
