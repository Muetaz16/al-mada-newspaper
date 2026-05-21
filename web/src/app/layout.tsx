import type { Metadata } from "next";
import { Cairo, Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: "صحيفة المدى الرقمية | Al-Mada Digital Newspaper",
  description: "منصة إخبارية عربية متكاملة تقدم أحدث الأخبار والتقارير.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${inter.variable} ${cairo.variable} font-cairo antialiased`}>
        {children}
      </body>
    </html>
  );
}
