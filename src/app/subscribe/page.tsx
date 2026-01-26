'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  const handleSubscribe = async (plan: string) => {
    setLoading(plan)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Assinar Premium</h1>
          <p className="text-xl text-gray-600">
            Desbloqueie recursos ilimitados e transforme sua jornada de bem-estar
          </p>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            Pagamento realizado com sucesso! Seu plano premium foi ativado.
          </div>
        )}

        {canceled && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            Pagamento cancelado. Você pode tentar novamente quando quiser.
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Mensal */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mensal</h2>
            <div className="text-3xl font-bold text-blue-600 mb-4">R$ 50,00</div>
            <p className="text-gray-600 mb-6">Cobrança recorrente mensal via cartão</p>
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading === 'monthly'}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'monthly' ? 'Processando...' : 'Assinar Mensal'}
            </button>
          </div>

          {/* Anual Cartão */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Anual</h2>
            <div className="text-3xl font-bold text-blue-600 mb-4">R$ 500,00</div>
            <p className="text-gray-600 mb-6">Cobrança recorrente anual via cartão</p>
            <button
              onClick={() => handleSubscribe('yearly_card')}
              disabled={loading === 'yearly_card'}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'yearly_card' ? 'Processando...' : 'Assinar Anual'}
            </button>
          </div>

          {/* Anual Pix */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200 hover:border-green-300 transition-colors relative">
            <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
              Mais Econômico
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Anual Pix</h2>
            <div className="text-3xl font-bold text-green-600 mb-4">R$ 475,00</div>
            <p className="text-gray-600 mb-6">Pagamento único via Pix (sem recorrência)</p>
            <button
              onClick={() => handleSubscribe('yearly_pix')}
              disabled={loading === 'yearly_pix'}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'yearly_pix' ? 'Processando...' : 'Assinar com Pix'}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500">
          <p>Suporte 24/7 • Cancelamento a qualquer momento • Sem taxas ocultas</p>
        </div>
      </div>
    </div>
  )
}