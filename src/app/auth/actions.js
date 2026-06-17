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
  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { success: false, error: error.message }
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
