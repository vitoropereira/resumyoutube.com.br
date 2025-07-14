import { createClient } from '@/lib/supabase/client'

export async function createUserProfile(userId: string, name: string, email?: string) {
  const supabase = createClient()
  
  try {
    console.log('Starting user profile creation for:', { userId, name, email })
    
    // First, try to check if user already exists
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle() // Use maybeSingle instead of single to avoid error if not found

    if (selectError) {
      console.log('Error checking existing user (this might be OK):', selectError)
    }

    if (existingUser) {
      console.log('User already exists, updating...')
      const { error } = await supabase
        .from('users')
        .update({
          name,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (error) {
        console.error('Update error:', error)
        throw error
      }
      return { success: true }
    }

    // User doesn't exist, create new profile
    console.log('Creating new user profile...')
    
    // The simplest approach that should work with current schema
    const userData = {
      id: userId,
      name: name || 'Usuário',
      phone_number: null,
      email: email || null,
      subscription_status: 'inactive',
      max_channels: 3
    }

    console.log('Inserting user data:', userData)
    
    const { error, data } = await supabase
      .from('users')
      .insert(userData)
      .select()

    if (error) {
      console.error('Insert error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        userData
      })
      throw error
    }

    console.log('User profile created successfully:', data)
    return { success: true, data }

  } catch (error) {
    console.error('Failed to create user profile:', error)
    return { success: false, error }
  }
}

export async function getUserProfile(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}