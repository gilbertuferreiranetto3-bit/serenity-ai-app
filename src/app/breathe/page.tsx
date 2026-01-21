'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Wind, Clock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { BREATH_MODES, type BreathMode } from '@/lib/breathing'

export default function BreathePage() {
  const { user } = useAuth()
  const [selectedMode, setSelectedMode] = useState<BreathMode | null>(null)

  if (selectedMode) {
    return <BreathSession mode={selectedMode} onBack={() => setSelectedMode(null)} />
  }

  return (
    <div className="min-h-screen bg-gradient-serenity">
      {/* Header */}
      <header className="bg-white/80 dark:bg-spa-900/80 backdrop-blur-md border-b border-spa-200 dark:border-spa-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/home">
            <button className="flex items-center gap-2 text-spa-700 dark:text-spa-300 hover:text-spa-900 dark:hover:text-spa-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-serenity-600 dark:text-serenity-400" />
            <h1 className="text-lg font-bold text-spa-900 dark:text-spa-50">
              Respiração Guiada
            </h1>
          </div>
          
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-spa-900 dark:text-spa-50 mb-3">
            Escolha seu modo de respiração
          </h2>
          <p className="text-spa-600 dark:text-spa-400">
            Selecione o protocolo ideal para o seu momento
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {Object.entries(BREATH_MODES).map(([key, mode]) => (
            <button
              key={key}
              onClick={() => setSelectedMode(key as BreathMode)}
              className="card-spa p-6 text-left hover:scale-105 transition-transform group"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${mode.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Wind className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-spa-900 dark:text-spa-50 mb-2">
                {mode.name}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-spa-600 dark:text-spa-400 mb-3">
                <Clock className="w-4 h-4" />
                <span>{Math.floor(mode.duration / 60)} minutos</span>
              </div>
              
              <p className="text-sm text-spa-600 dark:text-spa-400 mb-3">
                {mode.description}
              </p>
              
              <div className="flex gap-2 text-xs text-spa-500 dark:text-spa-500">
                <span className="bg-spa-100 dark:bg-spa-800 px-2 py-1 rounded">
                  Inspire: {mode.protocol.inhale}s
                </span>
                <span className="bg-spa-100 dark:bg-spa-800 px-2 py-1 rounded">
                  Segure: {mode.protocol.hold}s
                </span>
                <span className="bg-spa-100 dark:bg-spa-800 px-2 py-1 rounded">
                  Expire: {mode.protocol.exhale}s
                </span>
              </div>
              
              {mode.warning && (
                <div className="mt-3 flex items-start gap-2 text-xs text-warning">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{mode.warning}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="card-spa p-6">
          <h3 className="font-bold text-spa-900 dark:text-spa-50 mb-3">
            💡 Dicas para melhor experiência
          </h3>
          <ul className="space-y-2 text-sm text-spa-600 dark:text-spa-400">
            <li className="flex items-start gap-2">
              <span className="text-serenity-600 dark:text-serenity-400">•</span>
              <span>Encontre um lugar tranquilo e confortável</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-serenity-600 dark:text-serenity-400">•</span>
              <span>Sente-se com a coluna ereta ou deite-se</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-serenity-600 dark:text-serenity-400">•</span>
              <span>Concentre-se apenas na sua respiração</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-serenity-600 dark:text-serenity-400">•</span>
              <span>Se sentir desconforto, pare e respire normalmente</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}

// Componente de Sessão
function BreathSession({ mode, onBack }: { mode: BreathMode; onBack: () => void }) {
  const { user } = useAuth()
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [phaseTime, setPhaseTime] = useState(BREATH_MODES[mode].protocol.inhale)
  const [totalTime, setTotalTime] = useState(BREATH_MODES[mode].duration)
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showComplete, setShowComplete] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  const protocol = BREATH_MODES[mode].protocol

  // Iniciar sessão
  const handleStart = async () => {
    if (!user) return
    
    setIsActive(true)
    setStartTime(Date.now())
    
    // Criar registro no Supabase
    const { createBreathingSession } = await import('@/lib/breathing')
    const session = await createBreathingSession(user.id, mode)
    if (session) {
      setSessionId(session.id)
    }
    
    startBreathingCycle()
  }

  const startBreathingCycle = () => {
    const interval = setInterval(() => {
      setPhaseTime((prev) => {
        if (prev <= 1) {
          // Mudar fase
          setPhase((currentPhase) => {
            if (currentPhase === 'inhale') {
              setPhaseTime(protocol.hold)
              return 'hold'
            } else if (currentPhase === 'hold') {
              setPhaseTime(protocol.exhale)
              return 'exhale'
            } else {
              setPhaseTime(protocol.inhale)
              return 'inhale'
            }
          })
          return prev
        }
        return prev - 1
      })

      setTotalTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setShowComplete(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleFinish = () => {
    setShowComplete(true)
  }

  const getPhaseLabel = () => {
    if (phase === 'inhale') return 'Inspire'
    if (phase === 'hold') return 'Segure'
    return 'Expire'
  }

  const getPhaseInstruction = () => {
    if (phase === 'inhale') return 'Inspire profundamente pelo nariz'
    if (phase === 'hold') return 'Segure o ar nos pulmões'
    return 'Expire lentamente pela boca'
  }

  const getCircleScale = () => {
    if (phase === 'inhale') return 'scale-150'
    if (phase === 'exhale') return 'scale-75'
    return 'scale-100'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (showComplete) {
    return <BreathComplete 
      mode={mode} 
      sessionId={sessionId} 
      startTime={startTime}
      onBack={onBack} 
    />
  }

  if (!isActive) {
    return (
      <div className="min-h-screen bg-gradient-serenity flex items-center justify-center p-4">
        <div className="card-spa p-8 max-w-md w-full text-center">
          <div className={`w-24 h-24 bg-gradient-to-br ${BREATH_MODES[mode].color} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <Wind className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-2">
            {BREATH_MODES[mode].name}
          </h2>
          
          <p className="text-spa-600 dark:text-spa-400 mb-6">
            {BREATH_MODES[mode].description}
          </p>
          
          {BREATH_MODES[mode].warning && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-6 flex items-start gap-2 text-left">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm text-spa-700 dark:text-spa-300">
                {BREATH_MODES[mode].warning}
              </p>
            </div>
          )}
          
          <button onClick={handleStart} className="btn-primary w-full mb-3">
            Iniciar Sessão
          </button>
          
          <button onClick={onBack} className="btn-secondary w-full">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-serenity flex flex-col">
      {/* Timer Header */}
      <div className="bg-white/80 dark:bg-spa-900/80 backdrop-blur-md border-b border-spa-200 dark:border-spa-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-spa-600 dark:text-spa-400 text-sm">
            {BREATH_MODES[mode].name}
          </div>
          <div className="text-2xl font-bold text-spa-900 dark:text-spa-50">
            {formatTime(totalTime)}
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Main Breathing Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          {/* Breathing Circle */}
          <div className="relative w-80 h-80 mx-auto mb-8">
            <div 
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${BREATH_MODES[mode].color} 
                transition-all duration-[${phase === 'inhale' ? protocol.inhale : phase === 'hold' ? protocol.hold : protocol.exhale}000ms] ease-in-out 
                ${!isPaused ? getCircleScale() : ''} opacity-80 blur-xl`}
            />
            <div 
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${BREATH_MODES[mode].color} 
                transition-all duration-[${phase === 'inhale' ? protocol.inhale : phase === 'hold' ? protocol.hold : protocol.exhale}000ms] ease-in-out 
                ${!isPaused ? getCircleScale() : ''} flex items-center justify-center shadow-2xl`}
            >
              <div className="text-center">
                <p className="text-white text-3xl font-bold mb-2">
                  {getPhaseLabel()}
                </p>
                <p className="text-white/90 text-6xl font-bold">
                  {phaseTime}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-spa-700 dark:text-spa-300 text-xl mb-8">
            {getPhaseInstruction()}
          </p>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            {!isPaused ? (
              <button onClick={handlePause} className="btn-secondary px-8">
                Pausar
              </button>
            ) : (
              <button onClick={handleResume} className="btn-primary px-8">
                Continuar
              </button>
            )}
            
            <button onClick={handleFinish} className="btn-secondary px-8">
              Finalizar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de Conclusão
function BreathComplete({ 
  mode, 
  sessionId, 
  startTime,
  onBack 
}: { 
  mode: BreathMode
  sessionId: string | null
  startTime: number | null
  onBack: () => void 
}) {
  const [feedback, setFeedback] = useState<'better' | 'same' | 'worse' | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleFeedback = async (value: 'better' | 'same' | 'worse') => {
    setFeedback(value)
    setIsSaving(true)

    if (sessionId && startTime) {
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000)
      const { completeBreathingSession } = await import('@/lib/breathing')
      await completeBreathingSession(sessionId, durationSeconds, value)
    }

    setIsSaving(false)
    
    // Aguardar 2 segundos e voltar
    setTimeout(() => {
      onBack()
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-serenity flex items-center justify-center p-4">
      <div className="card-spa p-8 max-w-md w-full text-center">
        <div className={`w-24 h-24 bg-gradient-to-br ${BREATH_MODES[mode].color} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <Wind className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-2">
          Sessão Concluída!
        </h2>
        
        <p className="text-spa-600 dark:text-spa-400 mb-8">
          Como você está se sentindo agora?
        </p>
        
        {!feedback ? (
          <div className="space-y-3">
            <button 
              onClick={() => handleFeedback('better')}
              className="btn-primary w-full"
            >
              😊 Melhor
            </button>
            <button 
              onClick={() => handleFeedback('same')}
              className="btn-secondary w-full"
            >
              😐 Igual
            </button>
            <button 
              onClick={() => handleFeedback('worse')}
              className="btn-secondary w-full"
            >
              😔 Pior
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg text-spa-700 dark:text-spa-300 mb-4">
              {isSaving ? 'Salvando...' : '✓ Feedback registrado!'}
            </p>
            <p className="text-sm text-spa-600 dark:text-spa-400">
              Redirecionando...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
