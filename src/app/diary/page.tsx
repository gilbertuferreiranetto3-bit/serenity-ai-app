'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { getTodayBR, getDailyUsage, incrementJournalUsed } from '@/lib/daily-usage'
import { ArrowLeft, Save, Smile, Meh, Frown, Heart, Sparkles, X, AlertCircle, Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'

type DiaryEntry = {
  id: string
  user_id: string
  mood: string | null
  tags: string[] | null
  content: string
  created_at: string
}

const MOODS = [
  { value: 'great', label: 'Ótimo', icon: Smile, color: 'text-green-500' },
  { value: 'good', label: 'Bem', icon: Heart, color: 'text-blue-500' },
  { value: 'neutral', label: 'Neutro', icon: Meh, color: 'text-yellow-500' },
  { value: 'bad', label: 'Mal', icon: Frown, color: 'text-orange-500' },
  { value: 'terrible', label: 'Péssimo', icon: AlertCircle, color: 'text-red-500' }
]

const SUGGESTED_TAGS = [
  'Ansiedade', 'Gratidão', 'Trabalho', 'Família', 'Relacionamento',
  'Saúde', 'Sono', 'Exercício', 'Meditação', 'Reflexão'
]

export default function DiaryPage() {
  const router = useRouter()
  const { user, isPremiumUser } = useAuth()
  
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [todayCount, setTodayCount] = useState(0)
  
  // Form state
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [customTag, setCustomTag] = useState('')
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Modal state
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/signin')
      return
    }

    loadEntries()
    loadTodayCount()
  }, [user, router])

  const loadTodayCount = async () => {
    if (!user) return

    try {
      const todayBR = getTodayBR()

      // Buscar journal_used de hoje (SEM incrementar, SEM criar linha)
      const usage = await getDailyUsage(user.id, todayBR)
      
      if (usage) {
        setTodayCount(usage.journal_used)
        console.log('📊 [Diary] Contador carregado (SEM incrementar):', {
          todayBR,
          chat_used: usage.chat_used,
          journal_used: usage.journal_used
        })
      } else {
        setTodayCount(0)
      }
    } catch (error: any) {
      console.error('Erro ao carregar contador diário:', error?.message || error)
      setTodayCount(0)
    }
  }

  const loadEntries = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setEntries(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar entradas:', error?.message || error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) {
      alert('Por favor, escreva algo antes de salvar.')
      return
    }

    // Se está editando, não verifica limite
    if (editingId) {
      await handleUpdate()
      return
    }

    setIsSaving(true)
    try {
      const todayBR = getTodayBR()

      // 🚨 VALIDAÇÃO DE LIMITE (antes de incrementar)
      const JOURNAL_LIMIT_FREE = 2
      if (!isPremiumUser && todayCount >= JOURNAL_LIMIT_FREE) {
        setShowLimitModal(true)
        setIsSaving(false)
        return
      }

      // ✅ INCREMENTAR journal_used SOMENTE AQUI (quando usuário salva entrada)
      const incrementResult = await incrementJournalUsed(user!.id, todayBR)
      
      if (!incrementResult.success) {
        console.error('Erro ao incrementar journal_used:', incrementResult.error)
        throw new Error('Erro ao registrar uso do diário')
      }

      // Atualizar contador local
      setTodayCount(incrementResult.after)

      // Inserir entrada
      const { error: insertError } = await supabase
        .from('diary_entries')
        .insert({
          user_id: user!.id,
          mood: selectedMood,
          tags: selectedTags.length > 0 ? selectedTags : null,
          content: content.trim()
        })

      if (insertError) throw insertError

      // Limpar formulário
      setSelectedMood(null)
      setSelectedTags([])
      setContent('')

      // Recarregar entradas
      await loadEntries()

      alert('Entrada salva com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar entrada:', error?.message || error)
      alert('Erro ao salvar entrada. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingId || !content.trim()) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('diary_entries')
        .update({
          mood: selectedMood,
          tags: selectedTags.length > 0 ? selectedTags : null,
          content: content.trim()
        })
        .eq('id', editingId)
        .eq('user_id', user!.id)

      if (error) throw error

      // Limpar formulário e modo de edição
      setEditingId(null)
      setSelectedMood(null)
      setSelectedTags([])
      setContent('')

      // Recarregar entradas
      await loadEntries()

      alert('Entrada atualizada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao atualizar entrada:', error?.message || error)
      alert('Erro ao atualizar entrada. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id)
    setSelectedMood(entry.mood)
    setSelectedTags(entry.tags || [])
    setContent(entry.content)
    
    // Scroll para o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setSelectedMood(null)
    setSelectedTags([])
    setContent('')
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)

      if (error) throw error

      // Recarregar entradas e contador
      await loadEntries()
      await loadTodayCount()
      setDeleteConfirmId(null)

      alert('Entrada excluída com sucesso!')
    } catch (error: any) {
      console.error('Erro ao excluir entrada:', error?.message || error)
      alert('Erro ao excluir entrada. Tente novamente.')
    }
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()])
      setCustomTag('')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMoodIcon = (mood: string | null) => {
    if (!mood) return null
    const moodData = MOODS.find(m => m.value === mood)
    if (!moodData) return null
    const Icon = moodData.icon
    return <Icon className={`w-5 h-5 ${moodData.color}`} />
  }

  const isLimitReached = !isPremiumUser && todayCount >= 2 && !editingId

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-serenity">
      {/* Header */}
      <header className="bg-white/80 dark:bg-spa-900/80 backdrop-blur-md border-b border-spa-200 dark:border-spa-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/home">
              <button className="w-10 h-10 bg-spa-200 dark:bg-spa-800 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                <ArrowLeft className="w-5 h-5 text-spa-700 dark:text-spa-300" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-spa-900 dark:text-spa-50">
                Diário Emocional
              </h1>
              <p className="text-xs text-spa-600 dark:text-spa-400">
                {isPremiumUser ? 'Ilimitado' : `Hoje: ${todayCount}/2`}
              </p>
            </div>
          </div>

          {!isPremiumUser && (
            <Link href="/subscribe">
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-ocean text-white rounded-full text-sm font-semibold hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
                Premium
              </button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Formulário */}
        <div className="card-spa p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-spa-900 dark:text-spa-50">
              {editingId ? 'Editar Entrada' : 'Nova Entrada'}
            </h2>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="text-sm text-spa-600 dark:text-spa-400 hover:text-spa-900 dark:hover:text-spa-50"
              >
                Cancelar
              </button>
            )}
          </div>

          {isLimitReached && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-warning">
                  Limite diário atingido (2/2)
                </p>
                <p className="text-xs text-spa-600 dark:text-spa-400 mt-1">
                  Você já criou 2 entradas hoje. Assine Premium para entradas ilimitadas.
                </p>
              </div>
            </div>
          )}

          {/* Humor */}
          <div>
            <label className="block text-sm font-semibold text-spa-700 dark:text-spa-300 mb-3">
              Como você está se sentindo? (opcional)
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((mood) => {
                const Icon = mood.icon
                const isSelected = selectedMood === mood.value
                return (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(isSelected ? null : mood.value)}
                    disabled={isLimitReached}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                      isSelected
                        ? 'border-serenity-500 bg-serenity-50 dark:bg-serenity-900/30'
                        : 'border-spa-200 dark:border-spa-700 hover:border-spa-300 dark:hover:border-spa-600'
                    } ${isLimitReached ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Icon className={`w-4 h-4 ${mood.color}`} />
                    <span className="text-sm font-medium text-spa-900 dark:text-spa-50">
                      {mood.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-spa-700 dark:text-spa-300 mb-3">
              Tags (opcional)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    disabled={isLimitReached}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      isSelected
                        ? 'bg-serenity-500 text-white'
                        : 'bg-spa-100 dark:bg-spa-800 text-spa-700 dark:text-spa-300 hover:bg-spa-200 dark:hover:bg-spa-700'
                    } ${isLimitReached ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>

            {/* Custom tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                placeholder="Adicionar tag personalizada..."
                disabled={isLimitReached}
                className="flex-1 px-4 py-2 bg-spa-50 dark:bg-spa-800 border border-spa-200 dark:border-spa-700 rounded-lg text-spa-900 dark:text-spa-50 text-sm focus:outline-none focus:ring-2 focus:ring-serenity-500 disabled:opacity-50"
              />
              <button
                onClick={addCustomTag}
                disabled={isLimitReached}
                className="px-4 py-2 bg-spa-200 dark:bg-spa-700 text-spa-900 dark:text-spa-50 rounded-lg text-sm font-semibold hover:bg-spa-300 dark:hover:bg-spa-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>

            {/* Selected tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-serenity-500 text-white rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => toggleTag(tag)}
                      disabled={isLimitReached}
                      className="hover:bg-white/20 rounded-full p-0.5 disabled:cursor-not-allowed"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div>
            <label className="block text-sm font-semibold text-spa-700 dark:text-spa-300 mb-3">
              O que você gostaria de registrar? *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva seus pensamentos, sentimentos, reflexões..."
              rows={8}
              disabled={isLimitReached}
              className="w-full px-4 py-3 bg-spa-50 dark:bg-spa-800 border border-spa-200 dark:border-spa-700 rounded-lg text-spa-900 dark:text-spa-50 focus:outline-none focus:ring-2 focus:ring-serenity-500 resize-none disabled:opacity-50"
            />
          </div>

          {/* Botão Salvar */}
          <button
            onClick={handleSave}
            disabled={isSaving || !content.trim() || isLimitReached}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Salvar Entrada'}
          </button>
        </div>

        {/* Entradas Anteriores */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-spa-900 dark:text-spa-50">
            Entradas Anteriores
          </h2>

          {isLoading ? (
            <div className="card-spa p-8 text-center">
              <p className="text-spa-600 dark:text-spa-400">Carregando...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="card-spa p-8 text-center">
              <p className="text-spa-600 dark:text-spa-400">
                Nenhuma entrada ainda. Comece escrevendo acima!
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="card-spa p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getMoodIcon(entry.mood)}
                    <span className="text-xs text-spa-500 dark:text-spa-500">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 hover:bg-spa-100 dark:hover:bg-spa-800 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4 text-spa-600 dark:text-spa-400" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(entry.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-spa-100 dark:bg-spa-800 text-spa-700 dark:text-spa-300 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-spa-700 dark:text-spa-300 whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal Limite Atingido */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-spa-900 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-xl font-bold text-spa-900 dark:text-spa-50 mb-2">
                Limite Grátis Atingido
              </h3>
              <p className="text-spa-600 dark:text-spa-400">
                Você atingiu o limite de 2 entradas por dia. Assine o Premium para entradas ilimitadas!
              </p>
            </div>

            <div className="space-y-2">
              <Link href="/subscribe">
                <button className="btn-primary w-full flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Assinar Premium (Ilimitado)
                </button>
              </Link>
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full px-4 py-3 text-spa-700 dark:text-spa-300 font-semibold rounded-lg hover:bg-spa-100 dark:hover:bg-spa-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-spa-900 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-spa-900 dark:text-spa-50 mb-2">
                Excluir Entrada?
              </h3>
              <p className="text-spa-600 dark:text-spa-400">
                Esta ação não pode ser desfeita. Tem certeza que deseja excluir esta entrada?
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="w-full px-4 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                Sim, Excluir
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="w-full px-4 py-3 text-spa-700 dark:text-spa-300 font-semibold rounded-lg hover:bg-spa-100 dark:hover:bg-spa-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
