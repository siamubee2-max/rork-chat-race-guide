import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const SUPABASE_URL = "https://sceqhspcgdxliypbdyzx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZXFoc3BjZ2R4bGl5cGJkeXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzYwODksImV4cCI6MjA3ODk1MjA4OX0.evysR-g87kStJk-wObrpDEZK6JW6uglkVDcmfsG8wlc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});
