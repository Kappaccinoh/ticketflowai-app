'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/app/lib/api'

export default function DocumentViewPage() {
  const { id } = useParams()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await api.get(`/documents/${id}/view/`, {
          responseType: 'blob'
        })
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
      } catch (err) {
        setError('Failed to load PDF document')
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()

    return () => {
      // Cleanup the object URL when component unmounts
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full">
      <iframe
        src={pdfUrl || ''}
        className="w-full h-full"
        title="PDF Viewer"
      />
    </div>
  )
}
