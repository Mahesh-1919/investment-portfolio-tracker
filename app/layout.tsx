import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio Dashboard · Octa Byte AI",
  description: "Real-time portfolio tracker with live NSE/BSE data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}
