import type { Metadata, Viewport } from "next";
// Atkinson Hyperlegible: diseñada por el Braille Institute para baja visión y lectura difícil.
// Autoalojada (sin Google Fonts) para que la demo compile y se vea igual aunque no haya internet.
import "@fontsource/atkinson-hyperlegible/latin-400.css";
import "@fontsource/atkinson-hyperlegible/latin-700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Painani",
  description: "Avisos del hospital a las familias, sin esperar en la sala.",
};

export const viewport: Viewport = {
  themeColor: "#f5f6f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
