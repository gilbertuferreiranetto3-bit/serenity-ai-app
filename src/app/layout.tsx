import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { isSupabaseConfigured } from "@/lib/supabase";
import SupabaseConfigPending from "@/components/SupabaseConfigPending";
import Providers from "./providers";
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Serenity AI App',
  description: 'App de bem-estar emocional',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Se o Supabase não estiver configurado, mostrar tela de configuração
  if (!isSupabaseConfigured()) {
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}