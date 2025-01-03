'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      console.log('Received code:', code)
      
      if (code) {
        try {
          // For mock auth, just store token and redirect
          localStorage.setItem('token', 'mock-token-123')
          localStorage.setItem('user', JSON.stringify({
            id: 1,
            email: 'test@example.com',
            username: 'testuser',
            avatar_url: 'https://gitlab.com/uploads/-/system/user/avatar/123/avatar.png'
          }))
          
          router.push('/documents')
        } catch (error) {
          console.error('Auth error:', error)
          router.push('/auth?error=authentication_failed')
        }
      }
    }

    handleCallback()
  }, [searchParams, router])

  return <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}