import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "COMIEADEPA — Loja Oficial",
    template: "%s | COMIEADEPA Loja",
  },
  description:
    "Loja oficial da Convenção de Ministros COMIEADEPA. Fardamentos, produtos institucionais e materiais dos congressos.",
  keywords: ["COMIEADEPA", "loja", "fardamentos", "convenção de ministros", "congressos"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
