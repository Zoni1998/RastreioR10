'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'

export async function login(prevState, formData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { success: false, error: 'Email ou senha incorretos.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(prevState, formData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  // No ambiente de dev, pode ser que e-mails de confirmação estejam desligados ou exijam configuração.
  // Vamos presumir que o usuário entra direto.
  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    return { success: false, error: error.message }
  }

  // Se o Supabase não retornar uma sessão, significa que a confirmação de e-mail está ligada
  if (!authData.session) {
    return { success: true, requireEmailVerification: true, message: 'Verifique seu e-mail para ativar a conta.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function requestPasswordReset(prevState, formData) {
  const email = formData.get('email')
  if (!email) return { success: false, error: 'E-mail obrigatório' }

  const supabase = await createClient()
  
  // O redirect to callback que vamos criar
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/nova-senha`
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function updatePassword(prevState, formData) {
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')

  if (!password || password.length < 6) {
    return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' }
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'As senhas não coincidem' }
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { success: false, error: error.message }
  }

  redirect('/')
}
