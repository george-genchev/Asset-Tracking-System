// Supabase Client Configuration
// This file initializes the Supabase client for authentication

import { createClient } from "@supabase/supabase-js";

let supabaseClient = null;

// Initialize Supabase client
export async function initSupabase() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

// Get the Supabase client
export async function getSupabase() {
  if (!supabaseClient) {
    await initSupabase();
  }
  return supabaseClient;
}

// Auth helpers
export async function signUp(email, password) {
  const client = await getSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password
  });
  return { data, error };
}

export async function signIn(email, password) {
  const client = await getSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
}

export async function signOut() {
  const client = await getSupabase();
  const { error } = await client.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const client = await getSupabase();
  const { data: { user }, error } = await client.auth.getUser();
  return { user, error };
}

export async function onAuthStateChange(callback) {
  const client = await getSupabase();
  const { data: { subscription } } = client.auth.onAuthStateChange(callback);
  return subscription;
}
