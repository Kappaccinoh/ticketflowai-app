'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from './components/ui/Button'
import { 
  ArrowRightIcon, 
  DocumentTextIcon, 
  SparklesIcon,
  DocumentPlusIcon,
  ClockIcon,
  DocumentDuplicateIcon 
} from '@heroicons/react/24/outline'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userStr))
    }
  }, [])

  if (isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-white to-indigo-50/30 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back, <span className="text-indigo-600">{user?.username}</span>
            </h1>
            <p className="mt-2 text-gray-600">
              Continue working on your documents or create new tickets
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Link href="/upload" 
              className="
                group
                bg-white p-6 rounded-xl shadow-sm border border-gray-100
                hover:shadow-md hover:border-indigo-100 transition-all
              "
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  <DocumentPlusIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Upload New Document</h3>
                  <p className="text-sm text-gray-600">Convert your documents into Jira tickets</p>
                </div>
              </div>
            </Link>

            <Link href="/documents" 
              className="
                group
                bg-white p-6 rounded-xl shadow-sm border border-gray-100
                hover:shadow-md hover:border-indigo-100 transition-all
              "
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  <DocumentDuplicateIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">View Documents</h3>
                  <p className="text-sm text-gray-600">Access and manage your existing documents</p>
                </div>
              </div>
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Recent Activity</h3>
                  <p className="text-sm text-gray-600">Coming soon...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats or Info Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-semibold text-indigo-600">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tickets Generated</p>
                <p className="text-2xl font-semibold text-indigo-600">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time Saved</p>
                <p className="text-2xl font-semibold text-indigo-600">0h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Original landing page for non-authenticated users
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-white to-indigo-50/30">
      <div className="max-w-3xl text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium bg-indigo-50 w-fit mx-auto px-4 py-1 rounded-full text-sm">
            <SparklesIcon className="h-5 w-5" />
            <span>AI-Powered Project Management</span>
          </div>
          
          <h1 className="text-5xl font-semibold text-gray-900 tracking-tight">
            Transform Documents into 
            <span className="text-indigo-600"> Actionable Tasks</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Automatically convert your project documents into well-structured Jira tickets using advanced AI technology
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Link href="/upload">
            <Button className="flex items-center gap-2 text-base px-6 py-3 bg-indigo-600 hover:bg-indigo-700 shadow-sm">
              <DocumentTextIcon className="h-5 w-5" />
              Upload Document
            </Button>
          </Link>
          <Link href="/tickets">
            <Button 
              className="
                flex items-center gap-2 
                text-base px-6 py-3 
                bg-gray-800 
                text-white
                border border-gray-700
                shadow-sm
                hover:bg-gray-700
                transition-colors
              "
            >
              View Tickets
              <ArrowRightIcon className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">AI-Powered Analysis</h3>
            <p className="text-gray-600">
              Our AI analyzes your documents and extracts key requirements automatically
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Jira Integration</h3>
            <p className="text-gray-600">
              Seamlessly push generated tickets to your Jira projects with one click
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Time Saving</h3>
            <p className="text-gray-600">
              Reduce manual ticket creation time by up to 80% with automated processing
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}