import { supabase } from './supabase'

/**
 * Retorna a data de hoje no fuso horário de São Paulo (America/Sao_Paulo)
 * Formato: YYYY-MM-DD
 */
export function getTodayBR(): string {
  const now = new Date()
  const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  return brazilTime.toISOString().slice(0, 10)
}

/**
 * Garante que existe um registro de daily_usage para o usuário na data especificada.
 * NÃO incrementa nenhum contador - apenas cria a linha se não existir.
 * 
 * @param userId - ID do usuário
 * @param dateBR - Data no formato YYYY-MM-DD (America/Sao_Paulo)
 * @returns { success: boolean, error?: string }
 */
export async function getOrCreateDailyUsage(userId: string, dateBR: string) {
  if (!supabase) {
    return { success: false, error: 'Supabase não configurado' }
  }

  try {
    // Verificar se já existe
    const { data: existing, error: selectError } = await supabase
      .from('daily_usage')
      .select('id, chat_used, journal_used')
      .eq('user_id', userId)
      .eq('date', dateBR)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 = not found (ok, vamos criar)
      console.error('Erro ao buscar daily_usage:', selectError)
      return { success: false, error: selectError.message }
    }

    if (existing) {
      // Já existe, não faz nada
      console.log('[getOrCreateDailyUsage] Registro já existe:', { userId, dateBR, existing })
      return { success: true }
    }

    // Criar novo registro com contadores zerados
    const { error: insertError } = await supabase
      .from('daily_usage')
      .insert({
        user_id: userId,
        date: dateBR,
        chat_used: 0,
        journal_used: 0,
        updated_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Erro ao criar daily_usage:', insertError)
      return { success: false, error: insertError.message }
    }

    console.log('[getOrCreateDailyUsage] Registro criado:', { userId, dateBR })
    return { success: true }
  } catch (error: any) {
    console.error('Erro em getOrCreateDailyUsage:', error)
    return { success: false, error: error?.message || 'Erro desconhecido' }
  }
}

/**
 * Incrementa SOMENTE o contador chat_used para o usuário na data especificada.
 * Deve ser chamado APENAS quando o usuário envia uma mensagem no chat.
 * 
 * @param userId - ID do usuário
 * @param dateBR - Data no formato YYYY-MM-DD (America/Sao_Paulo)
 * @returns { success: boolean, before: number, after: number, error?: string }
 */
export async function incrementChatUsed(userId: string, dateBR: string) {
  if (!supabase) {
    return { success: false, before: 0, after: 0, error: 'Supabase não configurado' }
  }

  try {
    // Garantir que existe registro
    await getOrCreateDailyUsage(userId, dateBR)

    // Buscar valor atual
    const { data: current, error: selectError } = await supabase
      .from('daily_usage')
      .select('chat_used')
      .eq('user_id', userId)
      .eq('date', dateBR)
      .single()

    if (selectError) {
      console.error('Erro ao buscar chat_used:', selectError)
      return { success: false, before: 0, after: 0, error: selectError.message }
    }

    const before = current?.chat_used || 0
    const after = before + 1

    // Incrementar
    const { error: updateError } = await supabase
      .from('daily_usage')
      .update({
        chat_used: after,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('date', dateBR)

    if (updateError) {
      console.error('Erro ao incrementar chat_used:', updateError)
      return { success: false, before, after: before, error: updateError.message }
    }

    // Log temporário para debug
    console.log('🔵 [incrementChatUsed]', {
      feature: 'chat',
      userId,
      todayBR: dateBR,
      before,
      after,
      timestamp: new Date().toISOString()
    })

    return { success: true, before, after }
  } catch (error: any) {
    console.error('Erro em incrementChatUsed:', error)
    return { success: false, before: 0, after: 0, error: error?.message || 'Erro desconhecido' }
  }
}

/**
 * Incrementa SOMENTE o contador journal_used para o usuário na data especificada.
 * Deve ser chamado APENAS quando o usuário salva uma entrada no diário.
 * 
 * @param userId - ID do usuário
 * @param dateBR - Data no formato YYYY-MM-DD (America/Sao_Paulo)
 * @returns { success: boolean, before: number, after: number, error?: string }
 */
export async function incrementJournalUsed(userId: string, dateBR: string) {
  if (!supabase) {
    return { success: false, before: 0, after: 0, error: 'Supabase não configurado' }
  }

  try {
    // Garantir que existe registro
    await getOrCreateDailyUsage(userId, dateBR)

    // Buscar valor atual
    const { data: current, error: selectError } = await supabase
      .from('daily_usage')
      .select('journal_used')
      .eq('user_id', userId)
      .eq('date', dateBR)
      .single()

    if (selectError) {
      console.error('Erro ao buscar journal_used:', selectError)
      return { success: false, before: 0, after: 0, error: selectError.message }
    }

    const before = current?.journal_used || 0
    const after = before + 1

    // Incrementar
    const { error: updateError } = await supabase
      .from('daily_usage')
      .update({
        journal_used: after,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('date', dateBR)

    if (updateError) {
      console.error('Erro ao incrementar journal_used:', updateError)
      return { success: false, before, after: before, error: updateError.message }
    }

    // Log temporário para debug
    console.log('📗 [incrementJournalUsed]', {
      feature: 'journal',
      userId,
      todayBR: dateBR,
      before,
      after,
      timestamp: new Date().toISOString()
    })

    return { success: true, before, after }
  } catch (error: any) {
    console.error('Erro em incrementJournalUsed:', error)
    return { success: false, before: 0, after: 0, error: error?.message || 'Erro desconhecido' }
  }
}

/**
 * Busca o uso diário do usuário para a data especificada.
 * NÃO modifica nenhum contador.
 * 
 * @param userId - ID do usuário
 * @param dateBR - Data no formato YYYY-MM-DD (America/Sao_Paulo)
 * @returns { chat_used: number, journal_used: number } ou null se não encontrado
 */
export async function getDailyUsage(userId: string, dateBR: string) {
  if (!supabase) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('daily_usage')
      .select('chat_used, journal_used')
      .eq('user_id', userId)
      .eq('date', dateBR)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Não encontrado - retornar zeros
        return { chat_used: 0, journal_used: 0 }
      }
      console.error('Erro ao buscar daily_usage:', error)
      return null
    }

    return data
  } catch (error: any) {
    console.error('Erro em getDailyUsage:', error)
    return null
  }
}
