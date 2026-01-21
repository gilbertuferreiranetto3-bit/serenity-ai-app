import { supabase } from './supabase'

export type CrisisTool = 'breathe' | 'grounding' | 'plan'

export async function saveCrisisSession(
  userId: string,
  tool: CrisisTool
): Promise<{ ok: boolean; reason?: string; id?: string }> {
  if (!supabase) {
    console.warn('Supabase not initialized')
    return { ok: false, reason: 'supabase_not_initialized' }
  }

  // Verificar se usuário está autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.warn('User not authenticated')
    return { ok: false, reason: 'not_authenticated' }
  }

  try {
    const { data, error } = await supabase
      .from('crisis_sessions')
      .insert([
        {
          user_id: userId,
          tool_used: tool,
          started_at: new Date().toISOString(),
          completed: true,
        },
      ])
      .select()
      .single()

    if (error) {
      // Log detalhado do erro
      console.error('Error saving crisis session', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      })
      return { ok: false, reason: 'database_error' }
    }

    return { ok: true, id: data?.id }
  } catch (err) {
    console.error('Unexpected error saving crisis session', err)
    return { ok: false, reason: 'unexpected_error' }
  }
}
