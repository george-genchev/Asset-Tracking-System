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
export async function signUp(email, password, fullName) {
  const client = await getSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: fullName,
        full_name: fullName
      }
    }
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

// Strategy helpers
export async function getUserStrategies(userId) {
  const client = await getSupabase();
  const { data, error } = await client
    .from("strategies")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getStrategyById(strategyId) {
  const client = await getSupabase();
  const { data, error } = await client
    .from("strategies")
    .select("*")
    .eq("id", strategyId)
    .single();
  return { data, error };
}

// Asset helpers
export async function getAssetsByStrategy(strategyId) {
  const client = await getSupabase();
  const { data, error } = await client
    .from("assets")
    .select("*, targets(name)")
    .eq("strategy_id", strategyId)
    .order("created_at", { ascending: true });
  return { data, error };
}

// Strategy CRUD operations
export async function createStrategy(userId, title, description) {
  const client = await getSupabase();
  const { data, error } = await client
    .from("strategies")
    .insert([{
      owner_id: userId,
      title,
      description
    }])
    .select()
    .single();
  return { data, error };
}

export async function updateStrategy(strategyId, title, description) {
  const client = await getSupabase();
  const { data, error } = await client
    .from("strategies")
    .update({
      title,
      description,
      updated_at: new Date().toISOString()
    })
    .eq("id", strategyId)
    .select()
    .single();
  return { data, error };
}

export async function deleteStrategy(strategyId) {
  const client = await getSupabase();
  const { data, error } = await client
    .from("strategies")
    .delete()
    .eq("id", strategyId);
  return { data, error };
}

// Asset CRUD operations
export async function getAllAssets(userId) {
  const client = await getSupabase();
  const { data, error } = await client
    .from("assets")
    .select(`
      *,
      strategies(id, title),
      targets(id, name)
    `)
    .eq("strategies.owner_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getAssetById(assetId) {
  const client = await getSupabase();
  const { data, error } = await client
    .from("assets")
    .select(`
      *,
      strategies(id, title, owner_id),
      targets(id, name)
    `)
    .eq("id", assetId)
    .single();
  return { data, error };
}

export async function createAsset(strategyId, ticker, name, exchange, quantity, targetId) {
  const client = await getSupabase();
  const { data, error } = await client
    .from("assets")
    .insert([{
      strategy_id: strategyId,
      ticker,
      name,
      exchange,
      quantity,
      target_id: targetId,
      date: new Date().toISOString()
    }])
    .select()
    .single();
  return { data, error };
}

export async function updateAsset(assetId, assetData) {
  const client = await getSupabase();
  const { data, error } = await client
    .from("assets")
    .update({
      ...assetData,
      updated_at: new Date().toISOString()
    })
    .eq("id", assetId)
    .select()
    .single();
  return { data, error };
}

export async function deleteAsset(assetId) {
  const client = await getSupabase();
  const { data, error } = await client
    .from("assets")
    .delete()
    .eq("id", assetId);
  return { data, error };
}

// Target helpers
export async function getTargets() {
  const client = await getSupabase();
  const { data, error } = await client
    .from("targets")
    .select("*")
    .order("name", { ascending: true });
  return { data, error };
}
