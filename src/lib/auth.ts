import { supabase } from './supabase'

export async function signUp(email: string, password: string, name: string, language: string = 'pt-BR', theme: string = 'system') {
  if (!supabase) {
    return { user: null, error: 'Supabase não configurado' }
  }

  try {
    // Criar usuário no Supabase Auth
    // O trigger no banco criará automaticamente o perfil em public.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          language,
          has_accepted_terms: false,
          theme
        }
      }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Erro ao criar usuário')

    // Retornar sucesso - o perfil será criado pela trigger
    return { 
      user: authData.user, 
      error: null,
      message: 'Conta criada com sucesso! Faça login para continuar.'
    }
  } catch (error: any) {
    return { user: null, error: error.message || 'Erro ao criar conta' }
  }
}

export async function signIn(email: string, password: string) {
  if (!supabase) {
    return { user: null, error: 'Supabase não configurado' }
  }

  try {
    // 1. Autenticar com Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Credenciais inválidas')

    // 2. Buscar perfil do usuário
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) throw profileError

    return { user: profileData, error: null }
  } catch (error: any) {
    return { user: null, error: 'Credenciais inválidas' }
  }
}

export async function signOut() {
  if (!supabase) {
    return { error: 'Supabase não configurado' }
  }

  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getCurrentUser() {
  if (!supabase) {
    return null
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return profileData
  } catch (error) {
    return null
  }
}

export async function getUserSubscription(userId: string) {
  if (!supabase) {
    return null
  }

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
  if (!supabase) {
    return { success: false, error: 'Supabase não configurado' }
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        has_accepted_terms: true,
        accepted_terms_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
