import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { summary } = body

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

    const prompt = `
You are a legal assistant. Generate a California Superior Court complaint using the EXACT format below with line numbering 1-25 on the left margin.

REQUIRED FORMAT:
- Lines 1-7: Attorney information block (use placeholder attorney info)
- Line 8: "SUPERIOR COURT OF THE STATE OF CALIFORNIA" (centered)
- Line 9: "COUNTY OF [COUNTY], [DISTRICT] DISTRICT" (centered)
- Lines 11-16: Case caption with parties, case number, and document title
- Lines 17+: Body of complaint with numbered allegations

Facts to incorporate: """${sanitizedSummary}"""

Generate the complaint using this EXACT format structure:

Line 1: [Attorney Name], State Bar No. [Number]
Line 2: [Email]
Line 3: [Second Attorney Name], State Bar No. [Number]  
Line 4: [Email]
Line 5: [Law Firm Name]
Line 6: Attorneys at Law
Line 7: [Address, Phone, Fax]
Line 8: 
Line 9:                    SUPERIOR COURT OF THE STATE OF CALIFORNIA
Line 10:
Line 11:                  COUNTY OF [COUNTY], [DISTRICT] DISTRICT
Line 12:
Line 13: [PLAINTIFF NAME], an individual,          | Case No. [CASE_NUMBER]
Line 14:                                           |
Line 15:                    Plaintiff,             | COMPLAINT FOR:
Line 16:                                           | [CAUSES OF ACTION]
Line 17:              v.                           | 
Line 18:                                           | DEMAND FOR JURY TRIAL
Line 19: [DEFENDANT NAME], an individual; and      |
Line 20: DOES 1 to 25, Inclusive                   |
Line 21:                                           |
Line 22:                    Defendants.            |
Line 23: __________________________________________|

Continue with numbered allegations starting around line 24, incorporating the provided facts into proper legal allegations with causes of action for negligence, damages, etc.

Use standard California pleading language and ensure all factual allegations from the summary are properly incorporated.
`

    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are an experienced legal assistant who drafts professional complaints under California law. Always use proper legal formatting, clear language, and ensure all allegations are factually supported." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent legal language
      max_tokens: 3000
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OpenAI API key.' },
          { status: 401 }
        )
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to generate complaint' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json(
        { error: 'Invalid response from OpenAI' },
        { status: 500 }
      )
    }

    const complaint = data.choices[0].message.content.trim()

    return NextResponse.json({ complaint })

  } catch (error) {
    console.error('Error generating complaint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
