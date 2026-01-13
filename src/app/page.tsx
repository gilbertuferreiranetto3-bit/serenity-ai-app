'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function RootPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (!user.has_accepted_terms) {
          router.push('/consent')
        } else {
          router.push('/home')
        }
      } else {
        router.push('/signin')
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen bg-gradient-serenity flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-ocean rounded-full mx-auto mb-4 animate-pulse-soft flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gradient">Serenity AI</h1>
        <p className="text-spa-600 dark:text-spa-400 mt-2">Carregando...</p>
      </div>
    </div>
  )
}
