'use client'

import { Card, CardHeader, CardBody, Input, Button, PressEvent } from '@heroui/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(searchParams.get('error'))
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  const handleLogin = async (e: PressEvent) => {
    setIsLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Invalid login credentials')
      setIsLoading(false)
    } else {
      router.refresh()
      router.push('/')
    }
  }

  const handleSignup = async (e: PressEvent) => {
    setIsLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signUp({ email, password })

    if (authError) {
      setError('Error signing up: ' + authError.message)
      setIsLoading(false)
    } else {
      router.refresh()
      router.push('/')
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col gap-3">
          <div className="flex flex-col">
            <p className="text-xl font-bold">Welcome</p>
            <p className="text-small text-default-500">Sign in or create an account</p>
          </div>
        </CardHeader>
        <CardBody>
          <form className="flex flex-col gap-4">
            {error && (
              <div className="p-3 text-sm text-danger-500 bg-danger-50 rounded-md">
                {error}
              </div>
            )}

            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="Enter your email"
              isRequired
              variant="bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              isRequired
              variant="bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex flex-col gap-2 mt-2">
              <Button color="primary" onPress={(e) => handleLogin(e as any)} isLoading={isLoading} className="w-full">
                Log in
              </Button>
              <Button color="default" variant="flat" onPress={(e) => handleSignup(e as any)} isLoading={isLoading} className="w-full">
                Sign up
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
