'use client'

import { useState, useEffect } from 'react'
import { FileText, Loader2, Send, AlertCircle, FileEdit } from 'lucide-react'

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
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0)
  const [showManualTemplate, setShowManualTemplate] = useState(false)

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
          summary: summary.trim()
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
