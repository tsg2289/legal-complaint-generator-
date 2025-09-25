import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory queue to prevent concurrent requests
let isProcessing = false
const requestQueue: Array<() => void> = []

// Simple cache to store recent responses (in production, use Redis or similar)
const responseCache = new Map<string, { complaint: string, timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Generate cache key from summary
const generateCacheKey = (summary: string): string => {
  return Buffer.from(summary.toLowerCase().trim()).toString('base64')
}

// Process queue
const processQueue = async () => {
  if (requestQueue.length > 0 && !isProcessing) {
    const nextRequest = requestQueue.shift()
    if (nextRequest) {
      try {
        await nextRequest()
      } catch (error) {
        console.error('Error processing queued request:', error)
      }
    }
  }
}

export async function POST(request: NextRequest) {
  // If another request is processing, queue this one
  if (isProcessing) {
    return new Promise<NextResponse>((resolve, reject) => {
      requestQueue.push(async () => {
        try {
          const response = await handleComplaintGeneration(request)
          resolve(response)
        } catch (error) {
          reject(error)
        }
      })
      
      // Process the queue after adding the request
      setTimeout(processQueue, 100)
    })
  }

  return handleComplaintGeneration(request)
}

async function handleComplaintGeneration(request: NextRequest): Promise<NextResponse> {
  isProcessing = true
  
  try {
    const body = await request.json()
    const { summary, causesOfAction, attorneys, county, plaintiffs, defendants, caseNumber } = body

    // Validation
    if (!summary || typeof summary !== 'string') {
      return NextResponse.json(
        { error: 'Case summary is required' },
        { status: 400 }
      )
    }

    // Use server-side API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('OPENAI_API_KEY environment variable is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
    
    // Sanitize input
    const sanitizedSummary = summary.trim().slice(0, 5000) // Limit length
    
    console.log('API Key configured:', apiKey ? `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}` : 'NOT SET')
    console.log('Request summary length:', sanitizedSummary.length)

    // Check cache first
    const cacheKey = generateCacheKey(sanitizedSummary)
    const cached = responseCache.get(cacheKey)
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('Returning cached response')
      return NextResponse.json({ 
        complaint: cached.complaint,
        cached: true 
      })
    }

    // Build causes of action instruction
    const causesInstruction = causesOfAction && causesOfAction.length > 0 
      ? `\n\nSPECIFIC CAUSES OF ACTION REQUESTED: ${causesOfAction.join(', ').toUpperCase()}\nInclude ONLY these causes of action in the complaint, structured according to their respective CACI elements.`
      : '\n\nAUTO-DETERMINE CAUSES: Analyze the facts and determine the most appropriate causes of action from the available options.'

    // Build attorney information for header
    const attorneyInfo = attorneys && attorneys.length > 0 
      ? attorneys.map((attorney: any) => ({
          name: attorney.name?.trim() || '[ATTORNEY NAME]',
          email: attorney.email?.trim() || '[EMAIL]',
          barNumber: attorney.barNumber?.trim() || '[BAR NUMBER]',
          lawFirmName: attorney.lawFirmName?.trim() || '[LAW FIRM NAME]',
          lawFirmAddress: attorney.lawFirmAddress?.trim() || '[ADDRESS]\n[CITY, STATE ZIP]',
          lawFirmPhone: attorney.lawFirmPhone?.trim() || '[PHONE]'
        }))
      : [{ 
          name: '[ATTORNEY NAME]', 
          email: '[EMAIL]', 
          barNumber: '[BAR NUMBER]',
          lawFirmName: '[LAW FIRM NAME]',
          lawFirmAddress: '[ADDRESS]\n[CITY, STATE ZIP]',
          lawFirmPhone: '[PHONE]'
        }]

    // Create plaintiff names string
    const plaintiffNames = plaintiffs && plaintiffs.length > 0 
      ? plaintiffs.map((p: any) => p.name?.trim()).filter(Boolean).join(', ')
      : 'Plaintiff'

    const attorneyHeader = attorneyInfo
      .map((attorney: { name: string; email: string; barNumber: string; lawFirmName: string; lawFirmAddress: string; lawFirmPhone: string }, index: number) => 
        `${attorney.name} (California State Bar No. ${attorney.barNumber})\n${attorney.email}\n${attorney.lawFirmName}\n${attorney.lawFirmAddress}\nTelephone: ${attorney.lawFirmPhone}${index === 0 ? `\n\nAttorney for Plaintiff ${plaintiffNames}` : ''}`
      ).join('\n\n')

    const prompt = `Generate comprehensive California Superior Court complaint with MULTIPLE causes of action. ABSOLUTE REQUIREMENT: Include 3-6+ causes of action when facts support them. DO NOT LIMIT TO 1-2 CAUSES.

FACTS: ${sanitizedSummary}${causesInstruction}

MANDATORY MULTI-CAUSE ANALYSIS - Check ALL these CACI options:
• NEGLIGENCE (CACI 400) • NEGLIGENCE PER SE (CACI 418) • GROSS NEGLIGENCE (CACI 425)
• PREMISES LIABILITY (CACI 1000) • MOTOR VEHICLE (CACI 700) • PRODUCTS LIABILITY (CACI 1200)
• MEDICAL MALPRACTICE (CACI 500) • BATTERY (CACI 1300) • IIED (CACI 1600)
• BREACH CONTRACT (CACI 300) • FRAUD (CACI 1900) • NEGLIGENT MISREP (CACI 1903)
• UNFAIR BUSINESS PRACTICES (B&P 17200) • DRAM SHOP LIABILITY • CONVERSION (CACI 2100)
• TRESPASS (CACI 2000) • DEFAMATION (CACI 1700) • INVASION PRIVACY (CACI 1800)
• PUNITIVE DAMAGES (CACI 3940-3949) - for malicious, oppressive, or fraudulent conduct

ATTORNEY HEADER TO USE:
${attorneyHeader}

COURT AND COUNTY INFORMATION:
Filing County: ${county || '[COUNTY NAME]'}
Court: Superior Court of California, County of ${county ? county.toUpperCase() : '[COUNTY NAME]'}

PLAINTIFF INFORMATION:
${plaintiffs && plaintiffs.length > 0 
  ? plaintiffs.map((p: any) => p.name?.trim()).filter(Boolean).join(', ') || '[PLAINTIFF NAME]'
  : '[PLAINTIFF NAME]'}

DEFENDANT INFORMATION:
${defendants && defendants.length > 0 
  ? defendants.map((d: any) => d.name?.trim()).filter(Boolean).join(', ') || '[DEFENDANT NAME]'
  : '[DEFENDANT NAME]'}

CASE NUMBER:
${caseNumber?.trim() || '[CASE NUMBER]'}

CRITICAL INSTRUCTION - START THE COMPLAINT WITH THIS EXACT ATTORNEY HEADER:
${attorneyHeader}

STRUCTURE - COMPLETE FULL COMPLAINT (START WITH ATTORNEY HEADER ABOVE):
1. BEGIN WITH: Use the exact attorney header shown above - DO NOT use any other attorney information like "RANDY LENO" or placeholder text
2. Court header and case caption (SUPERIOR COURT OF CALIFORNIA, COUNTY OF ${county ? county.toUpperCase() : '[COUNTY NAME]'})
3. CRITICAL - Use these EXACT party names in the case caption:
   PLAINTIFFS: ${plaintiffs && plaintiffs.length > 0 ? plaintiffs.map((p: any) => p.name?.trim()).filter(Boolean).join(', ') : '[PLAINTIFF NAME]'}
   DEFENDANTS: ${defendants && defendants.length > 0 ? defendants.map((d: any) => d.name?.trim()).filter(Boolean).join(', ') : '[DEFENDANT NAME]'}
   
   Format the case caption exactly like this:
   ${plaintiffs && plaintiffs.length > 0 ? plaintiffs.map((p: any) => p.name?.trim()).filter(Boolean).join(',\n') : '[PLAINTIFF NAME]'},
   
                        Plaintiff${plaintiffs && plaintiffs.length > 1 ? 's' : ''},
   
   vs.
   
   ${defendants && defendants.length > 0 ? defendants.map((d: any) => d.name?.trim()).filter(Boolean).join(',\n') : '[DEFENDANT NAME]'},
   
                        Defendant${defendants && defendants.length > 1 ? 's' : ''}.

4. Case number: ${caseNumber?.trim() || '[CASE NUMBER]'}
5. COMPLAINT title
6. Jurisdictional allegations (paragraphs 1-3)
7. General factual allegations (paragraphs 4-10)
8. FIRST CAUSE OF ACTION (Name - CACI XXX)
9. SECOND CAUSE OF ACTION (Name - CACI XXX)
10. THIRD CAUSE OF ACTION (Name - CACI XXX)
11. FOURTH CAUSE OF ACTION (Name - CACI XXX) [if applicable]
12. FIFTH CAUSE OF ACTION (Name - CACI XXX) [if applicable]
13. SIXTH CAUSE OF ACTION (Name - CACI XXX) [if applicable]
14. Prayer for Relief (comprehensive)
15. Jury Demand

CRITICAL REQUIREMENTS:
- START WITH ATTORNEY HEADER - NO "RANDY LENO" OR OTHER PLACEHOLDER ATTORNEY NAMES
- MUST include 3+ causes when facts reasonably support them
- Use overlapping theories (negligence + negligence per se + specific liability)
- Each cause should have 4-6 paragraphs with proper CACI elements
- Include specific CACI instruction numbers
- Generate COMPLETE complaint - do not truncate or abbreviate
- Use aggressive but legally sound pleading strategy
- Include incorporation by reference for each cause
- Include PUNITIVE DAMAGES cause when conduct is malicious, oppressive, or fraudulent (drunk driving, intentional acts, cover-ups, etc.)
- Consider punitive damages for: DUI cases, medical malpractice with cover-up, intentional torts, fraud, gross negligence

LENGTH: Generate full, complete complaint with all causes of action. Do not limit length.`

    // Try different models with higher capabilities for comprehensive complaints
    const models = ["gpt-4o-mini", "gpt-4", "gpt-3.5-turbo", "gpt-3.5-turbo-0125"]
    
    const createPayload = (model: string) => ({
      model,
      messages: [
        { 
          role: "system", 
          content: "You are an experienced California plaintiffs' attorney who drafts comprehensive complaints following California Civil Jury Instructions (CACI) standards. You are known for thorough legal analysis and including ALL viable causes of action to maximize client recovery. CRITICAL INSTRUCTIONS: (1) ALWAYS start with the exact attorney header information provided - NEVER use placeholder names like 'RANDY LENO' or any hardcoded attorney information, (2) Use the EXACT plaintiff and defendant names provided in the prompt - DO NOT use generic names like 'Any Plaintiff' or 'Any Defendant', (3) Analyze facts against the entire CACI library - do not be conservative, (4) Include 3-6+ causes of action when facts support them, (5) Consider overlapping theories (negligence + negligence per se + premises liability, etc.), (6) Use specific CACI instruction numbers, (7) Structure each cause with proper CACI elements, (8) Use aggressive but legally sound pleading strategies. Remember: It's better to include a potentially viable cause than to miss a recovery theory. MOST IMPORTANT: Use only the attorney information AND party names provided in the prompt - no hardcoded names or placeholder text." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3 // Lower temperature for more consistent legal language
      // No max_tokens limit - use full model capacity for comprehensive complaints
    })

    // Retry logic with different models to work around rate limits
    const maxRetries = 3
    let lastError = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Use different model for each attempt to spread rate limits
      const modelIndex = (attempt - 1) % models.length
      const currentModel = models[modelIndex]
      const payload = createPayload(currentModel)
      
      console.log(`Attempt ${attempt}/${maxRetries} using model: ${currentModel}`)
      
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          // Success! Process the response
          const data = await response.json()
          
          if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            return NextResponse.json(
              { error: 'Invalid response from OpenAI' },
              { status: 500 }
            )
          }

          const complaint = data.choices[0].message.content.trim()
          
          // Cache the response
          responseCache.set(cacheKey, {
            complaint,
            timestamp: Date.now()
          })
          
          // Clean old cache entries (simple cleanup)
          if (responseCache.size > 100) {
            const entries = Array.from(responseCache.entries())
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
            // Remove oldest 20 entries
            for (let i = 0; i < 20; i++) {
              responseCache.delete(entries[i][0])
            }
          }
          
          return NextResponse.json({ complaint })
        }

        // Handle errors
      const errorData = await response.json().catch(() => ({}))
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OpenAI API key.' },
          { status: 401 }
        )
      }

      // Handle quota exceeded error specifically
      if (response.status === 429) {
        const errorMessage = errorData.error?.message || ''
        const errorCode = errorData.error?.code || ''
        
        console.log(`Rate limit/quota error on attempt ${attempt}/${maxRetries}`)
        console.log('Error message:', errorMessage)
        console.log('Error code:', errorCode)
        console.log('Full error response:', errorData)
        
        // Check if this is a quota exceeded error (not just rate limiting)
        const isQuotaExceeded = errorMessage.toLowerCase().includes('quota') || 
                               errorMessage.toLowerCase().includes('billing') ||
                               errorCode === 'insufficient_quota'
        
        if (isQuotaExceeded) {
          // Don't retry for quota errors - they won't resolve with waiting
          return NextResponse.json(
            { 
              error: 'OpenAI API quota exceeded. Please check your billing and usage limits at https://platform.openai.com/usage',
              type: 'quota_exceeded',
              userMessage: 'Your OpenAI API usage has exceeded the current billing limits. To continue using this service, please:\n\n1. Check your usage at https://platform.openai.com/usage\n2. Add payment method or increase limits at https://platform.openai.com/account/billing\n3. Wait for your quota to reset (if on free tier)\n\nAlternatively, you can manually draft your complaint using the legal template format shown in previous examples.',
              details: {
                message: errorMessage,
                code: errorCode,
                docsUrl: 'https://platform.openai.com/docs/guides/error-codes/api-errors'
              }
            },
            { status: 429 }
          )
        }
        
        // Handle regular rate limiting (temporary)
        if (attempt === maxRetries) {
          const rateLimitMessage = 'Rate limit exceeded. This happens when too many requests are made to OpenAI. Please wait 60 seconds before trying again. Consider upgrading your OpenAI API plan for higher limits.'
          
          return NextResponse.json(
            { 
              error: rateLimitMessage,
              retryAfter: 60,
              type: 'rate_limit_exceeded',
              details: errorData.error
            },
            { status: 429 }
          )
        }

          // Wait before retrying (exponential backoff with longer delays)
          const waitTime = Math.min(5000 * Math.pow(2, attempt - 1), 30000) // Start at 5s, cap at 30s
          console.log(`Waiting ${waitTime}ms before retry ${attempt + 1}`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }

        // For other errors, don't retry
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to generate complaint' },
        { status: response.status }
      )
        
      } catch (error) {
        lastError = error
        console.error(`Attempt ${attempt} failed:`, error)
        
        if (attempt === maxRetries) {
          break
        }
        
        // Wait before retrying with longer delays
        const waitTime = Math.min(5000 * Math.pow(2, attempt - 1), 30000)
        console.log(`Network error, waiting ${waitTime}ms before retry`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }

    // If we get here, all retries failed
    console.error('All retry attempts failed:', lastError)
      return NextResponse.json(
      { error: 'Failed to generate complaint after multiple attempts. Please try again later.' },
        { status: 500 }
      )

  } catch (error) {
    console.error('Error generating complaint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    isProcessing = false
    // Process next request in queue
    setTimeout(processQueue, 100) // Small delay to prevent tight loops
  }
}

// Security headers
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
