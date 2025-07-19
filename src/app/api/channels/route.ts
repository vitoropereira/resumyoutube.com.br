import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getChannelInfo, extractChannelIdFromUrl } from "@/lib/youtube";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL do canal é obrigatória" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Check if user can add more channels using global function
    const { data: canAdd, error: canAddError } = await supabase.rpc(
      "can_add_global_channel",
      { user_uuid: user.id }
    );

    if (canAddError || !canAdd) {
      return NextResponse.json(
        { error: "Limite de canais atingido" },
        { status: 400 }
      );
    }

    // Extract channel ID from URL
    const channelId = extractChannelIdFromUrl(url);
    if (!channelId) {
      return NextResponse.json(
        { error: "URL do canal inválida" },
        { status: 400 }
      );
    }

    // Check if user is already subscribed to this global channel
    // First get the global channel ID by YouTube channel ID
    const { data: globalChannel } = await supabase
      .from("global_youtube_channels")
      .select("id")
      .eq("youtube_channel_id", channelId)
      .single();

    if (globalChannel) {
      const { data: existingSubscription } = await supabase
        .from("user_channel_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("global_channel_id", globalChannel.id)
        .eq("is_active", true)
        .single();

      if (existingSubscription) {
        return NextResponse.json(
          { error: "Você já está inscrito neste canal" },
          { status: 400 }
        );
      }
    }

    // Fetch channel info from YouTube API
    const channelInfo = await getChannelInfo(url);

    if (!channelInfo) {
      return NextResponse.json(
        { error: "Canal não encontrado no YouTube" },
        { status: 404 }
      );
    }

    // Use admin client to bypass RLS policies
    const adminClient = createAdminClient();

    // First, check if global channel already exists
    const { data: existingGlobalChannel } = await adminClient
      .from("global_youtube_channels")
      .select("id")
      .eq("youtube_channel_id", channelInfo.id)
      .single();

    let globalChannelId: string;

    if (existingGlobalChannel) {
      // Channel already exists globally, just use its ID
      globalChannelId = existingGlobalChannel.id;
    } else {
      // Create new global channel
      const globalChannelData = {
        youtube_channel_id: channelInfo.id,
        channel_name: channelInfo.title,
        channel_url: url,
        channel_description: channelInfo.description,
        subscriber_count: parseInt(channelInfo.statistics.subscriberCount),
        video_count: parseInt(channelInfo.statistics.videoCount),
        is_active: true,
      };

      const { data: newGlobalChannel, error: globalInsertError } =
        await adminClient
          .from("global_youtube_channels")
          .insert(globalChannelData)
          .select("id")
          .single();

      if (globalInsertError) {
        console.error("Error inserting global channel:", globalInsertError);
        return NextResponse.json(
          { error: `Erro ao adicionar canal: ${globalInsertError.message}` },
          { status: 500 }
        );
      }

      globalChannelId = newGlobalChannel.id;
    }

    // Create user subscription to global channel
    const subscriptionData = {
      user_id: user.id,
      global_channel_id: globalChannelId,
      is_active: true,
    };

    const { data: newSubscription, error: insertError } = await adminClient
      .from("user_channel_subscriptions")
      .insert(subscriptionData)
      .select(
        `
        id,
        subscribed_at,
        is_active,
        global_youtube_channels(
          id,
          youtube_channel_id,
          channel_name,
          channel_url,
          channel_description,
          subscriber_count,
          video_count
        )
      `
      )
      .single();

    if (insertError) {
      console.error("Error inserting channel:", {
        error: insertError,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
      });
      return NextResponse.json(
        { error: `Erro ao adicionar canal: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Canal adicionado com sucesso",
      subscription: newSubscription,
    });
  } catch (error) {
    console.error("Channel creation error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Get user's global channel subscriptions using admin client
    const { data: subscriptions, error: subscriptionsError } =
      await adminSupabase
        .from("user_channel_subscriptions")
        .select(
          `
        id,
        subscribed_at,
        is_active,
        global_youtube_channels(
          id,
          youtube_channel_id,
          channel_name,
          channel_url,
          channel_description,
          subscriber_count,
          video_count,
          last_check_at
        )
      `
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("subscribed_at", { ascending: false });

    if (subscriptionsError) {
      return NextResponse.json(
        { error: "Erro ao buscar canais" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscriptions: subscriptions || [],
    });
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId");

    if (!channelId) {
      return NextResponse.json(
        { error: "ID do canal é obrigatório" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Delete user subscription (set as inactive) using admin client
    const { error: deleteError } = await adminSupabase
      .from("user_channel_subscriptions")
      .update({ is_active: false })
      .eq("id", channelId)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Erro ao remover canal" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Canal removido com sucesso",
    });
  } catch (error) {
    console.error("Error deleting channel:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
