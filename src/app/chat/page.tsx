'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Send, ArrowLeft, Sparkles, AlertCircle, Crown } from 'lucide-react'
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
  const [isSending, setIsSending] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null)
  const [chatLimit, setChatLimit] = useState(5)
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
    if (!input.trim() || !user || !supabase || isLoading || isSending) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)
    setIsSending(true)

    try {
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

      // 🤖 CHAMAR API DO CHAT (com token de autenticação)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }

      const messagesToSend = messages.map(m => ({
        role: m.role,
        content: m.content
      }))
      
      messagesToSend.push({
        role: 'user',
        content: userMessage
      })

      console.log('📤 [Chat Frontend] Enviando para API:', {
        url: '/api/chat',
        method: 'POST',
        messagesCount: messagesToSend.length,
        lastMessage: userMessage.substring(0, 50)
      })

      // ✅ FETCH COM URL RELATIVA (NUNCA ABSOLUTA)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ messages: messagesToSend })
      })

      // ✅ LEITURA SEGURA: Pegar content-type e texto bruto primeiro
      const contentType = res.headers.get('content-type') || ''
      const raw = await res.text()

      console.log('📥 [Chat Frontend] Resposta recebida:', {
        status: res.status,
        statusText: res.statusText,
        contentType,
        rawPreview: raw.substring(0, 200)
      })

      // ✅ TENTAR FAZER PARSE APENAS SE FOR JSON
      let data: any = null
      try {
        if (contentType.includes('application/json')) {
          data = JSON.parse(raw)
        }
      } catch (parseError) {
        console.error('❌ [Chat Frontend] Erro ao fazer parse de JSON:', parseError)
      }

      // ❌ SE NÃO CONSEGUIU FAZER PARSE OU VEIO HTML
      if (!data) {
        console.error('❌ [Chat Frontend] API retornou não-JSON:', {
          contentType,
          raw: raw.slice(0, 300)
        })
        throw new Error('Erro de comunicação com o servidor. Por favor, tente novamente.')
      }

      // ❌ SE STATUS NÃO FOR OK
      if (!res.ok) {
        console.error('❌ [Chat Frontend] Chat API failed:', {
          status: res.status,
          statusText: res.statusText,
          contentType: contentType,
          rawPreview: raw.slice(0, 300),
          parsedData: data
        })

        // 🚨 LIMITE ATINGIDO
        if (res.status === 429 || data.error === 'LIMIT_REACHED') {
          console.warn('⚠️ [Chat Frontend] Limite atingido:', data)
          setShowLimitModal(true)
          setRemainingMessages(0)
          setIsLoading(false)
          setIsSending(false)
          return
        }

        // ❌ OUTROS ERROS
        const errorMessage = data?.error?.message || data?.message || 'Erro ao processar sua mensagem'
        throw new Error(errorMessage)
      }

      // ✅ VALIDAR SE DATA TEM CONTEÚDO
      if (!data) {
        throw new Error('Servidor retornou resposta vazia')
      }

      const { reply, remaining, limit } = data

      console.log('✅ [Chat Frontend] Resposta processada:', {
        replyLength: reply?.length || 0,
        preview: reply?.substring(0, 100) || '',
        remaining
      })

      // Validar resposta
      if (!reply) {
        throw new Error('Servidor não retornou resposta válida')
      }

      // Atualizar contador
      if (remaining !== undefined && remaining !== -1) {
        setRemainingMessages(remaining)
        setChatLimit(limit || 5)
      } else if (remaining === -1) {
        setRemainingMessages(null) // Premium (ilimitado)
      }

      // Adicionar resposta da IA
      const aiResponse: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, aiResponse])

      // Salvar resposta da IA no banco
      await supabase.from('chat_messages').insert({
        user_id: user.id,
        role: 'assistant',
        content: reply,
        session_id: crypto.randomUUID()
      })

      setIsLoading(false)
      setIsSending(false)

    } catch (error: any) {
      console.error('❌ [Chat Frontend] Erro ao enviar mensagem:', {
        message: error.message,
        stack: error.stack
      })
      setIsLoading(false)
      setIsSending(false)
      
      // Mensagem amigável para o usuário
      let friendlyMessage = error.message || 'Erro desconhecido ao processar sua mensagem.'
      
      // Personalizar mensagens de erro
      if (error.message.includes('HTML em vez de JSON') || error.message.includes('comunicação com o servidor')) {
        friendlyMessage = 'Erro de comunicação com o servidor. Verifique sua conexão e tente novamente.'
      } else if (error.message.includes('Sessão expirada')) {
        friendlyMessage = 'Sua sessão expirou. Por favor, faça login novamente.'
      } else if (error.message.includes('OPENAI_API_KEY')) {
        friendlyMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.'
      }
      
      setErrorMessage(friendlyMessage)
      setShowErrorModal(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!user) {
    return null
  }

  // Exibir contador
  const displayRemaining = isPremiumUser 
    ? '∞' 
    : remainingMessages !== null 
      ? remainingMessages 
      : chatLimit

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
          <div className="flex items-center gap-2">
            {isPremiumUser ? (
              <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                <Crown className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white">Ilimitado</span>
              </div>
            ) : (
              <div className="text-sm text-spa-600 dark:text-spa-400">
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {displayRemaining}
                </span>
                {' '}restantes
              </div>
            )}
          </div>
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
                  Plano gratuito: {chatLimit} mensagens por dia
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
              disabled={isSending}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isSending}
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
              Você atingiu o limite grátis de <strong>{chatLimit} mensagens por dia</strong>. 
              Assine o Premium para uso ilimitado.
            </p>

            <div className="bg-spa-50 dark:bg-spa-900/50 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-spa-700 dark:text-spa-300 mb-2">
                ✨ Com Premium você tem:
              </p>
              <ul className="text-sm text-spa-600 dark:text-spa-400 space-y-1 text-left">
                <li>• Chat ilimitado com IA empática</li>
                <li>• Acesso a todos os sons premium</li>
                <li>• Recursos exclusivos</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/subscribe">
                <button className="btn-primary w-full flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5" />
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

      {/* Modal de Erro */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-spa-800 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-3">
              Ops! Algo deu errado
            </h2>
            
            <p className="text-spa-600 dark:text-spa-400 mb-6">
              {errorMessage}
            </p>

            <button
              onClick={() => setShowErrorModal(false)}
              className="btn-primary w-full"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
