'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { t } from '@/lib/i18n'
import { Leaf, MessageCircle, Wind, Music, BookOpen, User, AlertCircle, Sparkles, Clock } from 'lucide-react'
import Link from 'next/link'
import { getLastBreathingSession, getWeeklyBreathingSessions, BREATH_MODES } from '@/lib/breathing'

export default function HomePage() {
  const router = useRouter()
  const { user, isPremiumUser, language } = useAuth()
  const [mood, setMood] = useState(5)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [lastBreath, setLastBreath] = useState<any>(null)
  const [weeklyBreaths, setWeeklyBreaths] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push('/signin')
      return
    }

    if (!user.has_accepted_terms) {
      router.push('/consent')
      return
    }

    // Carregar dados de respiração
    loadBreathingData()
  }, [user, router])

  const loadBreathingData = async () => {
    if (!user) return

    const [lastSession, weeklyCount] = await Promise.all([
      getLastBreathingSession(user.id),
      getWeeklyBreathingSessions(user.id)
    ])

    setLastBreath(lastSession)
    setWeeklyBreaths(weeklyCount)
  }

  if (!user) return null

  const handleSaveMood = async () => {
    setIsSaving(true)

    const { error } = await supabase
      .from('mood_logs')
      .insert([{
        user_id: user.id,
        mood_0_10: mood,
      }])

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setIsSaving(false)
  }

  const getMoodEmoji = (value: number) => {
    if (value <= 2) return '😢'
    if (value <= 4) return '😔'
    if (value <= 6) return '😐'
    if (value <= 8) return '🙂'
    return '😊'
  }

  const getMoodColor = (value: number) => {
    if (value <= 3) return 'from-error to-warning'
    if (value <= 6) return 'from-warning to-serenity-400'
    return 'from-serenity-400 to-blue-400'
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `há ${diffMins} min`
    if (diffHours < 24) return `há ${diffHours}h`
    return `há ${diffDays}d`
  }

  return (
    <div className="min-h-screen bg-gradient-serenity">
      {/* Header */}
      <header className="bg-white/80 dark:bg-spa-900/80 backdrop-blur-md border-b border-spa-200 dark:border-spa-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-ocean rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Serenity AI</h1>
              <p className="text-xs text-spa-600 dark:text-spa-400">
                Olá, {user.name}
              </p>
            </div>
          </div>

          <Link href="/profile">
            <button className="w-10 h-10 bg-spa-200 dark:bg-spa-800 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
              <User className="w-5 h-5 text-spa-700 dark:text-spa-300" />
            </button>
          </Link>
        </div>
      </header>

      {/* Disclaimer Fixo */}
      <div className="bg-blue-100 dark:bg-blue-900/30 border-b border-blue-300 dark:border-blue-700 py-2 px-4">
        <p className="text-center text-xs text-spa-700 dark:text-spa-300 max-w-4xl mx-auto">
          {t('compliance.disclaimer', language as any)}
        </p>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Mood Tracker */}
        <div className="card-spa p-8 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-spa-900 dark:text-spa-50 mb-2">
              {t('home.title', language as any)}
            </h2>
            <p className="text-spa-600 dark:text-spa-400">
              {t('home.subtitle', language as any)}
            </p>
          </div>

          {/* Emoji Display */}
          <div className="text-center mb-6">
            <div className="text-8xl mb-4 animate-pulse-soft">
              {getMoodEmoji(mood)}
            </div>
            <div className={`text-4xl font-bold bg-gradient-to-r ${getMoodColor(mood)} bg-clip-text text-transparent`}>
              {mood}/10
            </div>
          </div>

          {/* Slider */}
          <div className="mb-6">
            <input
              type="range"
              min="0"
              max="10"
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="w-full h-3 bg-spa-200 dark:bg-spa-800 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  rgb(var(--color-serenity-400)) 0%, 
                  rgb(var(--color-blue-400)) ${mood * 10}%, 
                  rgb(var(--color-spa-200)) ${mood * 10}%)`
              }}
            />
            <div className="flex justify-between text-xs text-spa-500 dark:text-spa-500 mt-2">
              <span>0 - Muito mal</span>
              <span>10 - Muito bem</span>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveMood}
            disabled={isSaving}
            className="btn-primary w-full"
          >
            {saved ? '✓ Salvo!' : isSaving ? 'Salvando...' : t('home.saveToday', language as any)}
          </button>
        </div>

        {/* Breathing Stats */}
        {(lastBreath || weeklyBreaths > 0) && (
          <div className="card-spa p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wind className="w-5 h-5 text-serenity-600 dark:text-serenity-400" />
              <h3 className="font-bold text-spa-900 dark:text-spa-50">
                Suas Respirações
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {lastBreath && (
                <div className="bg-spa-50 dark:bg-spa-800/50 rounded-lg p-4">
                  <p className="text-xs text-spa-600 dark:text-spa-400 mb-1">
                    Última respiração
                  </p>
                  <p className="font-semibold text-spa-900 dark:text-spa-50">
                    {BREATH_MODES[lastBreath.mode as keyof typeof BREATH_MODES].name}
                  </p>
                  <p className="text-xs text-spa-500 dark:text-spa-500 mt-1">
                    {formatRelativeTime(lastBreath.created_at)}
                  </p>
                </div>
              )}
              
              <div className="bg-spa-50 dark:bg-spa-800/50 rounded-lg p-4">
                <p className="text-xs text-spa-600 dark:text-spa-400 mb-1">
                  Sessões na semana
                </p>
                <p className="text-2xl font-bold text-serenity-600 dark:text-serenity-400">
                  {weeklyBreaths}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/chat">
            <div className="card-spa p-6 text-center cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-ocean rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-spa-900 dark:text-spa-50 mb-1">
                {t('nav.chat', language as any)}
              </h3>
              {!isPremiumUser && (
                <span className="inline-flex items-center gap-1 text-xs text-warning">
                  <Sparkles className="w-3 h-3" />
                  Premium
                </span>
              )}
            </div>
          </Link>

          <Link href="/breathe">
            <div className="card-spa p-6 text-center cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-r from-serenity-400 to-serenity-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Wind className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-spa-900 dark:text-spa-50">
                {t('nav.breathe', language as any)}
              </h3>
            </div>
          </Link>

          <Link href="/sounds">
            <div className="card-spa p-6 text-center cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-spa-900 dark:text-spa-50">
                {t('nav.sounds', language as any)}
              </h3>
            </div>
          </Link>

          <Link href="/diary">
            <div className="card-spa p-6 text-center cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-r from-serenity-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-spa-900 dark:text-spa-50">
                Diário Emocional
              </h3>
            </div>
          </Link>

          <Link href="/crisis">
            <div className="card-spa p-6 text-center cursor-pointer group border-2 border-error/30">
              <div className="w-12 h-12 bg-error rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-error">
                {t('nav.crisis', language as any)}
              </h3>
            </div>
          </Link>

          {!isPremiumUser && (
            <Link href="/subscribe">
              <div className="card-spa p-6 text-center cursor-pointer group bg-gradient-ocean">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white">
                  {t('sub.upgrade', language as any)}
                </h3>
                <p className="text-xs text-white/80 mt-1">Trial 7 dias</p>
              </div>
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
