'use client'

import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'

export default function SoundsPlaceholder() {
  return (
    <div className="min-h-screen bg-gradient-serenity flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card-spa p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-3">
            Sons Relaxantes - Em Breve
          </h1>
          
          <p className="text-spa-600 dark:text-spa-400 mb-6">
            Esta funcionalidade será implementada no <strong>Módulo 3</strong>.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-spa-700 dark:text-spa-300">
              <strong>O que virá:</strong>
            </p>
            <ul className="text-sm text-spa-600 dark:text-spa-400 mt-2 space-y-1">
              <li>• Chuva, mar, floresta, lareira</li>
              <li>• White noise e sons binaurais</li>
              <li>• Player com timer</li>
              <li>• Playlists personalizadas</li>
            </ul>
          </div>

          <Link href="/home">
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Voltar para Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
