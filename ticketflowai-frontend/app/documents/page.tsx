'use client'

import { useEffect, useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon, DocumentPlusIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import api from '../lib/api'
import Button from '../components/ui/Button'
import Link from 'next/link'
import { DocumentIcon } from '@heroicons/react/24/outline'

interface Ticket {
  id: number
  title: string
  description: string
  estimated_hours: string
  status: string
  priority: string
  created_at: string
  updated_at: string
}

interface Document {
  id: number
  file_name: string
  content: string
  uploaded_at: string
  jira_status: string
  tickets: Ticket[]
}

export default function TicketsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDoc, setExpandedDoc] = useState<number | null>(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/documents/')
        setDocuments(response.data)
      } catch (error) {
        console.error('Failed to fetch tickets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'text-red-600 bg-red-100'
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100'
      case 'LOW':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-indigo-100 border-t-indigo-600"></div>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Icon */}
          <div className="relative">
            <div className="absolute -inset-1 bg-indigo-100 rounded-full blur-sm"></div>
            <div className="relative bg-white p-4 rounded-full inline-block">
              <DocumentPlusIcon className="h-12 w-12 text-indigo-600" />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">
              No documents yet
            </h2>
            <p className="text-gray-600 max-w-sm mx-auto">
              Upload your first document to start generating Jira tickets automatically using AI.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link href="/upload">
              <Button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3">
                <ArrowUpTrayIcon className="h-5 w-5" />
                Upload Your First Document
              </Button>
            </Link>
            
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Supported file types:
              </h3>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                <span className="px-2 py-1 bg-gray-50 rounded-md border border-gray-200">
                  PDF
                </span>
                <span className="px-2 py-1 bg-gray-50 rounded-md border border-gray-200">
                  DOC
                </span>
                <span className="px-2 py-1 bg-gray-50 rounded-md border border-gray-200">
                  DOCX
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-semibold text-indigo-900">Document Tickets</h1>
      
      {documents.map((document) => (
        <div key={document.id} className="bg-white/80 backdrop-blur-sm shadow rounded-lg overflow-hidden">
          {/* Document Header */}
          <div className="p-4 bg-indigo-50 flex justify-between items-center">
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-indigo-900">{document.file_name}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  document.jira_status === 'PUSHED'
                    ? 'bg-green-200 text-green-900' 
                    : document.jira_status === 'PROCESSED'
                    ? 'bg-blue-200 text-blue-900'
                    : ['FAILED', 'ERROR', 'UNPROCESSED'].includes(document.jira_status)
                    ? 'bg-red-200 text-red-900'
                    : 'bg-gray-200 text-gray-900'
                }`}>
                  {document.jira_status === 'PUSHED'
                    ? '✓ In Jira'
                    : document.jira_status === 'PROCESSED'
                    ? '• Processed'
                    : document.jira_status === 'FAILED'
                    ? '✕ Push Failed'
                    : document.jira_status === 'ERROR'
                    ? '✕ Error'
                    : '• Not Processed'}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                {document.tickets.length} tickets • Generated {new Date(document.uploaded_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Document Link */}
              <Link 
                href={`/documents/${document.id}/view`}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
              >
                <DocumentIcon className="h-4 w-4" />
                <span>View PDF</span>
              </Link>


              {/* Push to Jira Button */}
              {document.jira_status === "PROCESSED" && (
                <Link
                  href={`/documents/${document.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
                >
                  <Button variant="secondary" size="sm">
                    Edit Tickets
                  </Button>
                </Link>
              )}
              
              {/* Expand/Collapse Button */}
              <button
                onClick={() => setExpandedDoc(expandedDoc === document.id ? null : document.id)}
                className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors"
                title={expandedDoc === document.id ? 'Hide Tickets' : 'Show Tickets'}
              >
                {expandedDoc === document.id ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Tickets Table */}
          {expandedDoc === document.id && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Hours</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {document.tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-md">{ticket.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.estimated_hours} hrs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}