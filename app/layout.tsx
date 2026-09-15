import type { Metadata } from "next";
import { Noto_Sans_Thai, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-thai",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "คัมภีร์ — พจนานุกรมยุคใหม่ เข้าใจภาษาไทยในทุกบริบท",
  description: "ค้นคำ เข้าใจบริบท สื่อสารได้ตรงใจ — พจนานุกรมและเครื่องมือเข้าใจภาษาไทย",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${notoThai.variable} ${robotoMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
