# 📚 Resume YouTube API Documentation v2.0

## 🚀 What's New in v2.0

### ✨ **Global Architecture Implementation**
- **90% cost reduction** in OpenAI API calls through global video processing
- **Unlimited channels** per user with summary-based pricing
- **Advanced business model** with 4-tier subscription plans
- **Enhanced user profiling** with business type and content interests

### 🔄 **Migration from Legacy Structure**
- Legacy `youtube_channels` table still supported for compatibility
- New global structure with `global_youtube_channels` and `user_channel_subscriptions`
- Automatic data migration completed
- Enhanced tracking and analytics

---

## 📊 Database Schema Overview

### **Core Tables**

#### `users` (Enhanced)
```typescript
interface User {
  id: string
  name: string | null
  email: string | null
  phone_number: string | null
  
  // New Business Model Fields
  monthly_summary_limit: number      // Default: 50
  monthly_summary_used: number       // Default: 0  
  summary_reset_date: string         // Monthly reset date
  extra_summaries: number            // Default: 0
  whatsapp_validated: boolean        // Default: false
  trial_end_date: string | null      // 7-day trial end
  
  // User Profiling
  business_type: 'creator' | 'business' | 'personal' | 'agency' | null
  content_interest: 'tech' | 'business' | 'entertainment' | 'education' | 'lifestyle' | 'news' | 'other' | null
  summary_frequency: 'daily' | 'weekly' | 'monthly' | 'realtime' | null
  
  // Legacy Fields (maintained for compatibility)
  max_channels: number               // Default: 3
  subscription_status: string        // Default: 'inactive'
  
  created_at: string
  updated_at: string
}
```

#### `global_youtube_channels` (New)
```typescript
interface GlobalYouTubeChannel {
  id: string
  youtube_channel_id: string         // Unique YouTube channel ID
  channel_name: string
  channel_url: string
  channel_description: string | null
  subscriber_count: number | null
  video_count: number | null
  last_video_id: string | null
  last_check_at: string | null
  is_active: boolean                 // Default: true
  created_at: string
  updated_at: string
}
```

#### `user_channel_subscriptions` (New)
```typescript
interface UserChannelSubscription {
  id: string
  user_id: string                    // References users.id
  global_channel_id: string          // References global_youtube_channels.id
  subscribed_at: string              // When user subscribed
  is_active: boolean                 // Default: true
}
```

#### `global_processed_videos` (New)
```typescript
interface GlobalProcessedVideo {
  id: string
  global_channel_id: string          // References global_youtube_channels.id
  video_id: string                   // Unique YouTube video ID
  video_title: string
  video_url: string
  video_description: string | null
  transcript: string | null          // Full video transcript
  summary: string | null             // AI-generated summary
  video_duration: string | null
  published_at: string | null
  processed_at: string               // When AI processing completed
  created_at: string
}
```

#### `user_video_notifications` (New)
```typescript
interface UserVideoNotification {
  id: string
  user_id: string                    // References users.id
  global_video_id: string            // References global_processed_videos.id
  sent_at: string | null             // When WhatsApp notification was sent
  is_sent: boolean                   // Default: false
  created_at: string
}
```

---

## 🔧 Database Functions

### **Summary Management Functions**

#### `can_generate_summary(user_id: UUID) → boolean`
Checks if user can generate more summaries based on their monthly limit and extra credits.

```sql
SELECT can_generate_summary('user-uuid-here');
-- Returns: true/false
```

#### `increment_summary_usage(user_id: UUID) → boolean`
Increments user's monthly summary usage, preferring monthly limit over extra credits.

```sql
SELECT increment_summary_usage('user-uuid-here');
-- Returns: true if successful, false if limit reached
```

#### `reset_monthly_usage() → integer`
Resets monthly usage counters for users whose reset date has passed. Called by cron job.

```sql
SELECT reset_monthly_usage();
-- Returns: number of users reset
```

### **Global Channel Functions**

#### `can_add_global_channel(user_id: UUID) → boolean`
Checks if user can add more channels using global structure.

```sql
SELECT can_add_global_channel('user-uuid-here');
-- Returns: true/false
```

#### `add_global_channel(...) → UUID`
Adds a channel to global structure and creates user subscription.

```sql
SELECT add_global_channel(
  'user-uuid-here',
  'UCChannelIdHere',
  'Channel Name',
  'https://youtube.com/channel/UCChannelIdHere',
  'Channel description',
  1000,  -- subscriber_count
  50     -- video_count
);
-- Returns: global_channel_id
```

#### `get_user_global_channels(user_id: UUID) → TABLE`
Gets all channels subscribed by user in global structure.

```sql
SELECT * FROM get_user_global_channels('user-uuid-here');
-- Returns: subscription details with channel info
```

#### `get_global_channels_to_check(limit: INTEGER) → TABLE`
Gets global channels that need checking for new videos.

```sql
SELECT * FROM get_global_channels_to_check(10);
-- Returns: channels needing video checks
```

### **Video Processing Functions**

#### `process_global_video(...) → UUID`
Processes a new video globally and creates notifications for eligible subscribers.

```sql
SELECT process_global_video(
  'global-channel-uuid',
  'video-id-here',
  'Video Title',
  'https://youtube.com/watch?v=video-id',
  'Video description',
  '00:10:30',
  NOW(),
  'Full video transcript...',
  'AI-generated summary...'
);
-- Returns: processed_video_id
```

### **User Status Function (Enhanced)**

#### `get_user_status(phone: VARCHAR) → JSON`
Enhanced function returning complete user info including global structure data.

```sql
SELECT get_user_status('+5514999999999');
```

**Enhanced Response:**
```json
{
  "exists": true,
  "user_id": "uuid",
  "name": "User Name",
  "phone_number": "+5514999999999",
  "subscription_status": "active",
  "subscription_end": "2025-08-16T00:00:00Z",
  "max_channels": 3,
  "legacy_channels": 1,
  "global_channels": 3,
  "total_channels": 4,
  "can_add_channel": false,
  "can_generate_summary": true,
  "monthly_summary_limit": 150,
  "monthly_summary_used": 25,
  "extra_summaries": 10,
  "whatsapp_validated": true,
  "stripe_customer_id": "cus_stripe_id"
}
```

---

## 📈 Subscription Plans

### **4-Tier Pricing Model**

| Plan | Price | Monthly Summaries | Features |
|------|-------|------------------|----------|
| **Starter** | R$ 29,90 | 50 | Canais ilimitados, WhatsApp, Suporte básico |
| **Pro** | R$ 49,90 | 150 | + Suporte prioritário, Analytics avançado |
| **Premium** | R$ 99,90 | 500 | + Suporte 24/7, API privada |
| **Enterprise** | R$ 199,90 | Ilimitado | + Suporte dedicado, White label |

### **Trial System**
- **7-day free trial** with mandatory credit card
- Full access to all features during trial
- Automatic conversion to paid plan after trial
- Trial status tracked in `trial_end_date` field

### **Extra Summary Packs**
- Users can purchase additional summary credits
- Credits stored in `extra_summaries` field
- Used after monthly limit is reached
- Available for one-time purchase

---

## 🔄 API Endpoints

### **Global Channel Management**

#### `POST /api/channels/add-global`
Add a new channel using global structure.

**Request:**
```json
{
  "youtube_channel_id": "UCChannelIdHere",
  "channel_name": "Channel Name",
  "channel_url": "https://youtube.com/channel/UCChannelIdHere",
  "channel_description": "Optional description",
  "subscriber_count": 1000,
  "video_count": 50
}
```

**Response:**
```json
{
  "success": true,
  "global_channel_id": "uuid",
  "subscription_id": "uuid"
}
```

#### `GET /api/channels/global`
Get user's global channel subscriptions.

**Response:**
```json
{
  "channels": [
    {
      "subscription_id": "uuid",
      "global_channel_id": "uuid", 
      "youtube_channel_id": "UCChannelId",
      "channel_name": "Channel Name",
      "channel_url": "https://youtube.com/channel/UCChannelId",
      "subscriber_count": 1000,
      "is_active": true,
      "subscribed_at": "2025-01-16T00:00:00Z"
    }
  ]
}
```

#### `DELETE /api/channels/global/:subscription_id`
Unsubscribe from a global channel.

**Response:**
```json
{
  "success": true,
  "message": "Subscription deactivated"
}
```

### **Summary Management**

#### `POST /api/summaries/generate`
Generate a summary for a video (consumes user quota).

**Request:**
```json
{
  "video_transcript": "Full video transcript...",
  "video_title": "Video Title",
  "video_description": "Optional description"
}
```

**Response:**
```json
{
  "success": true,
  "summary": "AI-generated summary...",
  "used_summaries": 26,
  "remaining_summaries": 24
}
```

#### `GET /api/summaries/usage`
Get user's summary usage statistics.

**Response:**
```json
{
  "monthly_summary_limit": 150,
  "monthly_summary_used": 25,
  "extra_summaries": 10,
  "reset_date": "2025-02-16T00:00:00Z",
  "percentage_used": 16.67,
  "can_generate": true
}
```

### **Video Processing**

#### `POST /api/videos/process-global`
Process a new video globally (internal system use).

**Request:**
```json
{
  "global_channel_id": "uuid",
  "video_id": "video-id-here",
  "video_title": "Video Title",
  "video_url": "https://youtube.com/watch?v=video-id",
  "video_description": "Description",
  "video_duration": "00:10:30",
  "published_at": "2025-01-16T00:00:00Z",
  "transcript": "Full transcript...",
  "summary": "AI summary..."
}
```

**Response:**
```json
{
  "success": true,
  "processed_video_id": "uuid",
  "notification_count": 5
}
```

### **User Management**

#### `GET /api/users/status`
Get enhanced user status with global structure data.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "User Name",
    "monthly_summary_limit": 150,
    "monthly_summary_used": 25,
    "extra_summaries": 10,
    "whatsapp_validated": true,
    "business_type": "creator",
    "content_interest": "tech"
  },
  "subscription": {
    "status": "active",
    "plan_name": "pro",
    "current_period_end": "2025-02-16T00:00:00Z"
  },
  "channels": {
    "global_channels": 3,
    "legacy_channels": 1,
    "total_channels": 4,
    "can_add_more": false
  },
  "summaries": {
    "can_generate": true,
    "used": 25,
    "limit": 150,
    "extra": 10
  }
}
```

#### `PATCH /api/users/profile`
Update user profile with business information.

**Request:**
```json
{
  "business_type": "creator",
  "content_interest": "tech",
  "summary_frequency": "realtime"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "business_type": "creator",
    "content_interest": "tech", 
    "summary_frequency": "realtime"
  }
}
```

---

## 🔒 Security & Permissions

### **Row Level Security (RLS)**
All tables have RLS enabled with appropriate policies:

- **Users**: Can only access their own data
- **Global Channels**: Read-only access to all, no user restrictions
- **User Subscriptions**: Users can only see their own subscriptions
- **Video Notifications**: Users can only see their own notifications
- **Processed Videos**: Global read access for summaries

### **Function Security**
All functions use `SECURITY DEFINER` for controlled access:

- Summary functions validate user quotas
- Channel functions check user limits
- Video processing restricted to system use
- User status functions validate phone number ownership

---

## 📱 Frontend Integration

### **TypeScript Integration**

```typescript
import { 
  User, 
  GlobalYouTubeChannel,
  UserChannelSubscription,
  UserStatus,
  SUBSCRIPTION_PLANS 
} from '@/lib/types'

// Type-safe database operations
const user: User = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()

// Type-safe function calls
const canGenerate: boolean = await supabase
  .rpc('can_generate_summary', { user_uuid: userId })

// Type-safe API responses
const status: UserStatus = await fetch('/api/users/status')
  .then(res => res.json())
```

### **React Hook Examples**

```typescript
// Custom hook for user global channels
export function useGlobalChannels(userId: string) {
  return useQuery({
    queryKey: ['global-channels', userId],
    queryFn: () => supabase.rpc('get_user_global_channels', { user_uuid: userId })
  })
}

// Custom hook for summary usage
export function useSummaryUsage(userId: string) {
  return useQuery({
    queryKey: ['summary-usage', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('users')
        .select('monthly_summary_limit, monthly_summary_used, extra_summaries, summary_reset_date')
        .eq('id', userId)
        .single()
      
      return data
    }
  })
}
```

---

## 🔄 Migration Guide

### **From Legacy to Global Structure**

#### **Before (Legacy)**
```typescript
// Old way - user-specific channels
const channels = await supabase
  .from('youtube_channels')
  .select('*')
  .eq('user_id', userId)
```

#### **After (Global)**
```typescript
// New way - global channels with user subscriptions
const channels = await supabase
  .rpc('get_user_global_channels', { user_uuid: userId })
```

### **Compatibility Mode**
The system supports both structures during transition:

- Legacy functions still work
- New functions provide enhanced features
- Data automatically migrated
- Frontend can use either approach

---

## 🚀 Performance Optimizations

### **Database Indexes**
Strategic indexes created for optimal performance:

```sql
-- User summary fields
CREATE INDEX idx_users_monthly_summary_limit ON users(monthly_summary_limit);
CREATE INDEX idx_users_summary_reset_date ON users(summary_reset_date);
CREATE INDEX idx_users_whatsapp_validated ON users(whatsapp_validated);

-- Global channel lookups  
CREATE INDEX idx_global_channels_youtube_id ON global_youtube_channels(youtube_channel_id);
CREATE INDEX idx_global_channels_active ON global_youtube_channels(is_active);

-- User subscription queries
CREATE INDEX idx_user_subscriptions_user_active ON user_channel_subscriptions(user_id, is_active);
CREATE INDEX idx_user_subscriptions_channel ON user_channel_subscriptions(global_channel_id);

-- Video processing
CREATE INDEX idx_global_videos_channel ON global_processed_videos(global_channel_id);
CREATE INDEX idx_global_videos_published ON global_processed_videos(published_at);

-- Notification tracking
CREATE INDEX idx_notifications_user_sent ON user_video_notifications(user_id, is_sent);
CREATE INDEX idx_notifications_video ON user_video_notifications(global_video_id);
```

### **Query Optimizations**
- Functions use efficient JOINs and subqueries
- Batch operations for bulk data processing
- Minimal data transfer with selective columns
- Caching strategies for frequently accessed data

---

## 📊 Monitoring & Analytics

### **System Statistics View**
```sql
SELECT * FROM system_stats;
```

Returns real-time system metrics:
- Total users and active subscribers
- Daily video processing counts
- Message delivery statistics
- System health indicators

### **User Analytics**
Enhanced user tracking includes:
- Business type distribution
- Content interest patterns
- Summary usage trends
- Trial conversion rates

---

## 🔮 Future Enhancements

### **Planned Features**
- **Multi-language support** for summaries
- **Custom summary templates** per user
- **Advanced analytics dashboard**
- **API rate limiting** for enterprise users
- **Webhook notifications** for real-time updates
- **Bulk operations** for channel management

### **Scalability Roadmap**
- **Horizontal scaling** of video processing
- **CDN integration** for video thumbnails
- **Advanced caching** with Redis
- **Microservices architecture** for high load

---

This documentation reflects the complete v2.0 implementation with global architecture, enhanced business model, and comprehensive TypeScript integration. The system is now ready for production scale with 90% cost reduction and unlimited channel support.