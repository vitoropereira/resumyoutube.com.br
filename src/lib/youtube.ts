export interface YouTubeChannelInfo {
  id: string
  title: string
  description: string
  thumbnails: {
    default: { url: string }
    medium: { url: string }
    high: { url: string }
  }
  statistics: {
    subscriberCount: string
    videoCount: string
    viewCount: string
  }
}

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  publishedAt: string
  channelId: string
  channelTitle: string
  thumbnails: {
    default: { url: string }
    medium: { url: string }
    high: { url: string }
  }
  duration: string
  viewCount: string
  likeCount: string
  commentCount: string
}

export function extractChannelIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    
    // Handle different YouTube URL formats
    // Channel ID format: https://www.youtube.com/channel/UCxxx
    if (urlObj.pathname.includes('/channel/')) {
      const match = urlObj.pathname.match(/\/channel\/([a-zA-Z0-9_-]+)/)
      return match ? match[1] : null
    }
    
    // Username format: https://www.youtube.com/c/username or https://www.youtube.com/@username
    if (urlObj.pathname.includes('/c/') || urlObj.pathname.includes('/@')) {
      // For these formats, we'll need to use the YouTube API to resolve to channel ID
      // Return the username for now and resolve it in the API call
      const match = urlObj.pathname.match(/\/(?:c\/|@)([a-zA-Z0-9_-]+)/)
      return match ? match[1] : null
    }
    
    // Handle youtube.com/user/username format
    if (urlObj.pathname.includes('/user/')) {
      const match = urlObj.pathname.match(/\/user\/([a-zA-Z0-9_-]+)/)
      return match ? match[1] : null
    }
    
    return null
  } catch {
    return null
  }
}

export async function getChannelInfo(channelInput: string): Promise<YouTubeChannelInfo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY
  
  if (!apiKey) {
    throw new Error('YouTube API key not configured')
  }

  try {
    let channelId = channelInput
    
    // If input looks like a URL, extract the channel ID/username
    if (channelInput.includes('youtube.com') || channelInput.includes('youtu.be')) {
      const extracted = extractChannelIdFromUrl(channelInput)
      if (!extracted) {
        throw new Error('Could not extract channel identifier from URL')
      }
      channelId = extracted
    }

    // Try to get channel by ID first
    let response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
    )
    
    let data = await response.json()
    
    // If no results and it might be a username, try by username
    if (!data.items || data.items.length === 0) {
      response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forUsername=${channelId}&key=${apiKey}`
      )
      data = await response.json()
    }
    
    // If still no results, try search
    if (!data.items || data.items.length === 0) {
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelId)}&key=${apiKey}&maxResults=1`
      )
      const searchData = await searchResponse.json()
      
      if (searchData.items && searchData.items.length > 0) {
        const searchChannelId = searchData.items[0].snippet.channelId
        response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${searchChannelId}&key=${apiKey}`
        )
        data = await response.json()
      }
    }

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    if (!data.items || data.items.length === 0) {
      return null
    }

    const channel = data.items[0]
    
    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnails: channel.snippet.thumbnails,
      statistics: {
        subscriberCount: channel.statistics.subscriberCount || '0',
        videoCount: channel.statistics.videoCount || '0',
        viewCount: channel.statistics.viewCount || '0'
      }
    }
  } catch (error) {
    console.error('Error fetching channel info:', error)
    throw error
  }
}

export function isValidYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return (
      (urlObj.hostname === 'youtube.com' || 
       urlObj.hostname === 'www.youtube.com' ||
       urlObj.hostname === 'youtu.be') &&
      (urlObj.pathname.includes('/channel/') ||
       urlObj.pathname.includes('/c/') ||
       urlObj.pathname.includes('/@') ||
       urlObj.pathname.includes('/user/'))
    )
  } catch {
    return false
  }
}

export async function getChannelVideos(
  channelId: string, 
  maxResults: number = 10,
  publishedAfter?: string
): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  
  if (!apiKey) {
    throw new Error('YouTube API key not configured')
  }

  try {
    // First, get video IDs from channel
    let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}&key=${apiKey}`
    
    if (publishedAfter) {
      searchUrl += `&publishedAfter=${publishedAfter}`
    }

    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.status} - ${searchData.error?.message}`)
    }

    if (!searchData.items || searchData.items.length === 0) {
      return []
    }

    // Extract video IDs
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',')

    // Get detailed video information
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`
    )
    const videosData = await videosResponse.json()

    if (!videosResponse.ok) {
      throw new Error(`YouTube API error: ${videosResponse.status} - ${videosData.error?.message}`)
    }

    return videosData.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt,
      channelId: video.snippet.channelId,
      channelTitle: video.snippet.channelTitle,
      thumbnails: video.snippet.thumbnails,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount || '0',
      likeCount: video.statistics.likeCount || '0',
      commentCount: video.statistics.commentCount || '0'
    }))
  } catch (error) {
    console.error('Error fetching channel videos:', error)
    throw error
  }
}

export async function getLatestVideosFromChannels(
  channelIds: string[], 
  publishedAfter?: string
): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  
  if (!apiKey) {
    throw new Error('YouTube API key not configured')
  }

  try {
    const allVideos: YouTubeVideo[] = []

    // Process channels in batches to avoid rate limits
    for (const channelId of channelIds) {
      const videos = await getChannelVideos(channelId, 5, publishedAfter)
      allVideos.push(...videos)
    }

    // Sort by publish date (newest first)
    return allVideos.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  } catch (error) {
    console.error('Error fetching latest videos:', error)
    throw error
  }
}

export function parseDuration(duration: string): number {
  // Parse YouTube duration format (PT15M33S) to seconds
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  return hours * 3600 + minutes * 60 + seconds
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}