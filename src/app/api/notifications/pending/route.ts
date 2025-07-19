import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient();
    
    // Get limit from query params (default: 50)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Get pending notifications with video and user details
    const { data: notifications, error } = await adminSupabase
      .from('user_video_notifications')
      .select(`
        id,
        user_id,
        is_sent,
        created_at,
        users!inner(
          id,
          phone_number,
          name,
          subscription_status
        ),
        global_processed_videos!inner(
          id,
          video_id,
          video_title,
          video_url,
          summary,
          video_duration,
          published_at,
          global_youtube_channels!inner(
            channel_name,
            youtube_channel_id
          )
        )
      `)
      .eq('is_sent', false)
      .eq('users.subscription_status', 'active') // Only active subscribers
      .not('global_processed_videos.summary', 'is', null) // Only videos with summaries
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching pending notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    // Format for N8N
    const formattedNotifications = notifications.map(notification => ({
      notification_id: notification.id,
      user_id: notification.user_id,
      phone_number: notification.users.phone_number,
      user_name: notification.users.name,
      video_id: notification.global_processed_videos.video_id,
      video_title: notification.global_processed_videos.video_title,
      video_url: notification.global_processed_videos.video_url,
      summary: notification.global_processed_videos.summary,
      video_duration: notification.global_processed_videos.video_duration,
      channel_name: notification.global_processed_videos.global_youtube_channels.channel_name,
      published_at: notification.global_processed_videos.published_at,
      created_at: notification.created_at
    }));

    return NextResponse.json({
      total: formattedNotifications.length,
      notifications: formattedNotifications
    });

  } catch (error) {
    console.error('Error in pending notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}