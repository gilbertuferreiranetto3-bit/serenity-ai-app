'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Play, Pause, Volume2, Clock, Lock, Sparkles, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// Tipos de sons
type Sound = {
  id: string
  slug: string
  title: string
  url: string
  isPremium: boolean
  bucket: string
  path: string
}

// Opções de timer
const TIMER_OPTIONS = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: 'Contínuo', value: 0 },
]

// Ícones por slug (fallback visual)
const SOUND_ICONS: Record<string, string> = {
  'rain': '🌧️',
  'chuva': '🌧️',
  'tempestade': '⛈️',
  'ocean': '🌊',
  'mar': '🌊',
  'baleias': '🐋',
  'fireplace': '🔥',
  'lareira': '🔥',
  'whitenoise': '📻',
  'white-noise': '📻',
  'ruido': '📻',
  'wind': '💨',
  'vento': '💨',
  'binaural': '🎵',
  'mix': '🎶',
  'halloween': '🎃',
  'natal': '🎄',
  'gato': '🐱',
  'riacho': '🏞️',
  'passaros': '🐦',
}

// Fallback de sons (caso banco esteja vazio) - SEM FLORESTA
const FALLBACK_SOUNDS = [
  // Sons Gratuitos (4 sons - SEM Floresta)
  { id: 'lareira', slug: 'lareira', title: 'Lareira', isPremium: false, bucket: 'sounds', path: 'Lareira.mp3' },
  { id: 'mar', slug: 'mar', title: 'Mar', isPremium: false, bucket: 'sounds', path: 'Mar.mp3' },
  { id: 'vento', slug: 'vento', title: 'Vento', isPremium: false, bucket: 'sounds', path: 'Vento.mp3' },
  { id: 'ruido-branco', slug: 'ruido-branco', title: 'Ruído Branco', isPremium: false, bucket: 'sounds', path: 'Ruido Branco.mp3' },
  // Sons Premium
  { id: 'tempestade-chuva', slug: 'tempestade-chuva', title: 'Tempestade e Chuva', isPremium: true, bucket: 'sounds', path: 'Tempestade e chuva.mp3' },
  { id: 'baleias', slug: 'baleias', title: 'Baleias no Fundo do Mar', isPremium: true, bucket: 'sounds', path: 'Baleias no Fundo do Mar para Dormir.mp3' },
  { id: 'halloween-chuvoso', slug: 'halloween-chuvoso', title: 'Halloween Chuvoso', isPremium: true, bucket: 'sounds', path: 'Halloween Chuvoso.mp3' },
  { id: 'natal-relaxamento', slug: 'natal-relaxamento', title: 'Natal e Relaxamento', isPremium: true, bucket: 'sounds', path: 'Natal e Relaxamento.mp3' },
  { id: 'ronronar-gato', slug: 'ronronar-gato', title: 'Ronronar de um Gato', isPremium: true, bucket: 'sounds', path: 'Ronronar de um Gato.mp3' },
  { id: 'riacho-passaros', slug: 'riacho-passaros', title: 'Riacho e Pássaros', isPremium: true, bucket: 'sounds', path: 'Riacho e Passaros.mp3' },
]

export default function SoundsPage() {
  const router = useRouter()
  const { user, isPremiumUser } = useAuth()
  const [sounds, setSounds] = useState<Sound[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(70)
  const [timer, setTimer] = useState(0) // 0 = contínuo
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/signin')
    }
  }, [user, router])

  // Carregar sons do Supabase
  useEffect(() => {
    async function loadSounds() {
      if (!supabase) {
        console.error('Supabase não configurado')
        setError('Supabase não configurado')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Buscar sons ativos, ordenados por sort
        const { data, error: fetchError } = await supabase
          .from('relax_sounds')
          .select('*')
          .eq('is_active', true)
          .order('sort', { ascending: true })

        if (fetchError) {
          console.error('Erro ao buscar sons:', fetchError)
          throw fetchError
        }

        console.log('Sons carregados do banco:', data)

        // Se não houver dados, usar fallback
        if (!data || data.length === 0) {
          console.warn('Nenhum som encontrado no banco, usando fallback')
          const soundsWithUrls = FALLBACK_SOUNDS.map(sound => {
            const { data: urlData } = supabase.storage.from(sound.bucket).getPublicUrl(sound.path)
            console.log(`Fallback - ${sound.title}:`, {
              path: sound.path,
              url: urlData.publicUrl
            })
            return {
              ...sound,
              url: urlData.publicUrl
            }
          })
          setSounds(soundsWithUrls)
          setLoading(false)
          return
        }

        // FILTRAR FLORESTA - remover qualquer som com slug 'floresta' ou path 'Floresta.mp3'
        const filteredData = data.filter(sound => 
          sound.slug !== 'floresta' && 
          sound.path !== 'Floresta.mp3'
        )

        console.log('Sons após filtrar Floresta:', filteredData)

        // Gerar URLs públicas usando getPublicUrl (NUNCA encode manual)
        const soundsWithUrls: Sound[] = filteredData.map(sound => {
          const bucket = sound.bucket || 'sounds'
          const path = sound.path
          
          // Usar getPublicUrl diretamente - ele já faz o encoding correto
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
          
          console.log(`${sound.title}:`, {
            path: path,
            url: urlData.publicUrl
          })

          return {
            id: sound.id,
            slug: sound.slug,
            title: sound.title,
            url: urlData.publicUrl,
            isPremium: sound.is_premium,
            bucket: bucket,
            path: path,
          }
        })

        setSounds(soundsWithUrls)
        
        // Se o som selecionado for Floresta, trocar para Lareira (primeiro som free)
        if (selectedSound && (selectedSound.slug === 'floresta' || selectedSound.path === 'Floresta.mp3')) {
          const lareiraSound = soundsWithUrls.find(s => s.slug === 'lareira')
          if (lareiraSound) {
            console.log('Som Floresta estava selecionado, trocando para Lareira')
            setSelectedSound(lareiraSound)
          } else {
            // Se não encontrar Lareira, pegar o primeiro som free disponível
            const firstFreeSound = soundsWithUrls.find(s => !s.isPremium)
            if (firstFreeSound) {
              setSelectedSound(firstFreeSound)
            } else {
              setSelectedSound(null)
            }
          }
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Erro ao carregar sons:', err)
        setError('Erro ao carregar sons do banco de dados')
        setLoading(false)
      }
    }

    loadSounds()
  }, [])

  // Controle de timer
  useEffect(() => {
    if (isPlaying && timer > 0 && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleStop()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [isPlaying, timer, timeRemaining])

  const handleSoundSelect = async (sound: Sound) => {
    console.log('Som selecionado:', sound.title, 'URL:', sound.url)
    
    // Verificar se é premium e usuário não tem assinatura
    if (sound.isPremium && !isPremiumUser) {
      setShowPremiumModal(true)
      return
    }

    // Parar som atual se estiver tocando
    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }

    setSelectedSound(sound)
    setTimeRemaining(0)
  }

  const handlePlay = async () => {
    if (!selectedSound) {
      console.error('Nenhum som selecionado')
      return
    }

    // Verificar se URL está disponível
    if (!selectedSound.url) {
      console.error('URL do áudio não disponível')
      alert('URL do áudio não disponível. Verifique a configuração do storage no Supabase.')
      return
    }

    console.log('Tentando tocar:', selectedSound.title)
    console.log('URL:', selectedSound.url)

    try {
      // Criar/configurar elemento de áudio
      if (!audioRef.current) {
        audioRef.current = new Audio()
        audioRef.current.crossOrigin = 'anonymous'
        
        // Listeners de debug
        audioRef.current.onloadstart = () => {
          console.log('🔄 Carregando áudio...')
        }
        
        audioRef.current.oncanplay = () => {
          console.log('✅ Áudio pronto para tocar')
        }
        
        audioRef.current.onloadedmetadata = () => {
          console.log('📊 Metadados carregados')
        }
        
        audioRef.current.onerror = (e) => {
          console.error('❌ Erro ao carregar áudio:', e)
          if (audioRef.current?.error) {
            console.error('Código do erro:', audioRef.current.error.code)
            console.error('Mensagem:', audioRef.current.error.message)
          }
          console.error('URL problemática:', selectedSound.url)
          alert(`Erro ao carregar o áudio "${selectedSound.title}". Verifique se o arquivo existe no storage.`)
          handleStop()
        }
      }

      // Parar e resetar
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      
      // Configurar novo som
      audioRef.current.src = selectedSound.url
      audioRef.current.volume = volume / 100
      audioRef.current.loop = timer === 0 // Loop se contínuo
      
      // Carregar e tocar
      audioRef.current.load()
      await audioRef.current.play()
      
      console.log('▶️ Reproduzindo:', selectedSound.title)
      setIsPlaying(true)

      // Iniciar timer se configurado
      if (timer > 0) {
        setTimeRemaining(timer * 60)
      }
    } catch (err) {
      console.error('❌ Erro ao reproduzir áudio:', err)
      console.error('URL:', selectedSound.url)
      alert('Erro ao reproduzir o áudio. Tente novamente.')
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
  }

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setTimeRemaining(0)
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
  }

  const handleTimerChange = (newTimer: number) => {
    setTimer(newTimer)
    if (isPlaying) {
      handleStop()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSoundIcon = (slug: string): string => {
    const lowerSlug = slug.toLowerCase()
    for (const key in SOUND_ICONS) {
      if (lowerSlug.includes(key)) {
        return SOUND_ICONS[key]
      }
    }
    return '🎵' // Ícone padrão
  }

  if (!user) return null

  const freeSounds = sounds.filter(s => !s.isPremium)
  const premiumSounds = sounds.filter(s => s.isPremium)

  return (
    <div className="min-h-screen bg-gradient-serenity">
      {/* Header */}
      <header className="bg-white/80 dark:bg-spa-900/80 backdrop-blur-md border-b border-spa-200 dark:border-spa-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/home">
              <button className="w-10 h-10 bg-spa-200 dark:bg-spa-800 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                <ArrowLeft className="w-5 h-5 text-spa-700 dark:text-spa-300" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-spa-900 dark:text-spa-50">
                Sons Relaxantes
              </h1>
              <p className="text-xs text-spa-600 dark:text-spa-400">
                Escolha um som para relaxar
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Loading State */}
        {loading && (
          <div className="card-spa p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-spa-300 border-t-serenity-500 rounded-full mx-auto mb-4"></div>
            <p className="text-spa-600 dark:text-spa-400">Carregando sons...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Erro ao carregar sons
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Player Card */}
        {selectedSound && !loading && (
          <div className="card-spa p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{getSoundIcon(selectedSound.slug)}</div>
              <h2 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-2">
                {selectedSound.title}
              </h2>
              {isPlaying && timeRemaining > 0 && (
                <p className="text-spa-600 dark:text-spa-400">
                  Tempo restante: {formatTime(timeRemaining)}
                </p>
              )}
            </div>

            {/* Play/Pause Button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={isPlaying ? handlePause : handlePlay}
                className="w-20 h-20 bg-gradient-ocean rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 text-white" />
                ) : (
                  <Play className="w-10 h-10 text-white ml-1" />
                )}
              </button>
            </div>

            {/* Volume Control */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Volume2 className="w-5 h-5 text-spa-600 dark:text-spa-400" />
                <span className="text-sm text-spa-600 dark:text-spa-400">
                  Volume: {volume}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full h-2 bg-spa-200 dark:bg-spa-800 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Timer Options */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-spa-600 dark:text-spa-400" />
                <span className="text-sm text-spa-600 dark:text-spa-400">
                  Timer
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {TIMER_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleTimerChange(option.value)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      timer === option.value
                        ? 'bg-gradient-ocean text-white'
                        : 'bg-spa-100 dark:bg-spa-800 text-spa-700 dark:text-spa-300 hover:bg-spa-200 dark:hover:bg-spa-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Free Sounds */}
        {!loading && freeSounds.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-spa-900 dark:text-spa-50 mb-4">
              Sons Gratuitos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {freeSounds.map(sound => (
                <button
                  key={sound.id}
                  onClick={() => handleSoundSelect(sound)}
                  className={`card-spa p-6 text-center cursor-pointer group transition-all ${
                    selectedSound?.id === sound.id
                      ? 'ring-2 ring-serenity-500 dark:ring-serenity-400'
                      : ''
                  }`}
                >
                  <div className="text-4xl mb-3">{getSoundIcon(sound.slug)}</div>
                  <h4 className="font-semibold text-spa-900 dark:text-spa-50">
                    {sound.title}
                  </h4>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Premium Sounds */}
        {!loading && premiumSounds.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-bold text-spa-900 dark:text-spa-50">
                Sons Premium
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {premiumSounds.map(sound => (
                <button
                  key={sound.id}
                  onClick={() => handleSoundSelect(sound)}
                  className={`card-spa p-6 text-center cursor-pointer group relative ${
                    selectedSound?.id === sound.id && isPremiumUser
                      ? 'ring-2 ring-serenity-500 dark:ring-serenity-400'
                      : ''
                  }`}
                >
                  {!isPremiumUser && (
                    <div className="absolute top-2 right-2">
                      <Lock className="w-4 h-4 text-warning" />
                    </div>
                  )}
                  <div className={`text-4xl mb-3 ${!isPremiumUser ? 'opacity-70' : ''}`}>
                    {getSoundIcon(sound.slug)}
                  </div>
                  <h4 className="font-semibold text-spa-900 dark:text-spa-50">
                    {sound.title}
                  </h4>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        {!loading && sounds.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-xl p-4">
            <p className="text-sm text-spa-700 dark:text-spa-300">
              <strong>💡 Como usar:</strong>
            </p>
            <ul className="text-sm text-spa-600 dark:text-spa-400 mt-2 space-y-1">
              <li>• Escolha um som da lista</li>
              <li>• Ajuste o volume conforme preferir</li>
              <li>• Configure um timer ou deixe contínuo</li>
              <li>• Pressione play e relaxe</li>
            </ul>
          </div>
        )}
      </main>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card-spa p-8 max-w-md w-full animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-ocean rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-spa-900 dark:text-spa-50 mb-2">
                Assinar Premium
              </h2>
              <p className="text-spa-600 dark:text-spa-400">
                Este som está disponível apenas para assinantes Premium.
              </p>
            </div>

            <div className="bg-spa-50 dark:bg-spa-800/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-spa-700 dark:text-spa-300 mb-2">
                <strong>Com Premium você tem:</strong>
              </p>
              <ul className="text-sm text-spa-600 dark:text-spa-400 space-y-1">
                <li>✓ Sons binaurais exclusivos</li>
                <li>✓ Mixes personalizados</li>
                <li>✓ Chat ilimitado com IA</li>
                <li>✓ Todas as funcionalidades</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPremiumModal(false)}
                className="flex-1 py-3 px-4 bg-spa-200 dark:bg-spa-800 text-spa-700 dark:text-spa-300 rounded-lg font-medium hover:bg-spa-300 dark:hover:bg-spa-700 transition-colors"
              >
                Voltar
              </button>
              <Link href="/subscribe" className="flex-1">
                <button className="w-full btn-primary">
                  Assinar Agora
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
