import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";

// Atkinson Hyperlegible: diseñada por el Braille Institute para baja visión y lectura difícil.
const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Painani",
  description: "Avisos del hospital a las familias, sin esperar en la sala.",
};

export const viewport: Viewport = {
  themeColor: "#f5f6f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${atkinson.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
