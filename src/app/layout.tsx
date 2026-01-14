import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import SupabaseConfigPending from "@/components/SupabaseConfigPending";

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
  // Se o Supabase não estiver configurado, mostrar tela de configuração
  if (!isSupabaseConfigured) {
    return (
      <html lang="pt-BR">
        <body className={`${inter.className} antialiased`}>
          <SupabaseConfigPending />
        </body>
      </html>
    );
  }

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
