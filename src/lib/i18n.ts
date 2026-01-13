export const languages = {
  'pt-BR': 'Português (Brasil)',
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'it': 'Italiano',
  'ja': '日本語',
  'ko': '한국어',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'ar': 'العربية',
  'hi': 'हिन्दी'
}

export type Language = keyof typeof languages

export const translations: Record<Language, Record<string, string>> = {
  'pt-BR': {
    // Auth
    'auth.signIn': 'Entrar',
    'auth.signUp': 'Criar conta',
    'auth.email': 'E-mail',
    'auth.password': 'Senha',
    'auth.name': 'Nome',
    'auth.forgotPassword': 'Esqueci minha senha',
    'auth.dontHaveAccount': 'Não tem conta?',
    'auth.alreadyHaveAccount': 'Já tem conta?',
    
    // Home
    'home.title': 'Como está seu coração hoje?',
    'home.subtitle': 'Deslize para expressar como você se sente',
    'home.moodScale': 'Escala de 0 (muito mal) a 10 (muito bem)',
    'home.saveToday': 'Salvar humor de hoje',
    
    // Navigation
    'nav.home': 'Início',
    'nav.chat': 'Chat IA',
    'nav.breathe': 'Respirar',
    'nav.sounds': 'Sons',
    'nav.journal': 'Diário',
    'nav.profile': 'Perfil',
    'nav.crisis': 'Modo Crise',
    
    // Subscription
    'sub.premium': 'Premium',
    'sub.free': 'Gratuito',
    'sub.upgrade': 'Assinar Premium',
    'sub.trial': 'Trial (7 dias)',
    'sub.monthly': 'Mensal',
    'sub.yearly': 'Anual',
    'sub.restore': 'Restaurar assinatura',
    
    // Compliance
    'compliance.disclaimer': 'Este app oferece apoio emocional e bem-estar, não substitui atendimento profissional.',
    'compliance.terms': 'Termos de Uso',
    'compliance.privacy': 'Política de Privacidade',
    'compliance.acceptTerms': 'Aceito os Termos de Uso e Política de Privacidade',
    'compliance.continue': 'Continuar',
    
    // Crisis
    'crisis.title': 'Modo Crise',
    'crisis.subtitle': 'Você não está sozinho. Estamos aqui.',
    'crisis.cvv': 'CVV - Centro de Valorização da Vida: 188',
    'crisis.grounding': 'Técnica de Grounding (5-4-3-2-1)',
    
    // Common
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.close': 'Fechar',
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
  },
  'en': {
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.forgotPassword': 'Forgot password?',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.alreadyHaveAccount': 'Already have an account?',
    
    'home.title': 'How is your heart today?',
    'home.subtitle': 'Slide to express how you feel',
    'home.moodScale': 'Scale from 0 (very bad) to 10 (very good)',
    'home.saveToday': 'Save today\'s mood',
    
    'nav.home': 'Home',
    'nav.chat': 'AI Chat',
    'nav.breathe': 'Breathe',
    'nav.sounds': 'Sounds',
    'nav.journal': 'Journal',
    'nav.profile': 'Profile',
    'nav.crisis': 'Crisis Mode',
    
    'sub.premium': 'Premium',
    'sub.free': 'Free',
    'sub.upgrade': 'Subscribe Premium',
    'sub.trial': 'Trial (7 days)',
    'sub.monthly': 'Monthly',
    'sub.yearly': 'Yearly',
    'sub.restore': 'Restore subscription',
    
    'compliance.disclaimer': 'This app offers emotional support and wellness, it does not replace professional care.',
    'compliance.terms': 'Terms of Use',
    'compliance.privacy': 'Privacy Policy',
    'compliance.acceptTerms': 'I accept the Terms of Use and Privacy Policy',
    'compliance.continue': 'Continue',
    
    'crisis.title': 'Crisis Mode',
    'crisis.subtitle': 'You are not alone. We are here.',
    'crisis.cvv': 'Crisis Helpline: 988 (US)',
    'crisis.grounding': 'Grounding Technique (5-4-3-2-1)',
    
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  // Adicionar traduções básicas para outros idiomas (simplificado)
  'es': {
    'auth.signIn': 'Iniciar sesión',
    'auth.signUp': 'Registrarse',
    'home.title': '¿Cómo está tu corazón hoy?',
    'nav.home': 'Inicio',
    'compliance.disclaimer': 'Esta aplicación ofrece apoyo emocional y bienestar, no reemplaza la atención profesional.',
  },
  'fr': {
    'auth.signIn': 'Se connecter',
    'auth.signUp': "S'inscrire",
    'home.title': 'Comment va votre cœur aujourd\'hui?',
    'nav.home': 'Accueil',
    'compliance.disclaimer': 'Cette application offre un soutien émotionnel et du bien-être, elle ne remplace pas les soins professionnels.',
  },
  'de': {
    'auth.signIn': 'Anmelden',
    'auth.signUp': 'Registrieren',
    'home.title': 'Wie geht es deinem Herzen heute?',
    'nav.home': 'Startseite',
    'compliance.disclaimer': 'Diese App bietet emotionale Unterstützung und Wohlbefinden, sie ersetzt keine professionelle Betreuung.',
  },
  'it': {
    'auth.signIn': 'Accedi',
    'auth.signUp': 'Registrati',
    'home.title': 'Come sta il tuo cuore oggi?',
    'nav.home': 'Home',
    'compliance.disclaimer': 'Questa app offre supporto emotivo e benessere, non sostituisce l\'assistenza professionale.',
  },
  'ja': {
    'auth.signIn': 'ログイン',
    'auth.signUp': '登録',
    'home.title': '今日の気分はいかがですか？',
    'nav.home': 'ホーム',
    'compliance.disclaimer': 'このアプリは感情的なサポートとウェルネスを提供しますが、専門的なケアに代わるものではありません。',
  },
  'ko': {
    'auth.signIn': '로그인',
    'auth.signUp': '가입',
    'home.title': '오늘 기분이 어떠세요?',
    'nav.home': '홈',
    'compliance.disclaimer': '이 앱은 정서적 지원과 웰빙을 제공하며 전문적인 치료를 대체하지 않습니다.',
  },
  'zh-CN': {
    'auth.signIn': '登录',
    'auth.signUp': '注册',
    'home.title': '今天心情如何？',
    'nav.home': '首页',
    'compliance.disclaimer': '此应用提供情感支持和健康服务，不能替代专业护理。',
  },
  'zh-TW': {
    'auth.signIn': '登入',
    'auth.signUp': '註冊',
    'home.title': '今天心情如何？',
    'nav.home': '首頁',
    'compliance.disclaimer': '此應用程式提供情感支持和健康服務，不能替代專業護理。',
  },
  'ar': {
    'auth.signIn': 'تسجيل الدخول',
    'auth.signUp': 'إنشاء حساب',
    'home.title': 'كيف حال قلبك اليوم؟',
    'nav.home': 'الرئيسية',
    'compliance.disclaimer': 'يقدم هذا التطبيق الدعم العاطفي والعافية، ولا يحل محل الرعاية المهنية.',
  },
  'hi': {
    'auth.signIn': 'साइन इन करें',
    'auth.signUp': 'साइन अप करें',
    'home.title': 'आज आपका दिल कैसा है?',
    'nav.home': 'होम',
    'compliance.disclaimer': 'यह ऐप भावनात्मक समर्थन और कल्याण प्रदान करता है, यह पेशेवर देखभाल की जगह नहीं लेता।',
  }
}

export function t(key: string, lang: Language = 'pt-BR'): string {
  return translations[lang]?.[key] || translations['en']?.[key] || key
}
