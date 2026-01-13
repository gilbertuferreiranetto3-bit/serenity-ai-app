'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { acceptTerms } from '@/lib/auth'
import { t } from '@/lib/i18n'
import { Leaf, Check } from 'lucide-react'
import Link from 'next/link'

export default function ConsentPage() {
  const router = useRouter()
  const { user, language } = useAuth()
  const [accepted, setAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!user) {
    router.push('/signin')
    return null
  }

  const handleContinue = async () => {
    if (!accepted) return

    setIsLoading(true)
    const result = await acceptTerms(user.id)

    if (result.success) {
      router.push('/home')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-serenity flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-ocean rounded-full mb-4">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">Serenity AI</h1>
        </div>

        {/* Card de Consentimento */}
        <div className="card-spa p-8">
          <h2 className="text-2xl font-semibold text-spa-900 dark:text-spa-50 mb-6">
            Bem-vindo(a), {user.name}!
          </h2>

          {/* Disclaimer Principal */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6 mb-6">
            <p className="text-spa-800 dark:text-spa-200 font-medium text-center">
              {t('compliance.disclaimer', language as any)}
            </p>
          </div>

          {/* Informações Importantes */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-serenity-100 dark:bg-serenity-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-serenity-600 dark:text-serenity-400" />
              </div>
              <p className="text-spa-700 dark:text-spa-300 text-sm">
                <strong>Não é um serviço médico:</strong> Este app oferece apoio emocional e ferramentas de bem-estar, mas não diagnostica, trata ou substitui atendimento profissional.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-serenity-100 dark:bg-serenity-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-serenity-600 dark:text-serenity-400" />
              </div>
              <p className="text-spa-700 dark:text-spa-300 text-sm">
                <strong>Emergências:</strong> Em caso de crise ou pensamentos de autoagressão, procure ajuda imediata. No Brasil: CVV 188 (24h).
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-serenity-100 dark:bg-serenity-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-serenity-600 dark:text-serenity-400" />
              </div>
              <p className="text-spa-700 dark:text-spa-300 text-sm">
                <strong>Privacidade:</strong> Seus dados são criptografados e protegidos. Você pode exportar ou excluir seus dados a qualquer momento.
              </p>
            </div>
          </div>

          {/* Links para documentos */}
          <div className="flex gap-4 mb-6 text-sm">
            <Link
              href="/terms"
              target="_blank"
              className="text-serenity-600 dark:text-serenity-400 hover:underline"
            >
              {t('compliance.terms', language as any)}
            </Link>
            <Link
              href="/privacy"
              target="_blank"
              className="text-serenity-600 dark:text-serenity-400 hover:underline"
            >
              {t('compliance.privacy', language as any)}
            </Link>
          </div>

          {/* Checkbox de Aceitação */}
          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-spa-300 dark:border-spa-700 text-serenity-600 focus:ring-2 focus:ring-serenity-500/20 mt-0.5"
            />
            <span className="text-spa-700 dark:text-spa-300 text-sm">
              {t('compliance.acceptTerms', language as any)}
            </span>
          </label>

          {/* Botão Continuar */}
          <button
            onClick={handleContinue}
            disabled={!accepted || isLoading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('compliance.continue', language as any)}
          </button>
        </div>
      </div>
    </div>
  )
}
