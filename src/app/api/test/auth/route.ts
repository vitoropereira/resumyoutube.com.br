import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Debug: Check cookies
    const cookies = request.cookies.getAll()
    console.log('Cookies received:', cookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`))
    
    // Check for auth token cookies specifically
    const authCookies = cookies.filter(c => c.name.includes('auth-token'))
    console.log('Auth cookies found:', authCookies.length)
    
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('Session error:', error)
    console.log('Session exists:', !!session)
    console.log('User ID:', session?.user?.id)
    
    if (error) {
      return NextResponse.json({ 
        error: 'Failed to get session',
        details: error.message,
        cookies: cookies.length,
        authCookies: authCookies.length
      }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ 
        error: 'No active session',
        cookies: cookies.length,
        cookieNames: cookies.map(c => c.name),
        authCookies: authCookies.length,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        phone: session.user.phone
      },
      session: {
        expires_at: session.expires_at,
        access_token: session.access_token.substring(0, 20) + '...'
      }
    })
  } catch (error) {
    console.error('Error in auth test:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}