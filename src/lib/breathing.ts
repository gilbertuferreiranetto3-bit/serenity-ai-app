import { supabase } from './supabase'

export type BreathMode = 'calm' | 'anxiety' | 'sleep'
export type BreathFeedback = 'better' | 'same' | 'worse'

export const BREATH_MODES = {
  calm: {
    name: 'Calma',
    duration: 180, // 3 minutos
    protocol: { inhale: 4, hold: 2, exhale: 6 },
    description: 'Protocolo 4-2-6 para relaxamento profundo',
    color: 'from-blue-400 to-cyan-400'
  },
  anxiety: {
    name: 'Ansiedade',
    duration: 240, // 4 minutos
    protocol: { inhale: 3, hold: 1, exhale: 6 },
    description: 'Protocolo 3-1-6 para reduzir ansiedade',
    color: 'from-serenity-400 to-serenity-600'
  },
  sleep: {
    name: 'Sono',
    duration: 300, // 5 minutos
    protocol: { inhale: 4, hold: 7, exhale: 8 },
    description: 'Protocolo 4-7-8 para induzir o sono',
    warning: 'Se sentir tontura, pare e respire normalmente',
    color: 'from-purple-400 to-pink-400'
  }
}

export async function createBreathingSession(userId: string, mode: BreathMode) {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('breathing_sessions')
    .insert({
      user_id: userId,
      mode,
      started_at: new Date().toISOString(),
      completed: false
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating breathing session:', error)
    return null
  }

  return data
}

export async function completeBreathingSession(
  sessionId: string,
  durationSeconds: number,
  feedback: BreathFeedback
) {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('breathing_sessions')
    .update({
      completed: true,
      duration_seconds: durationSeconds,
      feedback
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    console.error('Error completing breathing session:', error)
    return null
  }

  return data
}

export async function getLastBreathingSession(userId: string) {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('breathing_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function getWeeklyBreathingSessions(userId: string) {
  if (!supabase) return 0

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data, error } = await supabase
    .from('breathing_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('created_at', sevenDaysAgo.toISOString())

  if (error) {
    console.error('Error fetching weekly sessions:', error)
    return 0
  }

  return data?.length || 0
}
