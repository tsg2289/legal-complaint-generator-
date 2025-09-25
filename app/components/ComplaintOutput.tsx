'use client'

import { useState } from 'react'
import { FileText, Copy, Check, RotateCcw, Plus, FileIcon } from 'lucide-react'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

interface ComplaintOutputProps {
  complaint: string
  onNewComplaint: () => void
}

export default function ComplaintOutput({ complaint, onNewComplaint }: ComplaintOutputProps) {
  const [copied, setCopied] = useState(false)
  const [showProofOfService, setShowProofOfService] = useState(false)
  const [selectedCounty, setSelectedCounty] = useState('Los Angeles')
  const [attorneyName, setAttorneyName] = useState('RANDY LENO')
  const [attorneyEmail, setAttorneyEmail] = useState('RLENO@FAKE.com')
  const [attorneyBarNumber, setAttorneyBarNumber] = useState('119478')

  // California Counties List
  const californiaCounties = [
    'Alameda', 'Alpine', 'Amador', 'Butte', 'Calaveras', 'Colusa', 'Contra Costa',
    'Del Norte', 'El Dorado', 'Fresno', 'Glenn', 'Humboldt', 'Imperial', 'Inyo',
    'Kern', 'Kings', 'Lake', 'Lassen', 'Los Angeles', 'Madera', 'Marin',
    'Mariposa', 'Mendocino', 'Merced', 'Modoc', 'Mono', 'Monterey', 'Napa',
    'Nevada', 'Orange', 'Placer', 'Plumas', 'Riverside', 'Sacramento', 'San Benito',
    'San Bernardino', 'San Diego', 'San Francisco', 'San Joaquin', 'San Luis Obispo',
    'San Mateo', 'Santa Barbara', 'Santa Clara', 'Santa Cruz', 'Shasta', 'Sierra',
    'Siskiyou', 'Solano', 'Sonoma', 'Stanislaus', 'Sutter', 'Tehama', 'Trinity',
    'Tulare', 'Tuolumne', 'Ventura', 'Yolo', 'Yuba'
  ]

  // Sample attorney names for dropdown
  const attorneyNames = [
    'RANDY LENO', 'MICHAEL JOHNSON', 'SARAH WILLIAMS', 'DAVID BROWN', 'JESSICA DAVIS',
    'CHRISTOPHER MILLER', 'AMANDA WILSON', 'MATTHEW MOORE', 'JENNIFER TAYLOR', 'ROBERT ANDERSON'
  ]

  // Sample attorney emails for dropdown
  const attorneyEmails = [
    'RLENO@FAKE.com', 'MJOHNSON@LAWFIRM.com', 'SWILLIAMS@LEGAL.com', 'DBROWN@ATTORNEY.com',
    'JDAVIS@LAWOFFICE.com', 'CMILLER@LEGAL.net', 'AWILSON@LAWFIRM.org', 'MMOORE@ATTORNEY.net',
    'JTAYLOR@LEGAL.org', 'RANDERSON@LAWOFFICE.net'
  ]

  // Sample bar numbers for dropdown  
  const barNumbers = [
    '119478', '123456', '234567', '345678', '456789',
    '567890', '678901', '789012', '890123', '901234'
  ]

  const proofOfServiceText = `PROOF OF SERVICE

STATE OF CALIFORNIA, COUNTY OF ${selectedCounty.toUpperCase()}

At the time of service, I was over 18 years of age and not a party to this action. I am employed in the County of ${selectedCounty}, State of California. My business address is Telluride, California.

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

  

  const handleDownloadWord = async () => {
    try {
      // Create structured content for Word document
      const documentSections = [
        // Attorney Information Block
        `${attorneyName.toUpperCase()} (California State Bar No. ${attorneyBarNumber})`,
        `${attorneyEmail.toUpperCase()}`,
        'FAKE LAW OFFICE, LLP',
        '2465 Boulevard East, 9th Floor',
        'Telluride, California 98623-4568',
        'Telephone: (562) 729-4689',
        'Facsimile: (562) 729-4689',
        '',
        'Attorney for Defendant',
        '',
        // Court Header
        'SUPERIOR COURT OF CALIFORNIA',
        `COUNTY OF ${selectedCounty.toUpperCase()}`,
        '',
        // Case Caption
        'John Q. Public,',
        'Plaintiff,',
        'v.',
        '',
        'LMNOP Company,',
        'Defendant.',
        '',
        'No. 2:05-cv-00700-ABC-DEF',
        '',
        // Document Title
        'COMPLAINT',
        '',
        'PARTIES',
        '',
        'I. Jurisdiction',
        ''
      ]
      
      // Add the generated complaint content
      const complaintLines = complaint.split('\n')
      const allContent = [...documentSections, ...complaintLines]
      
      // Add proof of service if selected
      if (showProofOfService) {
        allContent.push('', ...proofOfServiceText.split('\n'))
      }
      
      const paragraphs = allContent.map((line, index) => {
        const lineNumber = index + 1
        const hasLineNumber = lineNumber <= 28
        
        // Determine formatting based on content
        let alignment: "left" | "center" | "right" | undefined = "left"
        let bold = false
        let indentFirst = 0.5 // 0.5 inch first line indent for body text
        
        // Court headers - centered and bold
        if (line === 'SUPERIOR COURT OF CALIFORNIA' || 
            line === `COUNTY OF ${selectedCounty.toUpperCase()}` ||
            line === 'COMPLAINT' || 
            line === 'PARTIES') {
          alignment = "center"
          bold = true
          indentFirst = 0
        }
        
        // Case caption items - centered
        if (line === 'Plaintiff,' || line === 'v.' || line === 'Defendant.') {
          alignment = "center"
          indentFirst = 0
        }
        
        // Title 1 style for jurisdiction
        if (line === 'I. Jurisdiction') {
          bold = true
          indentFirst = 0.5
        }
        
        return new Paragraph({
          children: [
            new TextRun({
              text: line || ' ',
              font: 'Times New Roman',
              size: 24, // 12pt
              bold: bold
            })
          ],
          alignment: alignment,
          indent: {
            firstLine: indentFirst * 1440 // Convert inches to twips
          },
          spacing: {
            line: 480, // Double spacing in twips (480 twips = double spacing)
            lineRule: "auto"
          }
        })
      })

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1080, // 0.75 inch (3/4 inch)
                  right: 1440, // 1 inch
                  bottom: 1080, // 0.75 inch (3/4 inch)
                  left: 1440 // 1 inch
                }
              }
            },
            children: paragraphs
          }
        ]
      })

      const buffer = await Packer.toBuffer(doc)
      const attorneyLastName = attorneyName.split(' ').pop() || 'Attorney'
      const fileName = showProofOfService 
        ? `${selectedCounty}-County-Complaint-${attorneyLastName}-with-Proof-of-Service-${new Date().toISOString().slice(0, 10)}.docx`
        : `${selectedCounty}-County-Complaint-${attorneyLastName}-${new Date().toISOString().slice(0, 10)}.docx`
      
      const blob = new Blob([new Uint8Array(buffer)], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      })
      saveAs(blob, fileName)
    } catch (err) {
      console.error('Failed to generate Word document:', err)
      alert('Failed to generate Word document. Please try copying the text instead.')
    }
  }

  const handleAddProofOfService = () => {
    setShowProofOfService(!showProofOfService)
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
            <div className="flex items-center space-x-2">
              <label htmlFor="county-select" className="text-sm font-medium text-gray-700">
                County:
              </label>
              <select
                id="county-select"
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {californiaCounties.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="attorney-name-select" className="text-sm font-medium text-gray-700">
                Attorney:
              </label>
              <select
                id="attorney-name-select"
                value={attorneyName}
                onChange={(e) => setAttorneyName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {attorneyNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="attorney-email-select" className="text-sm font-medium text-gray-700">
                Email:
              </label>
              <select
                id="attorney-email-select"
                value={attorneyEmail}
                onChange={(e) => setAttorneyEmail(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {attorneyEmails.map((email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="bar-number-select" className="text-sm font-medium text-gray-700">
                Bar #:
              </label>
              <select
                id="bar-number-select"
                value={attorneyBarNumber}
                onChange={(e) => setAttorneyBarNumber(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {barNumbers.map((number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))}
              </select>
            </div>
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
            <h3 className="font-medium text-gray-900">California Superior Court Document</h3>
            <p className="text-gray-600 text-sm">Generated: {new Date().toLocaleString()}</p>
          </div>
          <div className="bg-white" style={{ padding: '0.75in 1in', fontFamily: 'Times New Roman, serif', fontSize: '12pt', lineHeight: '1.2' }}>
            {/* Court Document Container with proper margins and line numbering */}
            <div className="relative" style={{ minHeight: '9.5in', width: '6.5in', margin: '0 auto', backgroundColor: 'white', border: '1px solid #ccc' }}>
              {/* Left margin for line numbers */}
              <div className="absolute left-0 top-0 bottom-0" style={{ width: '1.25in', borderRight: '1px solid #ddd' }}>
                {/* Line numbers 1-28 */}
                {Array.from({ length: 28 }, (_, i) => (
                  <div 
                    key={i + 1} 
                    className="text-center border-b border-gray-200" 
                    style={{ 
                      height: '14pt', 
                      lineHeight: '14pt', 
                      fontSize: '10pt',
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              
              {/* Main content area */}
              <div style={{ marginLeft: '1.25in', padding: '0 0.5in' }}>
                {/* Court Document Header and Content - Following CAED Pleading Paper Instructions */}
                <div>
                  {/* Attorney Information Block - Body Text Style */}
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textIndent: '0.5in' }}>
                    {attorneyName.toUpperCase()} (California State Bar No. {attorneyBarNumber})
                  </div>
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textIndent: '0.5in' }}>
                    {attorneyEmail.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textIndent: '0.5in' }}>
                    FAKE LAW OFFICE, LLP
                  </div>
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textIndent: '0.5in' }}>
                    2465 Boulevard East, 9th Floor
                  </div>
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textIndent: '0.5in' }}>
                    Telluride, California 98623-4568
                  </div>
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textIndent: '0.5in' }}>
                    Telephone: (562) 729-4689
                  </div>
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textIndent: '0.5in' }}>
                    Facsimile: (562) 729-4689
                  </div>
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textIndent: '0.5in' }}>
                    \u00A0
                  </div>
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textIndent: '0.5in' }}>
                    Attorney for Defendant
                  </div>
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt' }}>
                    \u00A0
                  </div>
                  
                  {/* Court Header - Title Style (bold, all caps, centered) */}
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textAlign: 'center', fontWeight: 'bold' }}>
                    SUPERIOR COURT OF CALIFORNIA
                  </div>
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textAlign: 'center', fontWeight: 'bold' }}>
                    COUNTY OF {selectedCounty.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt' }}>
                    \u00A0
                  </div>
                  
                  {/* Case Caption - Following CAED format */}
                  <div style={{ display: 'flex' }}>
                    {/* Left side - Parties */}
                    <div style={{ flex: '1', paddingRight: '20px' }}>
                      <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textIndent: '0.5in' }}>
                        John Q. Public,
                      </div>
                      <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textAlign: 'center' }}>
                        Plaintiff,
                      </div>
                      <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textAlign: 'center' }}>
                        v.
                      </div>
                      <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt' }}>
                        \u00A0
                      </div>
                      <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textIndent: '0.5in' }}>
                        LMNOP Company,
                      </div>
                      <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textAlign: 'center' }}>
                        Defendant.
                      </div>
                    </div>
                    
                    {/* Right side - Case Info */}
                    <div style={{ width: '200px', paddingLeft: '10px', borderLeft: '1px solid black' }}>
                      <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt' }}>
                        No. 2:05-cv-00700-ABC-DEF
                      </div>
                      <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt' }}>
                        \u00A0
                      </div>
                    </div>
                  </div>
                  
                  {/* Document Title - Title Style (bold, all caps, centered) */}
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textAlign: 'center', fontWeight: 'bold' }}>
                    COMPLAINT
                  </div>
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt' }}>
                    \u00A0
                  </div>
                  
                  {/* Document sections with proper heading styles */}
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', textAlign: 'center', fontWeight: 'bold' }}>
                    PARTIES
                  </div>
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt' }}>
                    \u00A0
                  </div>
                  
                  {/* Title 1 Style - bold, indent left 0.5" */}
                  <div style={{ fontSize: '12pt', fontFamily: 'Times New Roman, serif', lineHeight: '24pt', fontWeight: 'bold', marginLeft: '0.5in' }}>
                    I. Jurisdiction
                  </div>
                  
                  {/* Generated complaint content with proper Body Text formatting */}
                  {(showProofOfService ? `${complaint}\n\n${proofOfServiceText}` : complaint).split('\n').map((line, index) => (
                    <div 
                      key={index + 21} 
                      style={{ 
                        fontSize: '12pt',
                        fontFamily: 'Times New Roman, serif',
                        lineHeight: '24pt',
                        textIndent: line.trim().length > 0 ? '0.5in' : '0'
                      }}
                    >
                      {line || '\u00A0'}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 text-center border-t border-gray-300" style={{ padding: '10px', fontSize: '10pt' }}>
                <div>-1-</div>
                <div style={{ fontSize: '8pt', color: '#666' }}>DEFENDANT'S ANSWER TO COMPLAINT</div>
              </div>
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
