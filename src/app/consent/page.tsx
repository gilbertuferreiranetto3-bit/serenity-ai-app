'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { t } from '@/lib/i18n'
import { Leaf, Check, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { Session } from '@supabase/supabase-js'

export default function ConsentPage() {
  const router = useRouter()
  const { language, setUser, user } = useAuth()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepted, setAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar sessão ao montar componente
  useEffect(() => {
    if (!supabase) {
      setError('Supabase não configurado')
      setLoading(false)
      return
    }

    // Obter sessão inicial
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Escutar mudanças na autenticação
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!loading && !session) {
      router.push('/signin')
    }
  }, [loading, session, router])

  const handleContinue = async () => {
    if (!accepted) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (!supabase) {
        throw new Error('Supabase não configurado')
      }

      // 1. Pegar session e user.id
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        throw new Error('Usuário não autenticado')
      }
      const userId = session.user.id

      // 2. UPSERT do perfil + termos (resiliente)
      const { error: upsertError } = await supabase.from('users').upsert({
        id: userId,
        email: session.user.email,
        name: user?.name ?? '',
        language: language ?? 'pt-BR',
        has_accepted_terms: true,
        accepted_terms_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

      if (upsertError) {
        throw new Error(`Erro ao salvar termos: ${upsertError.message}`)
      }

      // 3. Buscar perfil SEMPRE pelo id com maybeSingle()
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) {
        throw new Error(`Erro ao buscar perfil: ${profileError.message}`)
      }

      // 4. Se profile ainda for null, exibir erro detalhado
      if (!profile) {
        throw new Error(
          'Perfil não encontrado após atualização. Possível problema de sincronização. ' +
          'Por favor, faça logout e login novamente.'
        )
      }

      // 5. Atualizar AuthContext e navegar
      setUser(profile)
      router.push('/home')
    } catch (err: any) {
      console.error('Erro ao aceitar termos:', err)
      setError(err.message || 'Erro ao aceitar termos. Tente novamente.')
      // NÃO redirecionar em caso de erro
    } finally {
      setIsSubmitting(false)
    }
  }

  // Tela de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-serenity flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-serenity-600 dark:text-serenity-400 animate-spin mx-auto mb-4" />
          <p className="text-spa-700 dark:text-spa-300">Carregando sessão...</p>
        </div>
      </div>
    )
  }

  // Se não há sessão, não renderizar nada (redirecionamento em andamento)
  if (!session) {
    return null
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
            Bem-vindo(a)!
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
              disabled={isSubmitting}
              className="w-5 h-5 rounded border-2 border-spa-300 dark:border-spa-700 text-serenity-600 focus:ring-2 focus:ring-serenity-500/20 mt-0.5 disabled:opacity-50"
            />
            <span className="text-spa-700 dark:text-spa-300 text-sm">
              {t('compliance.acceptTerms', language as any)}
            </span>
          </label>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 dark:text-red-200 mb-2">{error}</p>
                {error.includes('logout') && (
                  <button
                    onClick={async () => {
                      await supabase?.auth.signOut()
                      router.push('/signin')
                    }}
                    className="text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
                  >
                    Fazer logout agora
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Botão Continuar */}
          <button
            onClick={handleContinue}
            disabled={!accepted || isSubmitting || !session?.user?.id}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? 'Processando...' : t('compliance.continue', language as any)}
          </button>
        </div>
      </div>
    </div>
  )
}
