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
You are a legal assistant. Given a factual case summary, draft a full California Superior Court complaint with:

- Caption (include placeholder court information and case number)
- Jurisdiction and Venue
- Parties (Plaintiff and Defendant sections)
- General Allegations
- Causes of Action (determine appropriate causes based on facts - may include Negligence, Property Damage, Personal Injury, Breach of Contract, etc.)
- Prayer for Relief (including damages, costs, attorney fees, and other appropriate relief)
- Jury Demand

Facts: """${sanitizedSummary}"""

Use proper legal formatting and language. Include specific factual allegations from the summary. 
Format the document professionally with clear headings and numbered paragraphs.
Ensure all causes of action are supported by the facts provided.
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
