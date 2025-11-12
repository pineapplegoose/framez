import "react-native-url-polyfill/auto"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"

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
  const supabaseUrl = "https://fzfpxunnnbtqvlvqmalg.supabase.co"
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6ZnB4dW5ubmJ0cXZsdnFtYWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NDUyNjMsImV4cCI6MjA3ODEyMTI2M30.C109SxIWlZhvy-k27zRyCC3qy_ckGrsTd11Z1XCou6s"

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

export const supabase = isBrowser ? getSupabase() : null

export default supabase
