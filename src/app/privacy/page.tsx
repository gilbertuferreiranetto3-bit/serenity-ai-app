import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-serenity py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/consent" className="inline-flex items-center gap-2 text-serenity-600 dark:text-serenity-400 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="card-spa p-8">
          <h1 className="text-3xl font-bold text-spa-900 dark:text-spa-50 mb-6">
            Política de Privacidade - Serenity AI
          </h1>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-spa-700 dark:text-spa-300">
            <p className="text-sm text-spa-600 dark:text-spa-400">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                1. Informações que Coletamos
              </h2>
              <p>Para fornecer nossos serviços, coletamos:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Dados de cadastro:</strong> nome, e-mail, idioma preferido</li>
                <li><strong>Dados de uso:</strong> registros de humor, conversas com IA, entradas de diário</li>
                <li><strong>Dados de assinatura:</strong> status do plano, histórico de pagamentos</li>
                <li><strong>Dados técnicos:</strong> tipo de dispositivo, sistema operacional, logs de erro</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                2. Como Usamos Seus Dados
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Personalizar sua experiência (memória da IA, preferências)</li>
                <li>Processar pagamentos e gerenciar assinaturas</li>
                <li>Enviar notificações importantes sobre o serviço</li>
                <li>Analisar uso agregado para melhorias (dados anonimizados)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                3. Compartilhamento de Dados
              </h2>
              <p className="font-semibold text-serenity-600 dark:text-serenity-400">
                Nós NÃO vendemos seus dados pessoais.
              </p>
              <p className="mt-3">Compartilhamos dados apenas com:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Provedores de serviço:</strong> Supabase (banco de dados), Stripe (pagamentos), OpenAI (IA)</li>
                <li><strong>Lojas de apps:</strong> Apple e Google para processar assinaturas</li>
                <li><strong>Autoridades legais:</strong> quando exigido por lei</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                4. Segurança dos Dados
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
                <li>Criptografia de dados em repouso</li>
                <li>Senhas protegidas com hash bcrypt</li>
                <li>Acesso restrito aos dados (Row Level Security)</li>
                <li>Backups regulares e seguros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                5. Seus Direitos (LGPD/GDPR)
              </h2>
              <p>Você tem direito a:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Acessar:</strong> ver todos os seus dados</li>
                <li><strong>Exportar:</strong> baixar seus dados em formato JSON</li>
                <li><strong>Corrigir:</strong> atualizar informações incorretas</li>
                <li><strong>Excluir:</strong> deletar sua conta e todos os dados permanentemente</li>
                <li><strong>Portabilidade:</strong> transferir dados para outro serviço</li>
                <li><strong>Revogar consentimento:</strong> a qualquer momento</li>
              </ul>
              <p className="mt-3 text-sm">
                Para exercer esses direitos, acesse Perfil → Exportar Dados ou Excluir Conta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                6. Retenção de Dados
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Dados de conta: mantidos enquanto a conta estiver ativa</li>
                <li>Dados de pagamento: mantidos conforme exigências fiscais (5 anos)</li>
                <li>Logs técnicos: mantidos por 90 dias</li>
                <li>Após exclusão: dados removidos permanentemente em até 30 dias</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                7. Cookies e Tecnologias Similares
              </h2>
              <p>Usamos cookies essenciais para:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Manter você logado</li>
                <li>Lembrar preferências (idioma, tema)</li>
                <li>Analisar uso do app (Google Analytics - opcional)</li>
              </ul>
              <p className="mt-3 text-sm">
                Você pode desabilitar cookies nas configurações do navegador, mas isso pode afetar funcionalidades.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                8. Menores de Idade
              </h2>
              <p>
                O Serenity AI é destinado a maiores de 18 anos. Se você tem entre 13-17 anos, 
                precisa de consentimento dos pais/responsáveis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                9. Transferência Internacional
              </h2>
              <p>
                Seus dados podem ser processados em servidores fora do Brasil (EUA, Europa). 
                Garantimos proteções adequadas conforme LGPD.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                10. Mudanças nesta Política
              </h2>
              <p>
                Podemos atualizar esta política periodicamente. Mudanças significativas serão notificadas 
                por e-mail ou no app.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-spa-900 dark:text-spa-50 mb-3">
                11. Contato - DPO
              </h2>
              <p>
                Para questões sobre privacidade:<br />
                E-mail: <a href="mailto:privacidade@serenityai.app" className="text-serenity-600 dark:text-serenity-400 hover:underline">privacidade@serenityai.app</a><br />
                DPO (Encarregado de Dados): Tauany Polak
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-spa-200 dark:border-spa-800">
              <p className="text-sm text-spa-600 dark:text-spa-400">
                Serenity AI - Tauany Polak<br />
                "Ninguém deve sofrer sozinho."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
