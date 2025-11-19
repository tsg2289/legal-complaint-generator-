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
      {/* Hero Section with Glass Effect */}
      <div className="glass-card text-white p-8 rounded-2xl shadow-2xl border border-white/20">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-8 h-8 text-white drop-shadow-lg" />
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">Professional Legal Complaint Generator</h2>
        </div>
        <p className="text-gray-100 text-lg opacity-95">
          Create comprehensive California Superior Court complaints with AI assistance. 
          Secure, professional, and efficient legal document generation.
        </p>
        
        {/* Security Badge with Glass Effect */}
        <div className="mt-6 flex items-center space-x-2 glass-button px-4 py-2 rounded-xl inline-flex border border-white/30">
          <Shield className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Secure & Confidential</span>
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
