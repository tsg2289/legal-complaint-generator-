'use client'

import { useState } from 'react'
import { Download, FileText, Copy, Check, RotateCcw, Printer } from 'lucide-react'
import jsPDF from 'jspdf'

interface ComplaintOutputProps {
  complaint: string
  onNewComplaint: () => void
}

export default function ComplaintOutput({ complaint, onNewComplaint }: ComplaintOutputProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(complaint)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const lineHeight = 6
      const maxLineWidth = pageWidth - (margin * 2)
      
      // Title
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Legal Complaint', margin, 30)
      
      // Date
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 40)
      
      // Content
      doc.setFontSize(12)
      const lines = doc.splitTextToSize(complaint, maxLineWidth)
      let yPosition = 55
      
      lines.forEach((line: string) => {
        if (yPosition > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += lineHeight
      })
      
      doc.save(`complaint-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      alert('Failed to generate PDF. Please try copying the text instead.')
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Legal Complaint</title>
            <style>
              body { 
                font-family: 'Times New Roman', serif; 
                line-height: 1.6; 
                margin: 1in; 
                color: #000;
              }
              h1 { 
                text-align: center; 
                margin-bottom: 20px;
                font-size: 18px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 1px solid #000;
                padding-bottom: 10px;
              }
              .content {
                white-space: pre-wrap;
                font-size: 12px;
              }
              @media print {
                body { margin: 0.5in; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>LEGAL COMPLAINT</h1>
              <p>Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="content">${complaint}</div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-bold text-gray-900">Generated Complaint</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onNewComplaint}
              className="btn-primary flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Complaint</span>
            </button>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Complaint generated successfully!
            </span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Review the content below and make any necessary adjustments before filing.
          </p>
        </div>

        {/* Complaint Content */}
        <div className="border border-gray-200 rounded-lg">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Legal Complaint Document</h3>
            <p className="text-gray-600 text-sm">Generated: {new Date().toLocaleString()}</p>
          </div>
          <div className="p-6">
            <pre className="whitespace-pre-wrap font-serif text-gray-900 leading-relaxed">
              {complaint}
            </pre>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-900 mb-2">⚠️ Legal Disclaimer</h4>
          <p className="text-amber-800 text-sm">
            This document is AI-generated and should be reviewed by a qualified attorney before filing. 
            The content may require modifications to meet specific jurisdictional requirements and 
            case-specific details. Always consult with legal counsel for proper legal advice.
          </p>
        </div>
      </div>
    </div>
  )
}
