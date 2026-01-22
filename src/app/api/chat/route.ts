import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

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
    // ✅ VALIDAÇÃO: Verificar se OPENAI_API_KEY existe
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [API Chat] OPENAI_API_KEY não configurada')
      return NextResponse.json(
        { 
          error: { 
            message: 'OPENAI_API_KEY missing',
            details: 'Chave da OpenAI não está configurada no servidor'
          } 
        },
        { status: 500 }
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
          error: { 
            message: 'Invalid JSON',
            details: 'Corpo da requisição não é um JSON válido'
          } 
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
          error: { 
            message: 'Invalid request',
            details: 'messages é obrigatório e deve ser um array não vazio'
          } 
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
          error: { 
            message: 'Not authenticated',
            details: 'Token de autenticação não fornecido'
          } 
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

    // 🚨 VALIDAÇÃO SERVER-SIDE: Verificar limite de mensagens (FREE vs PREMIUM)
    const { data: allowanceData, error: allowanceError } = await supabaseWithAuth
      .rpc('consume_chat_allowance', { p_message_count: 1 })

    if (allowanceError) {
      console.error('❌ [API Chat] Erro ao verificar allowance:', {
        message: allowanceError.message,
        code: allowanceError.code,
        details: allowanceError.details,
        hint: allowanceError.hint
      })
      return NextResponse.json(
        { 
          error: { 
            message: 'Database error',
            details: `Erro ao verificar limite de mensagens: ${allowanceError.message}`
          }
        },
        { status: 500 }
      )
    }

    console.log('🔍 [API Chat] Allowance verificado:', allowanceData)

    // Se não permitido (limite atingido)
    if (!allowanceData.allowed) {
      console.warn('⚠️ [API Chat] Limite atingido:', allowanceData)
      return NextResponse.json(
        {
          error: 'LIMIT_REACHED',
          message: 'Limite diário de mensagens atingido',
          limit: allowanceData.limit,
          used: allowanceData.used,
          remaining: allowanceData.remaining
        },
        { status: 429 } // Too Many Requests
      )
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

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messagesToSend as any,
      temperature: 0.8,
      max_tokens: 500
    })

    const reply = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.'

    console.log('✅ [API Chat] Resposta gerada:', {
      replyLength: reply.length,
      preview: reply.substring(0, 100),
      remaining: allowanceData.remaining
    })

    // ✅ SEMPRE RETORNAR JSON
    return NextResponse.json({ 
      reply,
      remaining: allowanceData.remaining,
      limit: allowanceData.limit,
      is_premium: allowanceData.is_premium
    })

  } catch (error: any) {
    console.error('❌ [API Chat] Erro completo:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
      name: error?.name,
      details: error?.response?.data
    })

    // ✅ SEMPRE RETORNAR JSON, NUNCA HTML
    return NextResponse.json(
      { 
        error: { 
          message: error?.message || 'Internal error',
          details: String(error)
        }
      },
      { status: 500 }
    )
  }
}

// ✅ BLOQUEAR OUTROS MÉTODOS (GET, PUT, DELETE, etc)
export async function GET() {
  return NextResponse.json(
    { error: { message: 'Method not allowed', details: 'Use POST para enviar mensagens' } },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: { message: 'Method not allowed', details: 'Use POST para enviar mensagens' } },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: { message: 'Method not allowed', details: 'Use POST para enviar mensagens' } },
    { status: 405 }
  )
}
