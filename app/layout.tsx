import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CeritaBelajar PDF - Ubah PDF Menjadi Cerita Edukatif",
  description:
    "Unggah materi PDF, pilih panjang cerita, dan dapatkan cerita edukatif yang mudah dipahami menggunakan AI.",
  keywords: ["belajar", "cerita edukatif", "PDF", "AI", "siswa", "materi pelajaran"],
  openGraph: {
    title: "CeritaBelajar PDF",
    description: "Ubah PDF menjadi cerita yang lebih mudah dipahami",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
