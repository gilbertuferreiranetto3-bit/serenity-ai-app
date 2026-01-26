'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Subscription, supabase } from '@/lib/supabase'
import { getUserSubscription, isPremium } from '@/lib/auth'

type AuthContextType = {
  user: User | null
  subscription: Subscription | null
  isLoading: boolean
  isPremiumUser: boolean
  language: string
  setUser: (user: User | null) => void
  setLanguage: (lang: string) => void
  refreshUser: () => Promise<void>
  logout: () => void
  login: (email: string, password: string) => Promise<{ user: User | null, error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [language, setLanguage] = useState('pt-BR')
  const [isPremiumFromPlan, setIsPremiumFromPlan] = useState(false)

  // Função para verificar plano premium (user_plans)
  const checkPremiumPlan = async (userId: string) => {
    if (!supabase) return false

    try {
      const { data, error } = await supabase
        .from('user_plans')
        .select('is_premium, premium_until')
        .eq('user_id', userId)
        .single()

      if (error || !data) return false

      // Verificar se premium expirou
      if (data.is_premium && data.premium_until) {
        const premiumUntil = new Date(data.premium_until)
        if (premiumUntil < new Date()) {
          return false
        }
      }

      return data.is_premium
    } catch (error) {
      console.error('Erro ao verificar plano premium:', error)
      return false
    }
  }

  // Função para buscar perfil atualizado do banco
  const refreshUser = async () => {
    if (!supabase) return

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        setUser(null)
        setSubscription(null)
        setIsPremiumFromPlan(false)
        localStorage.removeItem('serenity_user')
        return
      }

      // Buscar perfil atualizado do banco
      const { data: profileData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) throw error

      setUser(profileData)
      setLanguage(profileData.language || 'pt-BR')
      localStorage.setItem('serenity_user', JSON.stringify(profileData))

      // Carregar assinatura (subscriptions)
      const sub = await getUserSubscription(profileData.id)
      setSubscription(sub)

      // Verificar plano premium (user_plans)
      const premiumPlan = await checkPremiumPlan(profileData.id)
      setIsPremiumFromPlan(premiumPlan)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      setUser(null)
      setSubscription(null)
      setIsPremiumFromPlan(false)
      localStorage.removeItem('serenity_user')
    }
  }

  // Função de login
  const login = async (email: string, password: string): Promise<{ user: User | null, error: string | null }> => {
    if (!supabase) return { user: null, error: 'Supabase não configurado' }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user) {
        // Buscar perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          return { user: null, error: profileError.message }
        }

        setUser(profileData)
        setLanguage(profileData.language || 'pt-BR')
        localStorage.setItem('serenity_user', JSON.stringify(profileData))

        // Carregar assinatura e plano premium
        const [sub, premiumPlan] = await Promise.all([
          getUserSubscription(profileData.id),
          checkPremiumPlan(profileData.id)
        ])
        setSubscription(sub)
        setIsPremiumFromPlan(premiumPlan)

        return { user: profileData, error: null }
      }

      return { user: null, error: 'Erro desconhecido' }
    } catch (err) {
      return { user: null, error: 'Erro ao fazer login' }
    }
  }

  useEffect(() => {
    // Carregar usuário do localStorage
    const storedUser = localStorage.getItem('serenity_user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setLanguage(parsedUser.language || 'pt-BR')
      
      // Carregar assinatura e plano premium
      Promise.all([
        getUserSubscription(parsedUser.id),
        checkPremiumPlan(parsedUser.id)
      ]).then(([sub, premiumPlan]) => {
        setSubscription(sub)
        setIsPremiumFromPlan(premiumPlan)
        setIsLoading(false)
      })

      // Refresh do perfil para garantir dados atualizados
      refreshUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser)
    if (newUser) {
      localStorage.setItem('serenity_user', JSON.stringify(newUser))
      setLanguage(newUser.language || 'pt-BR')
      
      // Carregar assinatura e plano premium
      Promise.all([
        getUserSubscription(newUser.id),
        checkPremiumPlan(newUser.id)
      ]).then(([sub, premiumPlan]) => {
        setSubscription(sub)
        setIsPremiumFromPlan(premiumPlan)
      })
    } else {
      localStorage.removeItem('serenity_user')
      setSubscription(null)
      setIsPremiumFromPlan(false)
    }
  }

  const logout = () => {
    setUser(null)
    setSubscription(null)
    setIsPremiumFromPlan(false)
    localStorage.removeItem('serenity_user')
  }

  // Usuário é premium se:
  // 1. Tem assinatura ativa/trial (subscriptions) OU
  // 2. Tem plano premium ativo (user_plans)
  const isPremiumUser = isPremiumFromPlan || (subscription ? isPremium(subscription) : false)

  return (
    <AuthContext.Provider value={{
      user,
      subscription,
      isLoading,
      isPremiumUser,
      language,
      setUser: handleSetUser,
      setLanguage,
      refreshUser,
      logout,
      login
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}