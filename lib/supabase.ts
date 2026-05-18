import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rwrhzbjvmtvqaliwqbxf.supabase.co'
const supabaseAnonKey = 'sb_publishable_b0dKCmMfKXPzGsDHpQtR5g_lx1bhkmZ'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)