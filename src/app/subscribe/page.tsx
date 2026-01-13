'use client'

import Link from 'next/link'
import { ArrowLeft, Crown, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function SubscribePage() {
  const { user, isPremiumUser } = useAuth()

  if (isPremiumUser) {
    return (
      <div className="min-h-screen bg-gradient-serenity flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card-spa p-8 text-center">
            <div className="w-20 h-20 bg-gradient-ocean rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-3">
              Você já é Premium! 🎉
            </h1>
            
            <p className="text-spa-600 dark:text-spa-400 mb-6">
              Aproveite todos os recursos ilimitados do Serenity AI.
            </p>

            <Link href="/home">
              <button className="btn-primary w-full">
                Voltar para Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-serenity py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/home" className="inline-flex items-center gap-2 text-serenity-600 dark:text-serenity-400 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient mb-3">
            Assine o Serenity AI Premium
          </h1>
          <p className="text-lg text-spa-600 dark:text-spa-400">
            7 dias grátis, depois escolha seu plano
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Plano Mensal */}
          <div className="card-spa p-8 border-2 border-serenity-300 dark:border-serenity-700">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-2">
                Mensal
              </h3>
              <div className="text-4xl font-bold text-gradient mb-2">
                R$ 49,90
              </div>
              <p className="text-sm text-spa-600 dark:text-spa-400">
                por mês
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-serenity-600 dark:text-serenity-400 flex-shrink-0 mt-0.5" />
                <span className="text-spa-700 dark:text-spa-300">Chat IA ilimitado</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-serenity-600 dark:text-serenity-400 flex-shrink-0 mt-0.5" />
                <span className="text-spa-700 dark:text-spa-300">Todos os sons premium</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-serenity-600 dark:text-serenity-400 flex-shrink-0 mt-0.5" />
                <span className="text-spa-700 dark:text-spa-300">Diário ilimitado</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-serenity-600 dark:text-serenity-400 flex-shrink-0 mt-0.5" />
                <span className="text-spa-700 dark:text-spa-300">Gráficos avançados</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-serenity-600 dark:text-serenity-400 flex-shrink-0 mt-0.5" />
                <span className="text-spa-700 dark:text-spa-300">Exportar dados</span>
              </li>
            </ul>

            <button className="btn-primary w-full">
              Começar Trial 7 Dias
            </button>
          </div>

          {/* Plano Anual */}
          <div className="card-spa p-8 border-2 border-warning bg-gradient-to-br from-warning/5 to-serenity-50 dark:from-warning/10 dark:to-serenity-950">
            <div className="inline-block bg-warning text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
              ECONOMIZE 33%
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-2">
                Anual
              </h3>
              <div className="text-4xl font-bold text-gradient mb-2">
                R$ 399
              </div>
              <p className="text-sm text-spa-600 dark:text-spa-400">
                por ano (R$ 33,25/mês)
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-serenity-600 dark:text-serenity-400 flex-shrink-0 mt-0.5" />
                <span className="text-spa-700 dark:text-spa-300">Tudo do plano mensal</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-serenity-600 dark:text-serenity-400 flex-shrink-0 mt-0.5" />
                <span className="text-spa-700 dark:text-spa-300 font-semibold">Economize R$ 200/ano</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-serenity-600 dark:text-serenity-400 flex-shrink-0 mt-0.5" />
                <span className="text-spa-700 dark:text-spa-300">Suporte prioritário</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-serenity-600 dark:text-serenity-400 flex-shrink-0 mt-0.5" />
                <span className="text-spa-700 dark:text-spa-300">Acesso antecipado a novos recursos</span>
              </li>
            </ul>

            <button className="btn-primary w-full bg-gradient-to-r from-warning to-serenity-500">
              Começar Trial 7 Dias
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="card-spa p-8">
          <h2 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-6">
            Perguntas Frequentes
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-spa-900 dark:text-spa-50 mb-2">
                Como funciona o trial de 7 dias?
              </h3>
              <p className="text-spa-600 dark:text-spa-400 text-sm">
                Você tem acesso completo a todos os recursos Premium por 7 dias gratuitamente. 
                Após o período, será cobrado automaticamente. Você pode cancelar a qualquer momento.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-spa-900 dark:text-spa-50 mb-2">
                Posso cancelar quando quiser?
              </h3>
              <p className="text-spa-600 dark:text-spa-400 text-sm">
                Sim! Você pode cancelar sua assinatura a qualquer momento. Você continuará tendo 
                acesso Premium até o final do período pago.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-spa-900 dark:text-spa-50 mb-2">
                Quais são as formas de pagamento?
              </h3>
              <p className="text-spa-600 dark:text-spa-400 text-sm">
                Aceitamos cartão de crédito via Stripe (web) e Apple Pay/Google Pay (apps mobile).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-spa-900 dark:text-spa-50 mb-2">
                Meus dados estão seguros?
              </h3>
              <p className="text-spa-600 dark:text-spa-400 text-sm">
                Sim! Usamos criptografia de ponta a ponta e não compartilhamos seus dados com terceiros. 
                Veja nossa <Link href="/privacy" className="text-serenity-600 dark:text-serenity-400 hover:underline">Política de Privacidade</Link>.
              </p>
            </div>
          </div>
        </div>

        {/* Nota sobre IAP */}
        <div className="mt-6 text-center text-sm text-spa-600 dark:text-spa-400">
          <p>
            💡 <strong>Nota:</strong> Pagamentos via Stripe (web) estão prontos. 
            Para apps iOS/Android, será necessário implementar Apple IAP e Google Play Billing.
          </p>
        </div>
      </div>
    </div>
  )
}
