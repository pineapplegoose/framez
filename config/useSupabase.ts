import { useEffect, useState } from "react"
import { getSupabase } from "./supabase"

export const useSupabase = () => {
  const [supabase, setSupabase] = useState<ReturnType<typeof getSupabase>>(null)

  useEffect(() => {
    setSupabase(getSupabase())
  }, [])

  return supabase
}
