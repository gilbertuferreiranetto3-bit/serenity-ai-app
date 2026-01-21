'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, Phone, Wind, CheckCircle, Home } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { saveCrisisSession } from '@/lib/crisis'

type CrisisTool = 'breathe' | 'grounding' | 'plan' | null

export default function CrisisPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTool, setActiveTool] = useState<CrisisTool>(null)

  if (activeTool === 'breathe') {
    return <CrisisBreath onBack={() => setActiveTool(null)} onHome={() => router.push('/')} />
  }

  if (activeTool === 'grounding') {
    return <CrisisGrounding onBack={() => setActiveTool(null)} onHome={() => router.push('/')} />
  }

  if (activeTool === 'plan') {
    return <CrisisPlan onBack={() => setActiveTool(null)} onHome={() => router.push('/')} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-error/10 to-warning/10">
      {/* Header */}
      <header className="bg-white/80 dark:bg-spa-900/80 backdrop-blur-md border-b border-spa-200 dark:border-spa-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-spa-700 dark:text-spa-300 hover:text-spa-900 dark:hover:text-spa-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar para Home</span>
          </button>
          
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-error" />
            <h1 className="text-lg font-bold text-error">
              Modo Crise
            </h1>
          </div>
          
          <div className="w-32"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header Message */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-spa-900 dark:text-spa-50 mb-3">
            Você não está sozinho(a)
          </h2>
          <p className="text-lg text-spa-600 dark:text-spa-400">
            Vamos passar por isso em minutos.
          </p>
        </div>

        {/* Safety Box */}
        <div className="card-spa p-6 border-2 border-error/30 bg-error/5">
          <div className="flex items-start gap-3">
            <Phone className="w-6 h-6 text-error flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-error mb-2">
                Se você está em risco imediato, procure ajuda agora.
              </h3>
              <div className="space-y-1 text-sm text-spa-700 dark:text-spa-300">
                <p className="font-semibold">Brasil: CVV 188 (24h)</p>
                <p className="text-xs text-spa-600 dark:text-spa-400">
                  Atendimento gratuito e confidencial
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-spa-900 dark:text-spa-50 mb-4">
            Ferramentas de Apoio Imediato
          </h3>

          {/* Breathe 60s */}
          <button
            onClick={() => setActiveTool('breathe')}
            className="card-spa p-6 w-full text-left hover:scale-[1.02] transition-transform group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-serenity-400 to-serenity-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Wind className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-spa-900 dark:text-spa-50 mb-1">
                  Respirar 60 segundos
                </h4>
                <p className="text-sm text-spa-600 dark:text-spa-400">
                  Sessão rápida de respiração guiada para acalmar agora
                </p>
              </div>
            </div>
          </button>

          {/* Grounding 5-4-3-2-1 */}
          <button
            onClick={() => setActiveTool('grounding')}
            className="card-spa p-6 w-full text-left hover:scale-[1.02] transition-transform group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-spa-900 dark:text-spa-50 mb-1">
                  Grounding 5-4-3-2-1
                </h4>
                <p className="text-sm text-spa-600 dark:text-spa-400">
                  Técnica passo a passo para reconectar com o presente
                </p>
              </div>
            </div>
          </button>

          {/* Quick Plan */}
          <button
            onClick={() => setActiveTool('plan')}
            className="card-spa p-6 w-full text-left hover:scale-[1.02] transition-transform group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-serenity-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-spa-900 dark:text-spa-50 mb-1">
                  Plano Rápido
                </h4>
                <p className="text-sm text-spa-600 dark:text-spa-400">
                  Checklist simples de ações seguras para agora
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Info */}
        <div className="card-spa p-6 bg-spa-50 dark:bg-spa-800/50">
          <p className="text-sm text-spa-600 dark:text-spa-400 text-center">
            💙 Estas ferramentas são 100% gratuitas e sempre estarão disponíveis para você.
          </p>
        </div>
      </main>
    </div>
  )
}

// Componente: Respiração 60s
function CrisisBreath({ onBack, onHome }: { onBack: () => void; onHome: () => void }) {
  const { user } = useAuth()
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [phaseTime, setPhaseTime] = useState(3)
  const [totalTime, setTotalTime] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [completed, setCompleted] = useState(false)

  const protocol = { inhale: 3, hold: 1, exhale: 6 } // 3-1-6

  const handleStart = async () => {
    if (!user) return
    setIsActive(true)
    
    // Salvar início da sessão (não bloqueia o fluxo)
    saveCrisisSession(user.id, 'breathe').then(result => {
      if (!result.ok) {
        console.warn('Failed to save crisis session:', result.reason)
      }
    })
    
    startBreathingCycle()
  }

  const startBreathingCycle = () => {
    const interval = setInterval(() => {
      setPhaseTime((prev) => {
        if (prev <= 1) {
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
          setCompleted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const getPhaseLabel = () => {
    if (phase === 'inhale') return 'Inspire'
    if (phase === 'hold') return 'Segure'
    return 'Expire'
  }

  const getCircleScale = () => {
    if (phase === 'inhale') return 'scale-150'
    if (phase === 'exhale') return 'scale-75'
    return 'scale-100'
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-serenity flex items-center justify-center p-4">
        <div className="card-spa p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-serenity-400 to-serenity-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-2">
            Muito bem!
          </h2>
          
          <p className="text-spa-600 dark:text-spa-400 mb-8">
            Você completou 60 segundos de respiração guiada.
          </p>
          
          <div className="space-y-3">
            <button onClick={onBack} className="btn-primary w-full">
              Voltar ao Modo Crise
            </button>
            
            <button onClick={onHome} className="btn-secondary w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Ir para Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isActive) {
    return (
      <div className="min-h-screen bg-gradient-serenity flex items-center justify-center p-4">
        <div className="card-spa p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-serenity-400 to-serenity-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wind className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-2">
            Respirar 60 segundos
          </h2>
          
          <p className="text-spa-600 dark:text-spa-400 mb-8">
            Vamos fazer uma respiração rápida e eficaz para acalmar agora. Protocolo 3-1-6.
          </p>
          
          <div className="space-y-3">
            <button onClick={handleStart} className="btn-primary w-full">
              Começar Agora
            </button>
            
            <button onClick={onBack} className="btn-secondary w-full">
              Voltar
            </button>
            
            <button onClick={onHome} className="btn-secondary w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Ir para Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-serenity flex flex-col">
      <div className="bg-white/80 dark:bg-spa-900/80 backdrop-blur-md border-b border-spa-200 dark:border-spa-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={onHome}
            className="flex items-center gap-2 text-spa-700 dark:text-spa-300 hover:text-spa-900 dark:hover:text-spa-100 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </button>
          
          <div className="text-2xl font-bold text-spa-900 dark:text-spa-50">
            {totalTime}s
          </div>
          
          <div className="w-20"></div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-80 h-80 mx-auto mb-8">
            <div 
              className={`absolute inset-0 rounded-full bg-gradient-to-br from-serenity-400 to-serenity-600 
                transition-all duration-[${phase === 'inhale' ? 3 : phase === 'hold' ? 1 : 6}000ms] ease-in-out 
                ${getCircleScale()} opacity-80 blur-xl`}
            />
            <div 
              className={`absolute inset-0 rounded-full bg-gradient-to-br from-serenity-400 to-serenity-600 
                transition-all duration-[${phase === 'inhale' ? 3 : phase === 'hold' ? 1 : 6}000ms] ease-in-out 
                ${getCircleScale()} flex items-center justify-center shadow-2xl`}
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
        </div>
      </div>
    </div>
  )
}

// Componente: Grounding 5-4-3-2-1
function CrisisGrounding({ onBack, onHome }: { onBack: () => void; onHome: () => void }) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)

  const steps = [
    { title: '5 coisas que você VÊ', description: 'Olhe ao redor e identifique 5 coisas que você pode ver agora.' },
    { title: '4 coisas que você TOCA', description: 'Sinta 4 coisas que você pode tocar. A textura da roupa, o chão, uma mesa...' },
    { title: '3 coisas que você OUVE', description: 'Escute com atenção. Identifique 3 sons ao seu redor.' },
    { title: '2 coisas que você CHEIRA', description: 'Perceba 2 cheiros. Pode ser seu perfume, o ar, algo próximo...' },
    { title: '1 coisa que você SABOREIA', description: 'Concentre-se em 1 sabor na sua boca, ou tome um gole de água.' },
  ]

  const handleStart = async () => {
    if (!user) return
    setStarted(true)
    
    // Salvar início da sessão (não bloqueia o fluxo)
    saveCrisisSession(user.id, 'grounding').then(result => {
      if (!result.ok) {
        console.warn('Failed to save crisis session:', result.reason)
      }
    })
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      setCompleted(true)
    }
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-serenity flex items-center justify-center p-4">
        <div className="card-spa p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-2">
            Parabéns!
          </h2>
          
          <p className="text-spa-600 dark:text-spa-400 mb-8">
            Você completou o exercício de Grounding 5-4-3-2-1.
          </p>
          
          <div className="space-y-3">
            <button onClick={onBack} className="btn-primary w-full">
              Voltar ao Modo Crise
            </button>
            
            <button onClick={onHome} className="btn-secondary w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Ir para Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-serenity flex items-center justify-center p-4">
        <div className="card-spa p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-2">
            Grounding 5-4-3-2-1
          </h2>
          
          <p className="text-spa-600 dark:text-spa-400 mb-8">
            Esta técnica ajuda a reconectar você com o momento presente através dos seus sentidos.
          </p>
          
          <div className="space-y-3">
            <button onClick={handleStart} className="btn-primary w-full">
              Começar
            </button>
            
            <button onClick={onBack} className="btn-secondary w-full">
              Voltar
            </button>
            
            <button onClick={onHome} className="btn-secondary w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Ir para Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-serenity flex items-center justify-center p-4">
      <div className="card-spa p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-sm text-spa-600 dark:text-spa-400 mb-2">
            Passo {step + 1} de {steps.length}
          </div>
          <div className="w-full bg-spa-200 dark:bg-spa-800 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-3">
            {steps[step].title}
          </h3>
          <p className="text-spa-600 dark:text-spa-400">
            {steps[step].description}
          </p>
        </div>

        <div className="space-y-3">
          <button onClick={handleNext} className="btn-primary w-full">
            {step < steps.length - 1 ? 'Próximo' : 'Finalizar'}
          </button>
          
          <button onClick={onHome} className="btn-secondary w-full flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Ir para Home
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente: Plano Rápido
function CrisisPlan({ onBack, onHome }: { onBack: () => void; onHome: () => void }) {
  const { user } = useAuth()
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Beber um copo de água', checked: false },
    { id: 2, text: 'Relaxar os ombros e pescoço', checked: false },
    { id: 3, text: 'Nomear a emoção que estou sentindo', checked: false },
    { id: 4, text: 'Escolher 1 ação segura para agora', checked: false },
  ])
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)

  const handleStart = async () => {
    if (!user) return
    setStarted(true)
    
    // Salvar início da sessão (não bloqueia o fluxo)
    saveCrisisSession(user.id, 'plan').then(result => {
      if (!result.ok) {
        console.warn('Failed to save crisis session:', result.reason)
      }
    })
  }

  const toggleCheck = (id: number) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )
  }

  const allChecked = checklist.every(item => item.checked)

  const handleComplete = () => {
    setCompleted(true)
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-serenity flex items-center justify-center p-4">
        <div className="card-spa p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-serenity-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-2">
            Ótimo trabalho!
          </h2>
          
          <p className="text-spa-600 dark:text-spa-400 mb-8">
            Você completou o plano rápido de ações seguras.
          </p>
          
          <div className="space-y-3">
            <button onClick={onBack} className="btn-primary w-full">
              Voltar ao Modo Crise
            </button>
            
            <button onClick={onHome} className="btn-secondary w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Ir para Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-serenity flex items-center justify-center p-4">
        <div className="card-spa p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-serenity-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-2">
            Plano Rápido
          </h2>
          
          <p className="text-spa-600 dark:text-spa-400 mb-8">
            Um checklist simples de ações seguras que você pode fazer agora.
          </p>
          
          <div className="space-y-3">
            <button onClick={handleStart} className="btn-primary w-full">
              Começar
            </button>
            
            <button onClick={onBack} className="btn-secondary w-full">
              Voltar
            </button>
            
            <button onClick={onHome} className="btn-secondary w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Ir para Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-serenity flex items-center justify-center p-4">
      <div className="card-spa p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-2">
            Plano Rápido
          </h3>
          <p className="text-sm text-spa-600 dark:text-spa-400">
            Marque cada ação conforme você completa
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {checklist.map(item => (
            <button
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                item.checked 
                  ? 'border-serenity-500 bg-serenity-50 dark:bg-serenity-900/20' 
                  : 'border-spa-200 dark:border-spa-700 hover:border-spa-300 dark:hover:border-spa-600'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                item.checked 
                  ? 'border-serenity-500 bg-serenity-500' 
                  : 'border-spa-300 dark:border-spa-600'
              }`}>
                {item.checked && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
              <span className={`${
                item.checked 
                  ? 'text-spa-900 dark:text-spa-50 font-medium' 
                  : 'text-spa-700 dark:text-spa-300'
              }`}>
                {item.text}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleComplete}
            disabled={!allChecked}
            className={`w-full ${allChecked ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
          >
            {allChecked ? 'Concluir' : 'Complete todas as ações'}
          </button>
          
          <button onClick={onHome} className="btn-secondary w-full flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Ir para Home
          </button>
        </div>
      </div>
    </div>
  )
}
