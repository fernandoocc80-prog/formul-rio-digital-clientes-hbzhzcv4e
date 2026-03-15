// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
// Custom fetch implementation added with retry mechanism for network stability
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

const fetchWithRetry = async (url: RequestInfo | URL, options?: RequestInit) => {
  const MAX_RETRIES = 3
  let attempt = 0

  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch(url, options)
      return response
    } catch (error) {
      attempt++
      if (attempt >= MAX_RETRIES) {
        throw error
      }
      // Exponential backoff specifically for network-related failures
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)))
    }
  }
  return fetch(url, options) // fallback
}

// Import the supabase client like this:
// import { supabase } from "@/lib/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: fetchWithRetry,
  },
})
