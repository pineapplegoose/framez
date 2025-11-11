import "react-native-url-polyfill/auto"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

const customStorage = {
  getItem: async (key: string) => {
    if (!isBrowser) return null
    if (Platform.OS === "web") {
      return localStorage.getItem(key)
    }
    return AsyncStorage.getItem(key)
  },
  setItem: async (key: string, value: string) => {
    if (!isBrowser) return
    if (Platform.OS === "web") {
      localStorage.setItem(key, value)
      return
    }
    return AsyncStorage.setItem(key, value)
  },
  removeItem: async (key: string) => {
    if (!isBrowser) return
    if (Platform.OS === "web") {
      localStorage.removeItem(key)
      return
    }
    return AsyncStorage.removeItem(key)
  },
}

const createSupabaseClient = () => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      storage: customStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
}

// Create client lazily only when accessed
let supabaseInstance: SupabaseClient | null = null

export const getSupabase = () => {
  if (!isBrowser) {
    return null
  }

  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient()
  }

  return supabaseInstance
}

// For direct usage (will be null during SSR)
export const supabase = isBrowser ? getSupabase() : null

export default supabase
