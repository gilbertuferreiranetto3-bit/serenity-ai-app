import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Serenity AI - Onde a ansiedade encontra descanso",
  description: "App de bem-estar emocional com IA empática, sons relaxantes, respiração guiada e diário emocional.",
  keywords: "bem-estar, ansiedade, meditação, IA, saúde mental, respiração",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
