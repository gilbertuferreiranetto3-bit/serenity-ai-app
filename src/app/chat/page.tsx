'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Send, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export default function ChatPage() {
  const { user, isPremiumUser } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!user) {
      router.push('/signin')
    }
  }, [user, router])

  // Scroll automático para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Carregar histórico de mensagens
  useEffect(() => {
    if (!user || !supabase) return

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50)

      if (!error && data) {
        setMessages(data)
      }
    }

    loadMessages()
  }, [user])

  const handleSendMessage = async () => {
    if (!input.trim() || !user || !supabase || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      // 🚨 VALIDAÇÃO DE LIMITE - Chamar RPC consume_chat_message
      const { data: limitCheck, error: limitError } = await supabase
        .rpc('consume_chat_message', { p_user_id: user.id })

      if (limitError) {
        console.error('Erro ao verificar limite:', limitError)
        throw new Error('Erro ao verificar limite de mensagens')
      }

      // Se allowed = false, mostrar modal de limite
      if (!limitCheck?.allowed) {
        setShowLimitModal(true)
        setIsLoading(false)
        return
      }

      // Adicionar mensagem do usuário
      const newUserMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, newUserMessage])

      // Salvar mensagem do usuário no banco
      await supabase.from('chat_messages').insert({
        user_id: user.id,
        role: 'user',
        content: userMessage,
        session_id: crypto.randomUUID()
      })

      // Simular resposta da IA (substituir por chamada real à API)
      setTimeout(async () => {
        const aiResponse: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Olá! Estou aqui para te ajudar. Como você está se sentindo hoje?',
          created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, aiResponse])

        // Salvar resposta da IA no banco
        await supabase.from('chat_messages').insert({
          user_id: user.id,
          role: 'assistant',
          content: aiResponse.content,
          session_id: crypto.randomUUID()
        })

        setIsLoading(false)
      }, 1000)

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setIsLoading(false)
      alert('Erro ao enviar mensagem. Tente novamente.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-serenity flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-spa-800/80 backdrop-blur-sm border-b border-spa-200 dark:border-spa-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/home">
            <button className="flex items-center gap-2 text-spa-700 dark:text-spa-300 hover:text-spa-900 dark:hover:text-spa-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h1 className="text-xl font-bold text-spa-900 dark:text-spa-50">
              Chat IA Empática
            </h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-2">
                Bem-vindo ao Chat IA
              </h2>
              <p className="text-spa-600 dark:text-spa-400">
                Converse com nossa IA empática sobre seus sentimentos e emoções
              </p>
              {!isPremiumUser && (
                <p className="text-sm text-spa-500 dark:text-spa-500 mt-4">
                  Plano gratuito: 5 mensagens por dia
                </p>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-ocean text-white'
                      : 'bg-white dark:bg-spa-800 text-spa-900 dark:text-spa-50 border border-spa-200 dark:border-spa-700'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-spa-800 border border-spa-200 dark:border-spa-700 rounded-2xl px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-spa-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-spa-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-spa-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input de mensagem */}
      <div className="bg-white/80 dark:bg-spa-800/80 backdrop-blur-sm border-t border-spa-200 dark:border-spa-700 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1 resize-none rounded-2xl px-4 py-3 bg-white dark:bg-spa-900 border border-spa-300 dark:border-spa-600 text-spa-900 dark:text-spa-50 placeholder-spa-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="btn-primary px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Limite Atingido */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-spa-800 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-3">
              Limite Atingido
            </h2>
            
            <p className="text-spa-600 dark:text-spa-400 mb-6">
              Você atingiu o limite grátis de <strong>5 mensagens por dia</strong>. 
              Assine o Premium para uso ilimitado.
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/subscribe">
                <button className="btn-primary w-full">
                  Assinar Premium
                </button>
              </Link>
              <button
                onClick={() => setShowLimitModal(false)}
                className="btn-secondary w-full"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
