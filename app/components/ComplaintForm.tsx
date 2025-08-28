'use client'

import { useState } from 'react'
import { FileText, Loader2, Send, AlertCircle } from 'lucide-react'

interface ComplaintFormProps {
  onComplaintGenerated: (complaint: string) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
}

export default function ComplaintForm({ 
  onComplaintGenerated, 
  isGenerating, 
  setIsGenerating 
}: ComplaintFormProps) {
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!summary.trim()) {
      setError('Please enter a case summary')
      return
    }

    if (summary.trim().length < 50) {
      setError('Please provide a more detailed case summary (at least 50 characters)')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/generate-complaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: summary.trim()
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate complaint')
      }

      const data = await response.json()
      onComplaintGenerated(data.complaint)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const exampleSummaries = [
    "On July 15, 2024, in Los Angeles County, plaintiff John Smith was rear-ended by defendant Jane Doe while stopped at a red light on Sunset Boulevard. The impact caused significant damage to plaintiff's vehicle and resulted in neck and back injuries requiring medical treatment.",
    "On March 3, 2024, plaintiff's property was damaged due to defendant's negligent maintenance of water pipes, causing flooding in plaintiff's basement and destroying personal belongings worth approximately $15,000.",
    "On September 12, 2024, defendant's delivery truck collided with plaintiff's parked vehicle outside plaintiff's residence in San Francisco, causing substantial property damage and forcing plaintiff to seek alternative transportation."
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-6 h-6 text-primary-500" />
          <h2 className="text-2xl font-bold text-gray-900">Generate Legal Complaint</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
              Case Summary *
            </label>
            <p className="text-gray-600 text-sm mb-3">
              Provide a detailed factual summary of the incident, including dates, locations, parties involved, 
              and the nature of damages or injuries.
            </p>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value)
                setError('')
              }}
              placeholder="Enter your case summary here..."
              className="textarea-field"
              disabled={isGenerating}
              rows={8}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                {summary.length} characters (minimum 50)
              </span>
              {summary.length >= 50 && (
                <span className="text-green-600 text-sm font-medium">✓ Ready to generate</span>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isGenerating || !summary.trim() || summary.length < 50}
            className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Complaint...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Generate Legal Complaint</span>
              </>
            )}
          </button>
        </form>

        {/* Example Summaries */}
        <div className="mt-8 border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Example Case Summaries</h3>
          <div className="space-y-4">
            {exampleSummaries.map((example, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 text-sm mb-3">{example}</p>
                <button
                  type="button"
                  onClick={() => setSummary(example)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  disabled={isGenerating}
                >
                  Use this example
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
