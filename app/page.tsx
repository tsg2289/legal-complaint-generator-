'use client'

import { useState } from 'react'
import { FileText, Shield } from 'lucide-react'
import ComplaintForm from './components/ComplaintForm'
import ComplaintOutput from './components/ComplaintOutput'

export default function Home() {
  const [generatedComplaint, setGeneratedComplaint] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  const handleComplaintGenerated = (complaint: string) => {
    setGeneratedComplaint(complaint)
  }

  const handleNewComplaint = () => {
    setGeneratedComplaint('')
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-dark-900 to-dark-800 text-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-8 h-8 text-primary-400" />
          <h2 className="text-3xl font-bold">Professional Legal Complaint Generator</h2>
        </div>
        <p className="text-gray-300 text-lg">
          Create comprehensive California Superior Court complaints with AI assistance. 
          Secure, professional, and efficient legal document generation.
        </p>
        
        {/* Security Badge */}
        <div className="mt-6 flex items-center space-x-2 bg-primary-900/20 px-4 py-2 rounded-lg inline-flex">
          <Shield className="w-5 h-5 text-primary-400" />
          <span className="text-primary-300 font-medium">Secure & Confidential</span>
        </div>
      </div>

      {/* Main Content */}
      {!generatedComplaint && (
        <ComplaintForm
          onComplaintGenerated={handleComplaintGenerated}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />
      )}

      {generatedComplaint && (
        <ComplaintOutput
          complaint={generatedComplaint}
          onNewComplaint={handleNewComplaint}
        />
      )}
    </div>
  )
}
