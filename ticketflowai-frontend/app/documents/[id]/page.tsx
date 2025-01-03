'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  DocumentIcon, 
  ArrowLeftIcon, 
  ArrowPathIcon,
  DocumentTextIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import Button from '@/app/components/ui/Button'
import api from '@/app/lib/api'
import Link from 'next/link'

interface Ticket {
  id: number
  title: string
  description: string
  estimated_hours: string
  status: string
  priority: string
}

interface Document {
  id: number
  file_name: string
  jira_status: string
  tickets: Ticket[]
  scope_summary: string
  clarifying_questions: string
}

interface Project {
    value: string
    label: string
}

export default function DocumentPage() {
  const { id } = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [pushing, setPushing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [gitlabProjects, setGitlabProjects] = useState<Project[]>([])
  const [selectedGitlabProject, setSelectedGitlabProject] = useState<string>('')
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    questions: true,
    tickets: true
  })

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await api.get(`/documents/${id}/`)
        setDocument(response.data)
        const projects = await api.get('/documents/jira-projects/')
        setProjects(projects.data)
        const gitlabProjects = await api.get('/documents/gitlab-projects/')
        setGitlabProjects(gitlabProjects.data)
      } catch (err) {
        setError('Failed to load document')
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [id])

  console.log(document)

  const handleTicketUpdate = async (ticketId: number, updates: Partial<Ticket>) => {
    try {
      await api.patch(`/tickets/${ticketId}/`, updates)
      // Refresh document data
      const response = await api.get(`/documents/${id}/`)
      setDocument(response.data)
    } catch (err) {
      setError('Failed to update ticket')
    }
  }

  const handlePushToJira = async (documentId: number) => {
    if (!selectedProject || !selectedGitlabProject) return;
    setPushing(true);

    try {
      await api.post(`/documents/${documentId}/push-to-jira/`, {
        project_key: selectedProject,
        gitlab_project_id: selectedGitlabProject
      });
      
      const response = await api.get(`/documents/${id}/`);
      setDocument(response.data);
    } catch (error) {
      console.error('Failed to push:', error);
      setError('Failed to push to Jira/GitLab');
    } finally {
      setPushing(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

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
    <div className="min-h-screen bg-gray-50/50">
      {/* Sticky Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/documents" className="text-gray-500 hover:text-gray-800 flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back</span>
              </Link>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg font-semibold text-gray-800">{document?.file_name}</span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 text-gray-600">
                  <DocumentIcon className="h-4 w-4" />
                  {document?.tickets.length} Tickets Generated
                </span>
                <span className="text-gray-300">•</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  document?.jira_status === 'PUSHED' 
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {document?.jira_status === 'PUSHED' ? 'Pushed to Jira' : 'Ready to Push'}
                </span>
              </div>
            </div>

            <Button
              onClick={() => router.push(`/documents/${id}/view`)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <DocumentTextIcon className="h-4 w-4" />
              View PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Summary and Questions */}
          <div className="col-span-3 space-y-4">
            {/* Scope Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div 
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSection('summary')}
              >
                <div className="flex items-center gap-2">
                  <LightBulbIcon className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-base font-medium text-gray-800">Scope Summary</h2>
                </div>
                {expandedSections.summary ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
              {expandedSections.summary && (
                <div className="p-3 border-t border-gray-100">
                  <div className="prose prose-sm max-w-none text-gray-600">
                    <p>{document?.scope_summary}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Clarifying Questions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div 
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSection('questions')}
              >
                <div className="flex items-center gap-2">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-base font-medium text-gray-800">Clarifying Questions</h2>
                </div>
                {expandedSections.questions ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
              {expandedSections.questions && (
                <div className="p-3 border-t border-gray-100">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <QuestionMarkCircleIcon className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{document?.clarifying_questions}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Tickets and Push Settings */}
          <div className="col-span-9 space-y-4">
            {/* Push Settings */}
            {document?.jira_status === 'PROCESSED' && (
              <div id="push-settings" className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="grid grid-cols-[1fr,1fr,auto] gap-4 items-end">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="jira-project" className="text-sm font-medium text-gray-700">
                      Jira Project
                    </label>
                    <select
                      id="jira-project"
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full rounded-md border-gray-200 text-sm shadow-sm text-gray-600 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="" className="text-gray-500">Select Jira Project</option>
                      {projects.map(project => (
                        <option key={project.value} value={project.value} className="text-gray-900">
                          {project.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="gitlab-project" className="text-sm font-medium text-gray-700">
                      GitLab Project
                    </label>
                    <select
                      id="gitlab-project"
                      value={selectedGitlabProject}
                      onChange={(e) => setSelectedGitlabProject(e.target.value)}
                      className="w-full rounded-md border-gray-200 text-sm shadow-sm text-gray-600 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="" className="text-gray-500">Select GitLab Project</option>
                      {gitlabProjects.map(project => (
                        <option key={project.value} value={project.value} className="text-gray-900">
                          {project.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Button 
                    onClick={() => handlePushToJira(document.id)}
                    disabled={!selectedProject || !selectedGitlabProject || pushing}
                    className="px-6"
                  >
                    {pushing ? (
                      <span className="flex items-center gap-2">
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        Pushing...
                      </span>
                    ) : (
                      'Push to Jira & GitLab'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Tickets Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-medium text-gray-800">Generated Tickets</h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider w-24">Priority</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider w-24">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {document?.tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={ticket.title}
                            onChange={(e) => handleTicketUpdate(ticket.id, { title: e.target.value })}
                            className="w-full rounded-md border-gray-200 text-sm shadow-sm text-gray-800 placeholder-gray-500"
                            placeholder="Ticket title"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <textarea
                            value={ticket.description}
                            onChange={(e) => handleTicketUpdate(ticket.id, { description: e.target.value })}
                            className="w-full rounded-md border-gray-200 text-sm shadow-sm min-h-[80px] resize-y text-gray-800 placeholder-gray-500"
                            placeholder="Ticket description"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={ticket.priority}
                            onChange={(e) => handleTicketUpdate(ticket.id, { priority: e.target.value })}
                            className="w-full rounded-md border-gray-200 text-sm shadow-sm text-gray-800 bg-white"
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={ticket.estimated_hours}
                            onChange={(e) => handleTicketUpdate(ticket.id, { estimated_hours: e.target.value })}
                            className="w-full rounded-md border-gray-200 text-sm shadow-sm text-gray-800 placeholder-gray-500"
                            placeholder="Hours"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
