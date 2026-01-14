import { createClient } from '@supabase/supabase-js'

// Verificação de variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Console.log temporário para debug (apenas em dev)
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 SUPABASE URL exists?', !!supabaseUrl)
  console.log('🔍 SUPABASE ANON_KEY exists?', !!supabaseAnonKey)
}

// Exportar null se as variáveis não estiverem configuradas
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper para verificar se o Supabase está configurado
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey

// Types para o banco de dados
export type User = {
  id: string
  name: string
  email: string
  password_hash: string
  language: string
  theme: string
  has_accepted_terms: boolean
  created_at: string
}

export type Subscription = {
  id: string
  user_id: string
  status: 'trial' | 'active' | 'canceled' | 'expired'
  plan: 'free' | 'monthly' | 'yearly'
  provider: 'stripe' | 'apple' | 'google'
  provider_customer_id?: string
  current_period_end?: string
  trial_end?: string
  created_at: string
  updated_at: string
}

export type ChatMessage = {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  session_id: string
  created_at: string
}

export type UserMemory = {
  id: string
  user_id: string
  memory_json: Record<string, any>
  updated_at: string
}

export type MoodLog = {
  id: string
  user_id: string
  mood_0_10: number
  anxiety_0_10?: number
  sleep_quality_0_10?: number
  note?: string
  created_at: string
}

export type JournalEntry = {
  id: string
  user_id: string
  title?: string
  content: string
  tags?: string[]
  created_at: string
}

export type AudioTrack = {
  id: string
  title: string
  category: 'rain' | 'ocean' | 'forest' | 'fireplace' | 'whitenoise'
  url: string
  duration_sec?: number
  is_premium: boolean
  created_at: string
}
