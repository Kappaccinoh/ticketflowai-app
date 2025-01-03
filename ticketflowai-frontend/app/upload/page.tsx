'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../components/ui/Button'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setMessage(null)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${API_URL}/documents/upload/`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'File uploaded successfully!' })
        setTimeout(() => {
          router.push(`/tickets?document=${data.id}`)
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-8">
        {/* File Upload Area */}
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="file-upload"
            accept=".pdf,.txt,.doc,.docx"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer text-blue-500 hover:text-blue-600"
          >
            Click to upload or drag and drop
          </label>
          
          {/* File Selected Message */}
          {file && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                Selected file: {file.name}
              </p>
            </div>
          )}
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={!file || loading}
            loading={loading}
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </div>
    </div>
  )
}