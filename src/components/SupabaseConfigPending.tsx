'use client'

import { AlertTriangle, Database, Key } from 'lucide-react'

export default function SupabaseConfigPending() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 md:p-12 border border-emerald-100 dark:border-emerald-900">
        {/* Ícone de Alerta */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-4">
          Configuração do Supabase Pendente
        </h1>

        {/* Descrição */}
        <p className="text-center text-slate-600 dark:text-slate-300 mb-8">
          Para que o Serenity AI funcione corretamente, você precisa configurar as variáveis de ambiente do Supabase.
        </p>

        {/* Instruções */}
        <div className="space-y-6">
          {/* Passo 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Acesse o Dashboard do Supabase
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Vá para{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  supabase.com/dashboard
                </a>{' '}
                e selecione seu projeto.
              </p>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Copie as credenciais
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Em <strong>Settings → API</strong>, copie:
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold">
                      Project URL
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 break-all">
                      https://seu-projeto.supabase.co
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold">
                      anon/public key
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 break-all">
                      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Configure as variáveis de ambiente
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Adicione as seguintes variáveis no arquivo <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">.env.local</code>:
              </p>
              <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs text-emerald-400 font-mono">
{`NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui`}
                </pre>
              </div>
            </div>
          </div>

          {/* Passo 4 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Reinicie o servidor
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Após configurar as variáveis, reinicie o servidor de desenvolvimento para aplicar as mudanças.
              </p>
            </div>
          </div>
        </div>

        {/* Nota de Rodapé */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
            💡 <strong>Dica:</strong> Se você ainda não tem um projeto no Supabase, crie um gratuitamente em{' '}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              supabase.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
