import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = createAdminClient();
    const notificationId = params.id;
    
    // Validate notification ID
    if (!notificationId || notificationId === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      );
    }

    // Mark notification as sent
    const { data, error } = await adminSupabase
      .from('user_video_notifications')
      .update({
        is_sent: true,
        sent_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .select('id, user_id, is_sent, sent_at')
      .single();

    if (error) {
      console.error('Error marking notification as sent:', error);
      return NextResponse.json(
        { error: 'Failed to mark notification as sent' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Notification marked as sent',
      notification: data
    });

  } catch (error) {
    console.error('Error in mark sent API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}