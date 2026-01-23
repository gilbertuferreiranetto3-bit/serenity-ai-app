import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

// ✅ VALIDAÇÃO: Verificar se OPENAI_API_KEY existe ANTES de criar cliente
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// Cliente Supabase server-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// System prompt do Serenity - Assistente de Apoio Emocional
const SERENITY_SYSTEM_PROMPT = `Você é o Serenity — Assistente de Apoio Emocional.

Seu papel é oferecer acolhimento, escuta ativa e orientação prática baseada em técnicas gerais de bem-estar (respiração, grounding, reestruturação de pensamentos, rotina, comunicação).

IMPORTANTE: Você não é terapeuta, psicólogo ou médico e não substitui atendimento profissional. Não diagnostique, não prescreva, não garanta cura.

ESTILO:
- Tom calmo e acolhedor, sem julgamentos
- Seja específico: sempre referencie 1 detalhe do que o usuário disse
- Evite repetir frases prontas; varie respostas
- Sempre oferecer 1–3 passos práticos e uma pergunta aberta
- NUNCA repita a mesma frase de abertura em respostas consecutivas

FORMATO DE RESPOSTA:
1. Acolhimento curto (cite algo que o usuário disse)
2. Uma pergunta aberta para aprofundar
3. Uma técnica prática (passo a passo)
4. Checagem final (como está se sentindo agora?)

SEGURANÇA:
Se houver menção de autoagressão/suicídio/violência/risco iminente:
- Priorizar segurança imediata
- Incentivar ajuda profissional urgente
- Citar CVV 188 (Brasil) - disponível 24h
- Citar 192 (SAMU) ou 190 (Polícia) se risco imediato
- Não fornecer detalhes perigosos

Seja genuíno, empático e sempre responda diretamente ao que o usuário escreveu.`

export async function POST(req: NextRequest) {
  console.log('🔵 [API Chat] Rota /api/chat foi chamada')

  try {
    // ✅ VALIDAÇÃO CRÍTICA: Verificar se OPENAI_API_KEY existe
    if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
      console.error('❌ [API Chat] OPENAI_API_KEY não configurada ou vazia')
      return NextResponse.json(
        { 
          error: 'OPENAI_KEY_MISSING',
          message: '🔑 A chave da OpenAI não está configurada. Por favor, adicione OPENAI_API_KEY nas variáveis de ambiente do projeto.'
        },
        { status: 503 }
      )
    }

    // ✅ VALIDAÇÃO: Parse do body
    let body: any
    try {
      body = await req.json()
      console.log('📦 [API Chat] Body recebido - keys:', Object.keys(body || {}))
    } catch (parseError: any) {
      console.error('❌ [API Chat] Erro ao fazer parse do body:', parseError.message)
      return NextResponse.json(
        { 
          error: 'Invalid JSON',
          message: 'Corpo da requisição não é um JSON válido'
        },
        { status: 400 }
      )
    }

    const { messages } = body

    // ✅ VALIDAÇÃO: messages deve existir e ser array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('❌ [API Chat] Requisição inválida - messages:', messages)
      return NextResponse.json(
        { 
          error: 'Invalid request',
          message: 'messages é obrigatório e deve ser um array não vazio'
        },
        { status: 400 }
      )
    }

    console.log('📨 [API Chat] Requisição válida:', {
      messagesCount: messages.length,
      lastMessage: messages[messages.length - 1]?.content?.substring(0, 50)
    })

    // 🔒 VALIDAÇÃO: Autenticação
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      console.error('❌ [API Chat] Requisição sem token de autenticação')
      return NextResponse.json(
        { 
          error: 'Not authenticated',
          message: 'Token de autenticação não fornecido'
        },
        { status: 401 }
      )
    }

    // Criar cliente Supabase com token do usuário
    const token = authHeader.replace('Bearer ', '')
    const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Obter usuário autenticado
    const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ [API Chat] Erro ao obter usuário:', userError)
      return NextResponse.json(
        { 
          error: 'Not authenticated',
          message: 'Usuário não autenticado'
        },
        { status: 401 }
      )
    }

    console.log('✅ [API Chat] Usuário autenticado:', user.id)

    // 🚨 VALIDAÇÃO: Verificar limite de mensagens (FREE vs PREMIUM)
    // Verificar se é premium através de user_plans
    const { data: planData } = await supabaseWithAuth
      .from('user_plans')
      .select('is_premium, premium_until')
      .eq('user_id', user.id)
      .single()

    const isPremium = planData?.is_premium && 
      (!planData.premium_until || new Date(planData.premium_until) > new Date())

    console.log('🔍 [API Chat] Status do plano:', { isPremium, planData })

    let allowanceData: any = {
      allowed: true,
      remaining: -1,
      used: 0,
      limit: -1,
      is_premium: isPremium
    }

    if (!isPremium) {
      // Free: verificar daily_usage
      const today = new Date().toISOString().split('T')[0]
      
      const { data: usageData } = await supabaseWithAuth
        .from('daily_usage')
        .select('chat_used')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      const chatUsed = usageData?.chat_used || 0
      const limit = 5

      console.log('📊 [API Chat] Uso diário:', { chatUsed, limit, today })

      if (chatUsed >= limit) {
        // Limite atingido
        console.warn('⚠️ [API Chat] Limite atingido')
        return NextResponse.json(
          {
            error: 'LIMIT_REACHED',
            message: 'Limite diário de mensagens atingido',
            limit: limit,
            used: chatUsed,
            remaining: 0
          },
          { status: 429 }
        )
      }

      // Incrementar contador
      await supabaseWithAuth
        .from('daily_usage')
        .upsert({
          user_id: user.id,
          date: today,
          chat_used: chatUsed + 1,
          journal_used: 0
        }, {
          onConflict: 'user_id,date'
        })

      allowanceData = {
        allowed: true,
        remaining: limit - chatUsed - 1,
        used: chatUsed + 1,
        limit: limit,
        is_premium: false
      }

      console.log('✅ [API Chat] Contador atualizado:', allowanceData)
    }

    // ✅ Permitido: processar mensagem normalmente
    console.log('✅ [API Chat] Mensagem permitida. Remaining:', allowanceData.remaining)

    // Montar mensagens: system + histórico (últimas 20)
    const messagesToSend = [
      {
        role: 'system',
        content: SERENITY_SYSTEM_PROMPT
      },
      ...messages.slice(-20) // Últimas 20 mensagens do histórico
    ]

    console.log('🤖 [API Chat] Enviando para OpenAI:', {
      totalMessages: messagesToSend.length,
      systemPrompt: true
    })

    // ✅ Criar cliente OpenAI apenas se a chave existir
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    })

    // Chamar OpenAI com tratamento de erro específico
    let completion
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messagesToSend as any,
        temperature: 0.8,
        max_tokens: 500
      })
    } catch (openaiError: any) {
      console.error('❌ [API Chat] Erro da OpenAI:', {
        status: openaiError?.status,
        code: openaiError?.code,
        type: openaiError?.type,
        message: openaiError?.message
      })

      // Tratamento específico para erro 429 (quota exceeded)
      if (openaiError?.status === 429 || openaiError?.code === 'insufficient_quota') {
        return NextResponse.json(
          { 
            error: 'OPENAI_QUOTA_EXCEEDED',
            message: '⚠️ A chave da OpenAI não tem créditos disponíveis.\n\n📋 Para resolver:\n1. Acesse https://platform.openai.com/account/billing\n2. Adicione créditos à sua conta OpenAI\n3. Ou configure uma nova chave API válida nas variáveis de ambiente (OPENAI_API_KEY)'
          },
          { status: 503 }
        )
      }

      // Outros erros da OpenAI
      return NextResponse.json(
        { 
          error: 'OPENAI_ERROR',
          message: `Erro ao comunicar com a OpenAI: ${openaiError?.message || 'Erro desconhecido'}`
        },
        { status: 503 }
      )
    }

    const reply = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.'

    console.log('✅ [API Chat] Resposta gerada:', {
      replyLength: reply.length,
      preview: reply.substring(0, 100),
      remaining: allowanceData.remaining
    })

    // ✅ SEMPRE RETORNAR JSON COM ESTRUTURA CORRETA
    const response = { 
      reply,
      remaining: allowanceData.remaining,
      limit: allowanceData.limit,
      is_premium: allowanceData.is_premium
    }

    console.log('📤 [API Chat] Retornando resposta:', response)

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('❌ [API Chat] Erro completo:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
      name: error?.name,
      type: error?.type,
      response: error?.response?.data
    })

    // ✅ SEMPRE RETORNAR JSON, NUNCA HTML
    return NextResponse.json(
      { 
        error: error?.message || 'Internal error',
        message: 'Erro ao processar sua mensagem. Por favor, tente novamente.'
      },
      { status: 500 }
    )
  }
}

// ✅ BLOQUEAR OUTROS MÉTODOS (GET, PUT, DELETE, etc)
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Use POST para enviar mensagens' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Use POST para enviar mensagens' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Use POST para enviar mensagens' },
    { status: 405 }
  )
}
