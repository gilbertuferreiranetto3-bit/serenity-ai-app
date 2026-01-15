'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Pause, RotateCcw, Wind } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest'

const DURATIONS = {
  inhale: 4,
  hold: 4,
  exhale: 6,
  rest: 2
}

const PHASE_LABELS = {
  inhale: 'Inspire',
  hold: 'Segure',
  exhale: 'Expire',
  rest: 'Descanse'
}

export default function BreathePage() {
  const { user } = useAuth()
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<Phase>('inhale')
  const [timeLeft, setTimeLeft] = useState(DURATIONS.inhale)
  const [cycleCount, setCycleCount] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Avançar para próxima fase
          const nextPhase = getNextPhase(phase)
          setPhase(nextPhase)
          
          // Incrementar contador ao completar um ciclo
          if (nextPhase === 'inhale') {
            setCycleCount((c) => c + 1)
          }
          
          return DURATIONS[nextPhase]
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, phase])

  const getNextPhase = (current: Phase): Phase => {
    const sequence: Phase[] = ['inhale', 'hold', 'exhale', 'rest']
    const currentIndex = sequence.indexOf(current)
    return sequence[(currentIndex + 1) % sequence.length]
  }

  const handleStart = () => {
    setIsActive(true)
  }

  const handlePause = () => {
    setIsActive(false)
  }

  const handleReset = () => {
    setIsActive(false)
    setPhase('inhale')
    setTimeLeft(DURATIONS.inhale)
    setCycleCount(0)
  }

  const getCircleScale = () => {
    if (phase === 'inhale') return 'scale-150'
    if (phase === 'exhale') return 'scale-75'
    return 'scale-100'
  }

  const getCircleColor = () => {
    switch (phase) {
      case 'inhale': return 'from-blue-400 to-cyan-400'
      case 'hold': return 'from-serenity-400 to-serenity-600'
      case 'exhale': return 'from-purple-400 to-pink-400'
      case 'rest': return 'from-green-400 to-emerald-400'
    }
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
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="card-spa p-8 text-center">
          {/* Cycle Counter */}
          <div className="mb-8">
            <p className="text-sm text-spa-600 dark:text-spa-400 mb-1">
              Ciclos completados
            </p>
            <p className="text-3xl font-bold text-gradient">
              {cycleCount}
            </p>
          </div>

          {/* Breathing Circle */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            <div 
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${getCircleColor()} 
                transition-all duration-[${DURATIONS[phase]}000ms] ease-in-out ${getCircleScale()} 
                opacity-80 blur-xl`}
            />
            <div 
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${getCircleColor()} 
                transition-all duration-[${DURATIONS[phase]}000ms] ease-in-out ${getCircleScale()} 
                flex items-center justify-center shadow-2xl`}
            >
              <div className="text-center">
                <p className="text-white text-2xl font-bold mb-2">
                  {PHASE_LABELS[phase]}
                </p>
                <p className="text-white/90 text-5xl font-bold">
                  {timeLeft}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <p className="text-spa-700 dark:text-spa-300 text-lg">
              {phase === 'inhale' && 'Inspire profundamente pelo nariz'}
              {phase === 'hold' && 'Segure o ar nos pulmões'}
              {phase === 'exhale' && 'Expire lentamente pela boca'}
              {phase === 'rest' && 'Relaxe e prepare-se para o próximo ciclo'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            {!isActive ? (
              <button
                onClick={handleStart}
                className="btn-primary flex items-center gap-2 px-8"
              >
                <Play className="w-5 h-5" />
                Iniciar
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="btn-secondary flex items-center gap-2 px-8"
              >
                <Pause className="w-5 h-5" />
                Pausar
              </button>
            )}
            
            <button
              onClick={handleReset}
              className="btn-secondary flex items-center gap-2 px-8"
            >
              <RotateCcw className="w-5 h-5" />
              Reiniciar
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-serenity-50 dark:bg-serenity-900/30 border border-serenity-300 dark:border-serenity-700 rounded-xl p-4 text-left">
            <p className="text-sm font-semibold text-spa-700 dark:text-spa-300 mb-2">
              💡 Dica:
            </p>
            <p className="text-sm text-spa-600 dark:text-spa-400">
              Encontre um lugar tranquilo, sente-se confortavelmente e concentre-se apenas na sua respiração. 
              Este exercício ajuda a reduzir ansiedade e promover relaxamento profundo.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-6 card-spa p-6">
          <h3 className="font-bold text-spa-900 dark:text-spa-50 mb-3">
            Benefícios da Respiração Guiada
          </h3>
          <ul className="space-y-2 text-sm text-spa-600 dark:text-spa-400">
            <li className="flex items-start gap-2">
              <span className="text-serenity-600 dark:text-serenity-400">✓</span>
              <span>Reduz ansiedade e estresse imediatamente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-serenity-600 dark:text-serenity-400">✓</span>
              <span>Melhora a qualidade do sono</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-serenity-600 dark:text-serenity-400">✓</span>
              <span>Aumenta o foco e a concentração</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-serenity-600 dark:text-serenity-400">✓</span>
              <span>Promove sensação de calma e bem-estar</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
