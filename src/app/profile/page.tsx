'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { t, languages } from '@/lib/i18n'
import { User, Globe, Moon, Sun, LogOut, Download, Trash2, ArrowLeft, Crown } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const { user, subscription, isPremiumUser, language, setLanguage, logout } = useAuth()
  const [theme, setTheme] = useState('auto')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!user) {
    router.push('/signin')
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/signin')
  }

  const handleExportData = async () => {
    // TODO: Implementar exportação de dados
    alert('Funcionalidade de exportação será implementada no Módulo 4')
  }

  const handleDeleteAccount = async () => {
    // TODO: Implementar exclusão de conta
    if (showDeleteConfirm) {
      alert('Funcionalidade de exclusão será implementada no Módulo 4')
      setShowDeleteConfirm(false)
    } else {
      setShowDeleteConfirm(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-serenity py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/home" className="inline-flex items-center gap-2 text-serenity-600 dark:text-serenity-400 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Home
        </Link>

        {/* Header do Perfil */}
        <div className="card-spa p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-ocean rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-spa-900 dark:text-spa-50">
                {user.name}
              </h1>
              <p className="text-spa-600 dark:text-spa-400">{user.email}</p>
              {isPremiumUser && (
                <div className="flex items-center gap-2 mt-2">
                  <Crown className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium text-warning">
                    {t('sub.premium', language as any)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status da Assinatura */}
          {subscription && (
            <div className="bg-spa-100 dark:bg-spa-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-spa-600 dark:text-spa-400">Status</p>
                  <p className="font-semibold text-spa-900 dark:text-spa-50">
                    {subscription.status === 'trial' && t('sub.trial', language as any)}
                    {subscription.status === 'active' && t('sub.premium', language as any)}
                    {subscription.status === 'expired' && t('sub.free', language as any)}
                  </p>
                </div>
                {!isPremiumUser && (
                  <Link href="/subscribe">
                    <button className="btn-primary">
                      {t('sub.upgrade', language as any)}
                    </button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Configurações */}
        <div className="card-spa p-8 mb-6">
          <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-6">
            Configurações
          </h2>

          <div className="space-y-6">
            {/* Idioma */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-spa-700 dark:text-spa-300 mb-2">
                <Globe className="w-4 h-4" />
                Idioma / Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-spa w-full"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tema */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-spa-700 dark:text-spa-300 mb-2">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                Tema
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="input-spa w-full"
              >
                <option value="auto">Automático (sistema)</option>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dados e Privacidade */}
        <div className="card-spa p-8 mb-6">
          <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-6">
            Dados e Privacidade
          </h2>

          <div className="space-y-4">
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-4 bg-spa-100 dark:bg-spa-800 rounded-xl hover:bg-spa-200 dark:hover:bg-spa-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-serenity-600 dark:text-serenity-400" />
                <div className="text-left">
                  <p className="font-medium text-spa-900 dark:text-spa-50">
                    Exportar meus dados
                  </p>
                  <p className="text-sm text-spa-600 dark:text-spa-400">
                    Baixar todos os seus dados em JSON
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-between p-4 bg-error/10 border border-error/30 rounded-xl hover:bg-error/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-error" />
                <div className="text-left">
                  <p className="font-medium text-error">
                    Excluir minha conta
                  </p>
                  <p className="text-sm text-spa-600 dark:text-spa-400">
                    Ação permanente e irreversível
                  </p>
                </div>
              </div>
            </button>

            {showDeleteConfirm && (
              <div className="bg-error/10 border border-error/30 rounded-xl p-4">
                <p className="text-sm text-spa-700 dark:text-spa-300 mb-3">
                  ⚠️ Tem certeza? Todos os seus dados serão excluídos permanentemente.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 bg-error text-white font-medium rounded-xl px-6 py-3 hover:bg-error/90 transition-colors"
                  >
                    Confirmar exclusão
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Links Legais */}
        <div className="card-spa p-6 mb-6">
          <div className="space-y-2 text-sm">
            <Link href="/terms" target="_blank" className="block text-serenity-600 dark:text-serenity-400 hover:underline">
              {t('compliance.terms', language as any)}
            </Link>
            <Link href="/privacy" target="_blank" className="block text-serenity-600 dark:text-serenity-400 hover:underline">
              {t('compliance.privacy', language as any)}
            </Link>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 btn-secondary"
        >
          <LogOut className="w-5 h-5" />
          {t('auth.signIn', language as any)} (Sair)
        </button>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-spa-600 dark:text-spa-400">
          <p>Serenity AI v1.0.0</p>
          <p className="mt-1">Fundadora: Tauany Polak</p>
          <p className="mt-1">"Ninguém deve sofrer sozinho."</p>
        </div>
      </div>
    </div>
  )
}
