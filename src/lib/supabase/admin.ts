import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function createUserProfileAdmin(userId: string, userData: {
  name: string
  email?: string
  phone_number?: string
}) {
  const supabase = createAdminClient()
  
  try {
    const profileData = {
      id: userId,
      name: userData.name || 'Usuário',
      phone_number: userData.phone_number || null,
      email: userData.email || null,
      subscription_status: 'inactive',
      max_channels: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('users')
      .upsert(profileData)
      .select()
    
    if (error) {
      console.error('Admin client insert error:', error)
      throw error
    }
    
    return { success: true, data }
    
  } catch (error) {
    console.error('Admin profile creation failed:', error)
    return { success: false, error }
  }
}