import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export async function signUp(email: string, password: string, name: string, language: string = 'pt-BR') {
  try {
    // Hash da senha
    const password_hash = await bcrypt.hash(password, 10)
    
    // Criar usuário
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        email, 
        password_hash, 
        name, 
        language,
        has_accepted_terms: false 
      }])
      .select()
      .single()

    if (error) throw error

    // Criar assinatura free inicial
    await supabase
      .from('subscriptions')
      .insert([{
        user_id: data.id,
        status: 'trial',
        plan: 'free',
        provider: 'stripe',
        trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
      }])

    // Criar memória inicial
    await supabase
      .from('user_memory')
      .insert([{
        user_id: data.id,
        memory_json: {}
      }])

    return { user: data, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export async function signIn(email: string, password: string) {
  try {
    // Buscar usuário
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      throw new Error('Credenciais inválidas')
    }

    // Verificar senha
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      throw new Error('Credenciais inválidas')
    }

    return { user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export async function getUserSubscription(userId: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    // Verificar se trial expirou
    if (data.status === 'trial' && data.trial_end) {
      const trialEnd = new Date(data.trial_end)
      if (trialEnd < new Date()) {
        // Atualizar para expirado
        await supabase
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('id', data.id)
        
        return { ...data, status: 'expired' }
      }
    }

    // Verificar se assinatura expirou
    if (data.status === 'active' && data.current_period_end) {
      const periodEnd = new Date(data.current_period_end)
      if (periodEnd < new Date()) {
        await supabase
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('id', data.id)
        
        return { ...data, status: 'expired' }
      }
    }

    return data
  } catch (error) {
    return null
  }
}

export function isPremium(subscription: any): boolean {
  if (!subscription) return false
  return subscription.status === 'active' || subscription.status === 'trial'
}

export async function acceptTerms(userId: string) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ has_accepted_terms: true })
      .eq('id', userId)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
