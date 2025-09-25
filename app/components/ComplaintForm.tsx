'use client'

import { useState, useEffect } from 'react'
import { FileText, Loader2, Send, AlertCircle, FileEdit } from 'lucide-react'

interface ComplaintFormProps {
  onComplaintGenerated: (complaint: string) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
}

interface CauseOfAction {
  id: string
  name: string
  description: string
  caciSeries: string
  elements: string[]
}

export default function ComplaintForm({ 
  onComplaintGenerated, 
  isGenerating, 
  setIsGenerating 
}: ComplaintFormProps) {
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0)
  const [showManualTemplate, setShowManualTemplate] = useState(false)
  const [selectedCausesOfAction, setSelectedCausesOfAction] = useState<string[]>([])
  const [showCauseSelection, setShowCauseSelection] = useState(false)

  // Available causes of action based on CACI
  const availableCausesOfAction: CauseOfAction[] = [
    {
      id: 'negligence',
      name: 'Negligence',
      description: 'General negligence claim requiring duty, breach, causation, and damages',
      caciSeries: 'CACI 400-series',
      elements: ['Duty of care', 'Breach of duty', 'Causation', 'Damages']
    },
    {
      id: 'negligence_per_se',
      name: 'Negligence Per Se',
      description: 'Negligence based on violation of statute or regulation',
      caciSeries: 'CACI 418',
      elements: ['Statutory violation', 'Plaintiff in protected class', 'Harm type statute intended to prevent', 'Causation', 'Damages']
    },
    {
      id: 'premises_liability',
      name: 'Premises Liability',
      description: 'Liability for dangerous conditions on property',
      caciSeries: 'CACI 1000-series',
      elements: ['Dangerous condition', 'Knowledge or constructive knowledge', 'Failure to use reasonable care', 'Causation', 'Damages']
    },
    {
      id: 'motor_vehicle',
      name: 'Motor Vehicle Negligence',
      description: 'Negligence in operation of motor vehicle',
      caciSeries: 'CACI 700-series',
      elements: ['Operation of motor vehicle', 'Negligent operation', 'Causation', 'Damages']
    },
    {
      id: 'products_liability',
      name: 'Products Liability',
      description: 'Liability for defective products',
      caciSeries: 'CACI 1200-series',
      elements: ['Defective product', 'Use as intended', 'Causation', 'Damages']
    },
    {
      id: 'intentional_tort',
      name: 'Intentional Tort',
      description: 'Intentional harmful or offensive conduct',
      caciSeries: 'CACI 1300-series',
      elements: ['Intent', 'Harmful or offensive contact/conduct', 'Causation', 'Damages']
    },
    {
      id: 'breach_of_contract',
      name: 'Breach of Contract',
      description: 'Breach of contractual obligations',
      caciSeries: 'CACI 300-series',
      elements: ['Valid contract', 'Performance or excuse', 'Breach by defendant', 'Damages']
    },
    {
      id: 'fraud',
      name: 'Fraud/Misrepresentation',
      description: 'Intentional misrepresentation or fraud',
      caciSeries: 'CACI 1900-series',
      elements: ['False representation', 'Knowledge of falsity', 'Intent to induce reliance', 'Justifiable reliance', 'Damages']
    },
    {
      id: 'medical_malpractice',
      name: 'Medical Malpractice',
      description: 'Professional negligence by healthcare providers',
      caciSeries: 'CACI 500-series',
      elements: ['Doctor-patient relationship', 'Standard of care', 'Breach of standard', 'Causation', 'Damages']
    },
    {
      id: 'gross_negligence',
      name: 'Gross Negligence',
      description: 'Extreme departure from ordinary standard of care',
      caciSeries: 'CACI 425',
      elements: ['Duty of care', 'Extreme breach', 'Want of even scant care', 'Causation', 'Damages']
    },
    {
      id: 'battery',
      name: 'Battery',
      description: 'Intentional harmful or offensive contact',
      caciSeries: 'CACI 1300',
      elements: ['Intent to contact', 'Harmful or offensive contact', 'Lack of consent', 'Damages']
    },
    {
      id: 'iied',
      name: 'Intentional Infliction of Emotional Distress',
      description: 'Extreme and outrageous conduct causing severe emotional distress',
      caciSeries: 'CACI 1600',
      elements: ['Extreme/outrageous conduct', 'Intent or recklessness', 'Severe emotional distress', 'Causation']
    },
    {
      id: 'negligent_misrepresentation',
      name: 'Negligent Misrepresentation',
      description: 'Careless provision of false information',
      caciSeries: 'CACI 1903',
      elements: ['False representation', 'No reasonable grounds', 'Intent to induce reliance', 'Justifiable reliance', 'Damages']
    },
    {
      id: 'unfair_business_practices',
      name: 'Unfair Business Practices',
      description: 'Violations of Business & Professions Code §17200',
      caciSeries: 'Bus. & Prof. Code §17200',
      elements: ['Unlawful/unfair/fraudulent business act', 'Injury in fact', 'Lost money or property', 'Causation']
    },
    {
      id: 'punitive_damages',
      name: 'Punitive Damages',
      description: 'Enhanced damages for malicious, oppressive, or fraudulent conduct',
      caciSeries: 'CACI 3940-3949',
      elements: ['Malicious, oppressive, or fraudulent conduct', 'Clear and convincing evidence', 'Reprehensibility of conduct', 'Relationship to compensatory damages']
    }
  ]

  // Handle cooldown timer
  useEffect(() => {
    if (rateLimitCooldown > 0) {
      const timer = setTimeout(() => {
        setRateLimitCooldown(rateLimitCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [rateLimitCooldown])

  const generateManualTemplate = () => {
    const template = `ATTORNEY NAME (California State Bar No. [NUMBER])
EMAIL
LAW FIRM NAME
ADDRESS
CITY, STATE ZIP
Telephone: PHONE

Attorney for [PARTY]

SUPERIOR COURT OF CALIFORNIA
COUNTY OF [COUNTY NAME]

[PLAINTIFF NAME],
    Plaintiff,
v.
[DEFENDANT NAME],
    Defendant.

No. [CASE NUMBER]

COMPLAINT

PARTIES

I. Jurisdiction

1. This Court has jurisdiction over this action because [jurisdiction basis].

2. Venue is proper in this County because [venue basis].

FIRST CAUSE OF ACTION
(Negligence)

3. ${summary.trim() ? `Based on the following facts: ${summary.trim()}` : '[State your factual allegations here]'}

4. Defendant owed Plaintiff a duty of care.

5. Defendant breached that duty by [specific actions that caused the incident].

6. As a proximate result of Defendant's negligence, Plaintiff suffered damages including [describe injuries/damages].

SECOND CAUSE OF ACTION
(Negligence Per Se)
[If applicable based on violation of statute/regulation]

PRAYER FOR RELIEF

WHEREFORE, Plaintiff prays for judgment against Defendant as follows:

1. General damages according to proof;
2. Special damages according to proof;
3. Medical expenses according to proof;
4. Lost wages and earning capacity according to proof;
5. Costs of suit;
6. Such other relief as the Court deems just and proper.

JURY DEMAND

Plaintiff demands trial by jury on all issues so triable.

Dated: ${new Date().toLocaleDateString()}

                    _________________________
                    [ATTORNEY SIGNATURE]
                    [ATTORNEY NAME]
                    Attorney for Plaintiff`
    
    onComplaintGenerated(template)
    setShowManualTemplate(true)
  }

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

    // Check local storage cache first
    const cacheKey = `complaint_${encodeURIComponent(summary.trim().toLowerCase()).replace(/%/g, '_')}`
    const cachedResult = localStorage.getItem(cacheKey)
    
    if (cachedResult) {
      try {
        const parsed = JSON.parse(cachedResult)
        const cacheAge = Date.now() - parsed.timestamp
        const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
        
        if (cacheAge < CACHE_DURATION) {
          console.log('Using cached complaint from localStorage')
          onComplaintGenerated(parsed.complaint)
          return
        }
      } catch (e) {
        // Invalid cache, continue with API call
        localStorage.removeItem(cacheKey)
      }
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
          summary: summary.trim(),
          causesOfAction: selectedCausesOfAction.length > 0 ? selectedCausesOfAction : null
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle quota exceeded specifically
        if (errorData.type === 'quota_exceeded') {
          setError(errorData.userMessage || errorData.error)
          return
        }
        
        // Handle rate limiting
        if (errorData.type === 'rate_limit_exceeded') {
          setError(errorData.error)
          setRateLimitCooldown(errorData.retryAfter || 120)
          return
        }
        
        throw new Error(errorData.error || 'Failed to generate complaint')
      }

      const data = await response.json()
      
      // Cache the result in localStorage
      const cacheKey = `complaint_${encodeURIComponent(summary.trim().toLowerCase()).replace(/%/g, '_')}`
      const cacheData = {
        complaint: data.complaint,
        timestamp: Date.now(),
        summary: summary.trim()
      }
      
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData))
        
        // Clean up old cache entries (keep only 10 most recent)
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('complaint_'))
        if (allKeys.length > 10) {
          const entries = allKeys.map(key => {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}')
              return { key, timestamp: data.timestamp || 0 }
            } catch {
              return { key, timestamp: 0 }
            }
          })
          
          entries.sort((a, b) => a.timestamp - b.timestamp)
          // Remove oldest entries
          for (let i = 0; i < allKeys.length - 10; i++) {
            localStorage.removeItem(entries[i].key)
          }
        }
      } catch (e) {
        console.warn('Failed to cache complaint in localStorage:', e)
      }
      
      onComplaintGenerated(data.complaint)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      
      // If it's a rate limit error, start longer cooldown
      if (errorMessage.includes('Rate limit exceeded')) {
        setRateLimitCooldown(120) // 2 minute cooldown to match server delays
      }
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

          {/* Causes of Action Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Causes of Action (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowCauseSelection(!showCauseSelection)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {showCauseSelection ? 'Hide' : 'Select Specific'} Causes
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              {showCauseSelection 
                ? 'Select specific causes of action to include in your complaint. If none selected, the AI will automatically determine appropriate causes based on your case summary.'
                : 'The AI will automatically determine appropriate causes of action based on your case summary, or you can select specific ones.'
              }
            </p>
            
            {showCauseSelection && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border">
                {availableCausesOfAction.map((cause) => (
                  <div key={cause.id} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id={cause.id}
                      checked={selectedCausesOfAction.includes(cause.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCausesOfAction([...selectedCausesOfAction, cause.id])
                        } else {
                          setSelectedCausesOfAction(selectedCausesOfAction.filter(id => id !== cause.id))
                        }
                      }}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      disabled={isGenerating}
                    />
                    <div className="flex-1">
                      <label htmlFor={cause.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                        {cause.name}
                      </label>
                      <p className="text-xs text-gray-600 mt-1">{cause.description}</p>
                      <p className="text-xs text-primary-600 font-medium mt-1">{cause.caciSeries}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        Elements: {cause.elements.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
                
                {selectedCausesOfAction.length > 0 && (
                  <div className="col-span-full mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <h4 className="text-sm font-medium text-primary-900 mb-2">
                      Selected Causes ({selectedCausesOfAction.length}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCausesOfAction.map((id) => {
                        const cause = availableCausesOfAction.find(c => c.id === id)
                        return cause ? (
                          <span key={id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {cause.name}
                            <button
                              type="button"
                              onClick={() => setSelectedCausesOfAction(selectedCausesOfAction.filter(cId => cId !== id))}
                              className="ml-1 text-primary-600 hover:text-primary-800"
                              disabled={isGenerating}
                            >
                              ×
                            </button>
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rate Limit Helper */}
          {rateLimitCooldown === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Tips to Avoid Rate Limits</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Wait 2+ minutes between requests</li>
                <li>• Use the example summaries to test (they're cached)</li>
                <li>• Similar case summaries will return cached results instantly</li>
                <li>• Consider upgrading your OpenAI API plan for higher limits</li>
              </ul>
            </div>
          )}

          {error && (
            <div className={`border rounded-lg p-4 ${
              error.includes('quota') || error.includes('billing')
                ? 'bg-red-50 border-red-200'
                : error.includes('Rate limit exceeded') 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                <AlertCircle className={`w-5 h-5 ${
                  error.includes('quota') || error.includes('billing')
                    ? 'text-red-600'
                    : error.includes('Rate limit exceeded') 
                      ? 'text-amber-600' 
                      : 'text-red-600'
                }`} />
                <span className={`font-medium ${
                  error.includes('quota') || error.includes('billing')
                    ? 'text-red-800'
                    : error.includes('Rate limit exceeded') 
                      ? 'text-amber-800' 
                      : 'text-red-800'
                }`}>
                  {error.includes('quota') || error.includes('billing') 
                    ? 'OpenAI Quota Exceeded' 
                    : error.includes('Rate limit exceeded') 
                      ? 'Rate Limit Reached' 
                      : 'Error'}
                </span>
              </div>
              
              {/* Quota exceeded - show structured message */}
              {(error.includes('quota') || error.includes('billing')) && (
                <div className="mt-3 space-y-3">
                  <p className="text-red-700 text-sm">
                    Your OpenAI API usage has exceeded the current billing limits.
                  </p>
                  
                  <div className="bg-red-100 rounded-lg p-3">
                    <h4 className="font-medium text-red-900 mb-2">Solutions:</h4>
                    <ul className="text-red-800 text-sm space-y-1">
                      <li>• <a href="https://platform.openai.com/usage" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-900">Check your usage limits</a></li>
                      <li>• <a href="https://platform.openai.com/account/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-900">Add payment method or increase limits</a></li>
                      <li>• Wait for your quota to reset (if on free tier)</li>
                      <li>• <button 
                           onClick={generateManualTemplate}
                           className="underline hover:text-red-900 text-left"
                         >
                           Generate manual template instead
                         </button></li>
                    </ul>
                    <p className="text-red-700 text-xs mt-2">
                      📖 For detailed setup instructions, see <code className="bg-red-200 px-1 rounded">OPENAI_SETUP.md</code> in your project folder.
                    </p>
                  </div>
                  
                  <details className="text-sm">
                    <summary className="text-red-700 cursor-pointer hover:text-red-800">Show manual complaint template</summary>
                    <div className="mt-2 p-3 bg-gray-100 rounded text-gray-700 font-mono text-xs">
                      <pre>{`[Attorney Name] (California State Bar No. [Number])
[Email]
[Law Firm Name]
[Address]
[City, State ZIP]
Telephone: [Phone]

Attorney for [Party]

SUPERIOR COURT OF CALIFORNIA
COUNTY OF [COUNTY NAME]

[Plaintiff Name],
    Plaintiff,
v.
[Defendant Name],
    Defendant.

No. [Case Number]

COMPLAINT

PARTIES

I. Jurisdiction
[Your allegations here...]`}</pre>
                    </div>
                  </details>
                </div>
              )}
              
              {/* Rate limit error */}
              {!error.includes('quota') && !error.includes('billing') && (
                <>
                  <p className={`mt-1 ${
                    error.includes('Rate limit exceeded') 
                      ? 'text-amber-700' 
                      : 'text-red-700'
                  }`}>
                    {error}
                  </p>
                  {error.includes('Rate limit exceeded') && rateLimitCooldown > 0 && (
                    <div className="mt-3 p-3 bg-amber-100 rounded-lg">
                      <p className="text-amber-800 text-sm font-medium">
                        ⏱️ Automatic retry in {rateLimitCooldown} seconds
                      </p>
                      <p className="text-amber-700 text-sm mt-1">
                        To avoid rate limits in the future, consider upgrading your OpenAI API plan or wait longer between requests.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isGenerating || !summary.trim() || summary.length < 50 || rateLimitCooldown > 0}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Complaint...</span>
                </>
              ) : rateLimitCooldown > 0 ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span>Please wait {rateLimitCooldown}s (Rate Limited)</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Generate AI-Powered Complaint</span>
                </>
              )}
            </button>
            
            <div className="text-center">
              <span className="text-gray-500 text-sm">or</span>
            </div>
            
            <button
              type="button"
              onClick={generateManualTemplate}
              disabled={isGenerating}
              className="btn-secondary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileEdit className="w-5 h-5" />
              <span>Use Manual Template</span>
            </button>
          </div>
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
