import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { workflow } = await request.json()
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    switch (workflow) {
      case 'video-processing':
        return await triggerVideoProcessing(baseUrl)
      
      case 'channel-monitoring':
        return await triggerChannelMonitoring(baseUrl)
      
      case 'all':
        const videoResult = await triggerVideoProcessing(baseUrl)
        const channelResult = await triggerChannelMonitoring(baseUrl)
        
        return NextResponse.json({
          message: 'All workflows triggered',
          video_processing: videoResult,
          channel_monitoring: channelResult
        })
      
      default:
        return NextResponse.json({ error: 'Invalid workflow type' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Error triggering N8N workflow:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function triggerVideoProcessing(baseUrl: string) {
  const steps = []
  
  try {
    // Step 1: Process new videos
    console.log('🔄 Starting video processing...')
    const videoResponse = await fetch(`${baseUrl}/api/youtube/process-new-videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const videoResult = await videoResponse.json()
    steps.push({
      step: 'process-new-videos',
      success: videoResponse.ok,
      result: videoResult
    })
    
    // Step 2: Get pending notifications
    console.log('🔄 Getting pending notifications...')
    const pendingResponse = await fetch(`${baseUrl}/api/notifications/pending`)
    const pendingResult = await pendingResponse.json()
    
    steps.push({
      step: 'get-pending-notifications',
      success: pendingResponse.ok,
      result: pendingResult
    })
    
    // Step 3: Send WhatsApp notifications (if any pending)
    if (pendingResult.notifications && pendingResult.notifications.length > 0) {
      console.log('🔄 Sending WhatsApp notifications...')
      const whatsappResponse = await fetch(`${baseUrl}/api/whatsapp/send-pending`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.N8N_API_KEY || 'test-key'}`
        }
      })
      
      const whatsappResult = await whatsappResponse.json()
      steps.push({
        step: 'send-whatsapp-notifications',
        success: whatsappResponse.ok,
        result: whatsappResult
      })
    } else {
      steps.push({
        step: 'send-whatsapp-notifications',
        success: true,
        result: { message: 'No pending notifications to send' }
      })
    }
    
    return {
      workflow: 'video-processing',
      success: true,
      steps,
      summary: {
        videos_processed: videoResult.videos_processed || 0,
        notifications_sent: steps.find(s => s.step === 'send-whatsapp-notifications')?.result?.notifications_sent || 0
      }
    }
    
  } catch (error) {
    console.error('Error in video processing workflow:', error)
    return {
      workflow: 'video-processing',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      steps
    }
  }
}

async function triggerChannelMonitoring(baseUrl: string) {
  const steps = []
  
  try {
    // Step 1: Get channels to monitor
    console.log('🔄 Getting channels to monitor...')
    const channelsResponse = await fetch(`${baseUrl}/api/youtube/channel-info`)
    const channelsResult = await channelsResponse.json()
    
    steps.push({
      step: 'get-channels-to-monitor',
      success: channelsResponse.ok,
      result: channelsResult
    })
    
    // Step 2: Check each channel for new videos
    if (channelsResult.channels && channelsResult.channels.length > 0) {
      console.log(`🔄 Checking ${channelsResult.channels.length} channels for new videos...`)
      
      for (const channel of channelsResult.channels.slice(0, 5)) { // Limit to 5 channels
        const videosResponse = await fetch(`${baseUrl}/api/youtube/videos?channelId=${channel.youtube_channel_id}&maxResults=5`)
        const videosResult = await videosResponse.json()
        
        steps.push({
          step: 'check-channel-videos',
          channel: channel.channel_name,
          success: videosResponse.ok,
          result: videosResult
        })
      }
    }
    
    return {
      workflow: 'channel-monitoring',
      success: true,
      steps,
      summary: {
        channels_checked: channelsResult.channels?.length || 0,
        total_videos_found: steps
          .filter(s => s.step === 'check-channel-videos')
          .reduce((total, step) => total + (step.result?.videos?.length || 0), 0)
      }
    }
    
  } catch (error) {
    console.error('Error in channel monitoring workflow:', error)
    return {
      workflow: 'channel-monitoring',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      steps
    }
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'N8N Workflow Trigger API',
    usage: {
      endpoint: '/api/n8n/trigger',
      method: 'POST',
      body: {
        workflow: 'video-processing | channel-monitoring | all'
      }
    },
    available_workflows: [
      'video-processing',
      'channel-monitoring',
      'all'
    ]
  })
}