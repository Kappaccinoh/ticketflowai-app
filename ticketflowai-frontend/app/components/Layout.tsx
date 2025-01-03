'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check for mock authentication
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userStr))
    } else {
      setIsAuthenticated(false)
      setUser(null)
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    window.location.reload()
    router.push('/')
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-semibold text-indigo-600">TicketFlow AI</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <>
                  <Link 
                    href="/documents" 
                    className={`
                      inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
                      ${pathname === '/documents' 
                        ? 'text-indigo-600 bg-indigo-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-1.5" />
                    View Documents
                  </Link>

                  <div className="h-6 w-px bg-gray-200" aria-hidden="true" />
                </>
              )}

              {!loading && (
                isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    {user && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{user.username}</span>
                        <img 
                          src={user.avatar_url} 
                          alt="User avatar" 
                          className="h-8 w-8 rounded-full"
                        />
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="
                        inline-flex items-center px-4 py-2 
                        text-sm font-medium rounded-md
                        text-gray-700 hover:text-gray-900
                        hover:bg-gray-50
                      "
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/auth"
                    className="
                      inline-flex items-center px-4 py-2 
                      text-sm font-medium rounded-md
                      text-gray-700 hover:text-gray-900
                      hover:bg-gray-50
                    "
                  >
                    Sign in
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        {children}
      </main>
    </div>
  )
}