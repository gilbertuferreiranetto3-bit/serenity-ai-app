'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { t } from '@/lib/i18n'
import { AlertCircle, Heart, Phone, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CrisisPage() {
  const { language } = useAuth()
  const [step, setStep] = useState(0)

  const groundingSteps = [
    {
      title: '5 coisas que você VEJA',
      description: 'Olhe ao redor e identifique 5 coisas que você pode ver. Diga em voz alta.',
      icon: '👀'
    },
    {
      title: '4 coisas que você TOQUE',
      description: 'Toque em 4 objetos diferentes. Sinta a textura, temperatura.',
      icon: '✋'
    },
    {
      title: '3 coisas que você OUÇA',
      description: 'Pare e escute. Identifique 3 sons ao seu redor.',
      icon: '👂'
    },
    {
      title: '2 coisas que você CHEIRE',
      description: 'Identifique 2 cheiros. Pode ser perfume, comida, ar fresco.',
      icon: '👃'
    },
    {
      title: '1 coisa que você SABOREIE',
      description: 'Beba água, coma algo. Preste atenção no sabor.',
      icon: '👅'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-serenity py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/home" className="inline-flex items-center gap-2 text-serenity-600 dark:text-serenity-400 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Home
        </Link>

        {/* Header de Emergência */}
        <div className="card-spa p-8 mb-6 border-2 border-error/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-error rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-spa-900 dark:text-spa-50">
                {t('crisis.title', language as any)}
              </h1>
              <p className="text-spa-600 dark:text-spa-400">
                {t('crisis.subtitle', language as any)}
              </p>
            </div>
          </div>

          {/* Contatos de Emergência */}
          <div className="bg-error/10 border border-error/30 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 text-error flex-shrink-0" />
              <div>
                <p className="font-semibold text-spa-900 dark:text-spa-50">
                  Brasil - CVV (Centro de Valorização da Vida)
                </p>
                <a href="tel:188" className="text-2xl font-bold text-error hover:underline">
                  188
                </a>
                <p className="text-sm text-spa-600 dark:text-spa-400">
                  Ligação gratuita, 24 horas, todos os dias
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 text-error flex-shrink-0" />
              <div>
                <p className="font-semibold text-spa-900 dark:text-spa-50">
                  SAMU - Emergência Médica
                </p>
                <a href="tel:192" className="text-2xl font-bold text-error hover:underline">
                  192
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 text-error flex-shrink-0" />
              <div>
                <p className="font-semibold text-spa-900 dark:text-spa-50">
                  Caps (Centro de Atenção Psicossocial)
                </p>
                <p className="text-sm text-spa-600 dark:text-spa-400">
                  Procure a unidade mais próxima
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Técnica de Grounding 5-4-3-2-1 */}
        <div className="card-spa p-8">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-8 h-8 text-serenity-600 dark:text-serenity-400" />
            <h2 className="text-2xl font-bold text-spa-900 dark:text-spa-50">
              Técnica de Grounding (5-4-3-2-1)
            </h2>
          </div>

          <p className="text-spa-600 dark:text-spa-400 mb-6">
            Esta técnica ajuda a trazer você de volta ao momento presente quando estiver em crise de ansiedade ou pânico.
          </p>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {groundingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-full h-2 rounded-full mx-1 transition-colors ${
                    index <= step ? 'bg-serenity-500' : 'bg-spa-200 dark:bg-spa-800'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-spa-600 dark:text-spa-400">
              Passo {step + 1} de {groundingSteps.length}
            </p>
          </div>

          {/* Current Step */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-pulse-soft">
              {groundingSteps[step].icon}
            </div>
            <h3 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-3">
              {groundingSteps[step].title}
            </h3>
            <p className="text-lg text-spa-700 dark:text-spa-300">
              {groundingSteps[step].description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary flex-1"
              >
                Anterior
              </button>
            )}
            {step < groundingSteps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="btn-primary flex-1"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={() => setStep(0)}
                className="btn-primary flex-1"
              >
                Recomeçar
              </button>
            )}
          </div>
        </div>

        {/* Mensagem de Apoio */}
        <div className="card-spa p-6 mt-6 bg-serenity-50 dark:bg-serenity-950/30 border-2 border-serenity-300 dark:border-serenity-700">
          <p className="text-center text-spa-800 dark:text-spa-200 font-medium">
            💙 Você não está sozinho(a). Esta crise vai passar. Respire fundo e busque ajuda profissional.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-center text-sm text-spa-600 dark:text-spa-400">
          <p>
            {t('compliance.disclaimer', language as any)}
          </p>
        </div>
      </div>
    </div>
  )
}
