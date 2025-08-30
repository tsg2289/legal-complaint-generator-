'use client'

import { useState } from 'react'
import { Download, FileText, Copy, Check, RotateCcw, Printer, Plus, FileIcon } from 'lucide-react'
import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

interface ComplaintOutputProps {
  complaint: string
  onNewComplaint: () => void
}

export default function ComplaintOutput({ complaint, onNewComplaint }: ComplaintOutputProps) {
  const [copied, setCopied] = useState(false)
  const [showProofOfService, setShowProofOfService] = useState(false)

  const proofOfServiceText = `PROOF OF SERVICE

STATE OF CALIFORNIA, COUNTY OF ORANGE

At the time of service, I was over 18 years of age and not a party to this action. I am employed in the County of Orange, State of California. My business address is Telluride, California.

On October 28, 2020, I served true copies of the following document(s) described as
DEFENDANT VALERIE JASPER'S ANSWER TO PLAINTIFFS' COMPLAINT; DEMAND
FOR JURY TRIAL on the interested parties in this action as follows:

BY E-MAIL OR ELECTRONIC TRANSMISSION: I caused a copy of the
document(s) to be sent from e-mail address shanlyn@wfbm.com to the persons at the e-mail
addresses listed in the Service List. I did not receive, within a reasonable time after the
transmission, any electronic message or other indication that the transmission was unsuccessful.

I declare under penalty of perjury under the laws of the State of California that the
foregoing is true and correct.

Executed on October 21, 2023, at Buena Park, California.



                                                    ________________________________
                                                    Sean Arman`

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
      const leftMargin = 25 // Space for line numbers
      const rightMargin = 20
      const lineHeight = 14 // Standard court document line height
      const maxLineWidth = pageWidth - (leftMargin + rightMargin)
      
      // Set up court document formatting
      doc.setFont('times', 'normal')
      doc.setFontSize(12)
      
      const currentContent = showProofOfService ? `${complaint}\n\n${proofOfServiceText}` : complaint
      const lines = currentContent.split('\n')
      let yPosition = 36 // Start position (1.5 inches from top)
      let pageLines = 1
      
      lines.forEach((line: string, index: number) => {
        const lineNumber = index + 1
        const isComplaintSection = index < complaint.split('\n').length
        
        // Check if we need a new page (25 lines per page standard)
        if (yPosition > doc.internal.pageSize.getHeight() - 36) {
          doc.addPage()
          yPosition = 36
          pageLines = 1
        }
        
        // Add line number (only for complaint section, first 25 lines)
        if (lineNumber <= 25 && isComplaintSection && !showProofOfService) {
          doc.setFontSize(10)
          doc.text(lineNumber.toString(), 15, yPosition)
        }
        
        // Add line content
        doc.setFontSize(12)
        if (line.trim()) {
          // Handle long lines by wrapping
          const wrappedLines = doc.splitTextToSize(line, maxLineWidth)
          wrappedLines.forEach((wrappedLine: string, wrapIndex: number) => {
            if (wrapIndex === 0) {
              doc.text(wrappedLine, leftMargin, yPosition)
            } else {
              yPosition += lineHeight
              doc.text(wrappedLine, leftMargin, yPosition)
            }
          })
        }
        
        yPosition += lineHeight
        pageLines++
      })
      
      const fileName = showProofOfService 
        ? `CA-Superior-Court-Complaint-with-Proof-of-Service-${new Date().toISOString().slice(0, 10)}.pdf`
        : `CA-Superior-Court-Complaint-${new Date().toISOString().slice(0, 10)}.pdf`
      
      doc.save(fileName)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      alert('Failed to generate PDF. Please try copying the text instead.')
    }
  }

  const handleDownloadWord = async () => {
    try {
      const currentContent = showProofOfService ? `${complaint}\n\n${proofOfServiceText}` : complaint
      const lines = currentContent.split('\n')
      
      const paragraphs = lines.map((line, index) => {
        const lineNumber = index + 1
        const hasLineNumber = lineNumber <= 25 && !showProofOfService
        
        return new Paragraph({
          children: [
            ...(hasLineNumber ? [
              new TextRun({
                text: lineNumber.toString().padStart(2, ' ') + ' ',
                font: 'Times New Roman',
                size: 20, // 10pt
                color: '666666'
              })
            ] : []),
            new TextRun({
              text: line || ' ',
              font: 'Times New Roman',
              size: 24 // 12pt
            })
          ],
          spacing: {
            after: 240 // Equivalent to 14pt line spacing
          }
        })
      })

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440, // 1 inch
                  right: 1440,
                  bottom: 1440,
                  left: 1440
                }
              }
            },
            children: paragraphs
          }
        ]
      })

      const buffer = await Packer.toBuffer(doc)
      const fileName = showProofOfService 
        ? `CA-Superior-Court-Complaint-with-Proof-of-Service-${new Date().toISOString().slice(0, 10)}.docx`
        : `CA-Superior-Court-Complaint-${new Date().toISOString().slice(0, 10)}.docx`
      
      saveAs(new Blob([buffer]), fileName)
    } catch (err) {
      console.error('Failed to generate Word document:', err)
      alert('Failed to generate Word document. Please try copying the text instead.')
    }
  }

  const handleAddProofOfService = () => {
    setShowProofOfService(!showProofOfService)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const currentContent = showProofOfService ? `${complaint}\n\n${proofOfServiceText}` : complaint
      const lines = currentContent.split('\n')
      const formattedContent = lines.map((line, index) => {
        const lineNumber = index + 1
        const lineNumberText = lineNumber <= 25 && !showProofOfService ? lineNumber.toString().padStart(2, ' ') : '  '
        return `<div class="line"><span class="line-number">${lineNumberText}</span><span class="line-content">${line || '&nbsp;'}</span></div>`
      }).join('')

      printWindow.document.write(`
        <html>
          <head>
            <title>California Superior Court Complaint</title>
            <style>
              body { 
                font-family: 'Times New Roman', serif; 
                margin: 1in; 
                color: #000;
                font-size: 12pt;
                line-height: 14pt;
              }
              .line {
                display: flex;
                min-height: 14pt;
                page-break-inside: avoid;
              }
              .line-number {
                width: 25px;
                text-align: right;
                padding-right: 10px;
                font-size: 10pt;
                color: #666;
                flex-shrink: 0;
              }
              .line-content {
                flex: 1;
              }
              @media print {
                body { 
                  margin: 1in;
                  -webkit-print-color-adjust: exact;
                }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${formattedContent}
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
          <div className="flex items-center space-x-3 flex-wrap">
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
              onClick={handleAddProofOfService}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showProofOfService 
                  ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{showProofOfService ? 'Remove' : 'Add'} Proof of Service</span>
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
              onClick={handleDownloadWord}
              className="btn-secondary flex items-center space-x-2"
            >
              <FileIcon className="w-4 h-4" />
              <span>Download Word</span>
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
            <h3 className="font-medium text-gray-900">California Superior Court Complaint</h3>
            <p className="text-gray-600 text-sm">Generated: {new Date().toLocaleString()}</p>
          </div>
          <div className="p-6 bg-white">
            <div className="complaint-document font-mono text-sm leading-6">
              {(showProofOfService ? `${complaint}\n\n${proofOfServiceText}` : complaint).split('\n').map((line, index) => {
                const lineNumber = index + 1;
                const isComplaintSection = index < complaint.split('\n').length;
                const showLineNumber = lineNumber <= 25 && isComplaintSection && !showProofOfService;
                
                return (
                  <div key={index} className="flex">
                    <div className="w-8 text-right text-gray-500 pr-2 flex-shrink-0">
                      {showLineNumber ? lineNumber : ''}
                    </div>
                    <div className="flex-1 min-h-[24px]">
                      <span className="font-serif text-black">
                        {line || '\u00A0'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
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
