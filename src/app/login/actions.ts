'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect('/login?error=Invalid login credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/') // Redirect on success
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const allowedEmails = [
    'y4cody@gmail.com',
    'isaacl1698@gmail.com',
    'bpwyatt04@gmail.com',
    'britishshrimp@gmail.com',
  ]

  if (!allowedEmails.includes(email.toLowerCase())) {
    redirect('/login?error=Email not authorized to sign up')
  }

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect('/login?error=Error signing up: ' + error.message)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
