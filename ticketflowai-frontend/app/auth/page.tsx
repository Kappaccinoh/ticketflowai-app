'use client'

import { GitlabIcon } from '@/app/components/ui/icons'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      router.push('/')
    }
  }, [router])

  const handleMockLogin = async () => {
    // Store mock token
    localStorage.setItem('token', 'mock-token-123')
    
    // Store mock user data
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      avatar_url: 'https://gitlab.com/uploads/-/system/user/avatar/123/avatar.png'
    }))

    // Force a page reload to update the navbar
    window.location.reload()
    
    // The router.push will happen after the reload
    router.push('/documents')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 bg-gradient-to-b from-white to-indigo-50/30">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-600">
            Sign in to continue to TicketFlow AI
          </p>
        </div>

        <button
        //   onClick={handleGitLabLogin}
          onClick={handleMockLogin}
          className="
            w-full flex items-center justify-center gap-3
            bg-[#171321] text-white 
            py-3 px-4 rounded-lg
            hover:bg-[#211a2c]
            transition-colors
            font-medium
          "
        >
          <GitlabIcon className="h-5 w-5" />
          Continue with GitLab (Mock)
        </button>
      </div>
    </div>
  )
}