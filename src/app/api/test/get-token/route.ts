import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return NextResponse.json({ 
        error: 'Failed to get session',
        details: error.message
      }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ 
        error: 'No active session',
        message: 'Please login through the dashboard first'
      }, { status: 401 })
    }

    return NextResponse.json({
      access_token: session.access_token,
      expires_at: session.expires_at,
      user: {
        id: session.user.id,
        email: session.user.email
      },
      instructions: "Copy the access_token and use it in your REST client as: Authorization: Bearer <access_token>"
    })
  } catch (error) {
    console.error('Error getting token:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}