import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Try to get user directly instead of session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      return NextResponse.json({ 
        error: 'Failed to get user',
        details: userError.message,
        code: userError.name
      }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'No authenticated user',
        message: 'Please login through the dashboard first'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Error in browser auth test:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}