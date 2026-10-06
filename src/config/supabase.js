/**
 * Supabase Client Configuration
 *
 * This module initializes and exports the Supabase client for use throughout the application.
 * The client is configured with environment variables for the project URL and anon key.
 */

import { createClient } from "@supabase/supabase-js";

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase client instance
 *
 * This is the main client used for:
 * - Authentication (supabase.auth)
 * - Database operations (supabase.from())
 * - Real-time subscriptions (supabase.channel())
 * - Storage (supabase.storage)
 * - Edge Functions (supabase.functions)
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          // Auto-refresh the session before it expires
          autoRefreshToken: true,
          // Persist the session in local storage
          persistSession: true,
          // Detect session from URL parameters (for OAuth callbacks)
          detectSessionInUrl: true,
          // Storage key for session data
          storageKey: "game-datacards-auth",
        },
        db: {
          // Use the 'public' schema by default
          schema: "public",
        },
        // Global headers for all requests
        global: {
          headers: {
            "x-app-version": import.meta.env.VITE_VERSION || "dev",
          },
        },
      })
    : null;

/**
 * Helper function to check if we have a valid Supabase configuration
 */
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

/**
 * Helper function to get the current session
 * @returns {Promise<{data: {session: Session | null}, error: Error | null}>}
 */
export const getSession = async () => {
  return await supabase.auth.getSession();
};

/**
 * Helper function to get the current user
 * @returns {Promise<{data: {user: User | null}, error: Error | null}>}
 */
export const getUser = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return { data: { user: null }, error: null };
  }
  return await supabase.auth.getUser();
};

export default supabase;
