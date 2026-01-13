import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-serenity py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/consent" className="inline-flex items-center gap-2 text-serenity-600 dark:text-serenity-400 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="card-spa p-8">
          <h1 className="text-3xl font-bold text-spa-900 dark:text-spa-50 mb-6">
            Termos de Uso - Serenity AI
          </h1>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-spa-700 dark:text-spa-300">
            <p className="text-sm text-spa-600 dark:text-spa-400">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                1. Aceitação dos Termos
              </h2>
              <p>
                Ao acessar e usar o Serenity AI, você concorda com estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não use o aplicativo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                2. Natureza do Serviço
              </h2>
              <p className="font-semibold text-warning">
                IMPORTANTE: O Serenity AI é um aplicativo de bem-estar emocional e NÃO é um serviço médico, 
                psicológico ou terapêutico.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Não diagnosticamos condições de saúde mental</li>
                <li>Não prescrevemos tratamentos</li>
                <li>Não substituímos atendimento profissional</li>
                <li>Não oferecemos aconselhamento médico ou psicológico</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                3. Uso Adequado
              </h2>
              <p>O Serenity AI oferece:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Apoio emocional através de IA empática</li>
                <li>Ferramentas de relaxamento (sons, respiração guiada)</li>
                <li>Diário emocional para autoconhecimento</li>
                <li>Recursos de bem-estar e mindfulness</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                4. Emergências e Crises
              </h2>
              <p className="font-semibold text-error">
                Em caso de emergência, pensamentos suicidas ou crise grave, procure ajuda profissional imediata:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Brasil: CVV 188 (24 horas, gratuito)</li>
                <li>SAMU: 192</li>
                <li>Procure o hospital mais próximo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                5. Assinatura e Pagamentos
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Oferecemos plano gratuito com funcionalidades limitadas</li>
                <li>Plano Premium com trial de 7 dias</li>
                <li>Renovação automática (pode ser cancelada a qualquer momento)</li>
                <li>Reembolsos seguem política da loja (Apple/Google) ou Stripe</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                6. Propriedade Intelectual
              </h2>
              <p>
                Todo o conteúdo do Serenity AI (textos, design, código, áudios) é propriedade de Tauany Polak 
                e está protegido por direitos autorais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                7. Limitação de Responsabilidade
              </h2>
              <p>
                O Serenity AI é fornecido "como está". Não nos responsabilizamos por:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Decisões tomadas com base no uso do app</li>
                <li>Resultados de saúde mental ou emocional</li>
                <li>Interrupções no serviço</li>
                <li>Perda de dados (recomendamos backup regular)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                8. Modificações
              </h2>
              <p>
                Podemos atualizar estes termos a qualquer momento. Mudanças significativas serão notificadas 
                no aplicativo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                9. Contato
              </h2>
              <p>
                Para dúvidas sobre estes termos: <a href="mailto:contato@serenityai.app" className="text-serenity-600 dark:text-serenity-400 hover:underline">contato@serenityai.app</a>
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-spa-200 dark:border-spa-800">
              <p className="text-sm text-spa-600 dark:text-spa-400">
                Fundadora: Tauany Polak<br />
                "Conectando a tecnologia com a cura emocional."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
