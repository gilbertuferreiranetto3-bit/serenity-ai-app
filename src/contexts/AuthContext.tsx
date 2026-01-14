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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [language, setLanguage] = useState('pt-BR')

  // Função para buscar perfil atualizado do banco
  const refreshUser = async () => {
    if (!supabase) return

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        setUser(null)
        setSubscription(null)
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

      // Carregar assinatura
      const sub = await getUserSubscription(profileData.id)
      setSubscription(sub)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      setUser(null)
      setSubscription(null)
      localStorage.removeItem('serenity_user')
    }
  }

  useEffect(() => {
    // Carregar usuário do localStorage
    const storedUser = localStorage.getItem('serenity_user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setLanguage(parsedUser.language || 'pt-BR')
      
      // Carregar assinatura
      getUserSubscription(parsedUser.id).then(sub => {
        setSubscription(sub)
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
      
      // Carregar assinatura
      getUserSubscription(newUser.id).then(sub => {
        setSubscription(sub)
      })
    } else {
      localStorage.removeItem('serenity_user')
      setSubscription(null)
    }
  }

  const logout = () => {
    setUser(null)
    setSubscription(null)
    localStorage.removeItem('serenity_user')
  }

  const isPremiumUser = subscription ? isPremium(subscription) : false

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
      logout
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
