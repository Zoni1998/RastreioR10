import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // se o "next" foi passado no resetPasswordForEmail, nós o redirecionaremos
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // redirecionamento normal em dev
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Se der erro ou não tiver código, volta pro login com um erro genérico
  return NextResponse.redirect(`${origin}/login?error=Link+inválido+ou+expirado`)
}
