import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get channels using regular client
    const { data: userChannels, error: userChannelsError } = await supabase
      .from('youtube_channels')
      .select('*')
      .eq('user_id', user.id)

    // Get channels using admin client
    const { data: adminChannels, error: adminChannelsError } = await adminSupabase
      .from('youtube_channels')
      .select('*')
      .eq('user_id', user.id)

    // Get all channels with this user_id using admin
    const { data: allChannels, error: allChannelsError } = await adminSupabase
      .from('youtube_channels')
      .select('*')

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      userChannels: {
        data: userChannels,
        error: userChannelsError
      },
      adminChannels: {
        data: adminChannels,
        error: adminChannelsError
      },
      allChannels: {
        data: allChannels,
        error: allChannelsError
      }
    })
  } catch (error) {
    console.error('Error in debug channels:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}