'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { useAuth } from '@/contexts/AuthContext'
import { t } from '@/lib/i18n'
import { Leaf, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const { setUser, language } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const { user, error: authError } = await signIn(email, password)

    if (authError) {
      setError(authError)
      setIsLoading(false)
      return
    }

    if (user) {
      setUser(user)
      
      // Verificar se aceitou termos
      if (!user.has_accepted_terms) {
        router.push('/consent')
      } else {
        router.push('/home')
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-serenity flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-ocean rounded-full mb-4 animate-pulse-soft">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Serenity AI</h1>
          <p className="text-spa-600 dark:text-spa-400">
            Onde a ansiedade encontra descanso
          </p>
        </div>

        {/* Card de Login */}
        <div className="card-spa p-8">
          <h2 className="text-2xl font-semibold text-spa-900 dark:text-spa-50 mb-6">
            {t('auth.signIn', language as any)}
          </h2>

          {error && (
            <div className="bg-error/10 border border-error/30 text-error rounded-xl p-4 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-spa-700 dark:text-spa-300 mb-2">
                {t('auth.email', language as any)}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-spa w-full"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-spa-700 dark:text-spa-300 mb-2">
                {t('auth.password', language as any)}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-spa w-full"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('common.loading', language as any)}
                </>
              ) : (
                t('auth.signIn', language as any)
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              href="/forgot-password"
              className="text-sm text-serenity-600 dark:text-serenity-400 hover:underline"
            >
              {t('auth.forgotPassword', language as any)}
            </Link>
            
            <div className="text-sm text-spa-600 dark:text-spa-400">
              {t('auth.dontHaveAccount', language as any)}{' '}
              <Link
                href="/signup"
                className="text-serenity-600 dark:text-serenity-400 font-medium hover:underline"
              >
                {t('auth.signUp', language as any)}
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-spa-600 dark:text-spa-400">
          <p>Fundadora: Tauany Polak</p>
          <p className="mt-1">"Conectando a tecnologia com a cura emocional."</p>
        </div>
      </div>
    </div>
  )
}
