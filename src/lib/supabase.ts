import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  name?: string
  avatar_url?: string
  language?: string
  has_accepted_terms?: boolean
  created_at: string
  updated_at: string
}

export type Subscription = {
  id: string
  user_id: string
  status: 'trial' | 'active' | 'premium' | 'canceled' | 'expired'
  plan: 'free' | 'monthly' | 'yearly'
  provider: 'stripe' | 'apple' | 'google'
  provider_customer_id?: string
  current_period_end?: string
  trial_end?: string
  created_at: string
  updated_at: string
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}