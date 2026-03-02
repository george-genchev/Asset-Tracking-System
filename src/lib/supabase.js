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

export async function getCurrentUserRole() {
  const client = await getSupabase();
  const { user, error: userError } = await getCurrentUser();

  if (userError || !user) {
    return { role: null, error: userError || null };
  }

  const { data, error } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return { role: data?.role || null, error };
}

export async function isCurrentUserAdmin() {
  const client = await getSupabase();

  const { data: rpcData, error: rpcError } = await client.rpc("is_admin");
  if (!rpcError) {
    return { isAdmin: Boolean(rpcData), error: null };
  }

  const { role, error } = await getCurrentUserRole();
  return { isAdmin: role === "admin", error };
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
    .select("*, targets(name), actions(id, name), exchanges(id, name)")
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
      targets(id, name),
      actions(id, name),
      exchanges(id, name)
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
      targets(id, name),
      actions(id, name),
      exchanges(id, name)
    `)
    .eq("id", assetId)
    .single();
  return { data, error };
}

export async function createAsset(strategyId, ticker, name, exchangeId, quantity, targetId, actionId) {
  const client = await getSupabase();
  const { data, error } = await client
    .from("assets")
    .insert([{
      strategy_id: strategyId,
      ticker,
      name,
      exchange_id: exchangeId,
      quantity,
      target_id: targetId,
      action_id: actionId || null,
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

export async function getActions() {
  const client = await getSupabase();
  const { data, error } = await client
    .from("actions")
    .select("*")
    .order("name", { ascending: true });
  return { data, error };
}

export async function getExchanges() {
  const client = await getSupabase();
  const { data, error } = await client
    .from("exchanges")
    .select("*")
    .order("name", { ascending: true });
  return { data, error };
}

export async function getOrders() {
  const client = await getSupabase();
  const { data, error } = await client
    .from("orders")
    .select("*")
    .order("name", { ascending: true });
  return { data, error };
}

const ADMIN_LOOKUP_TABLES = new Set(["actions", "exchanges", "orders", "targets"]);

function assertLookupTable(tableName) {
  if (!ADMIN_LOOKUP_TABLES.has(tableName)) {
    throw new Error("Invalid admin lookup table");
  }
}

export async function getAdminLookupRecordById(tableName, recordId) {
  assertLookupTable(tableName);

  const client = await getSupabase();
  const { data, error } = await client
    .from(tableName)
    .select("*")
    .eq("id", recordId)
    .single();

  return { data, error };
}

export async function createAdminLookupRecord(tableName, name) {
  assertLookupTable(tableName);

  const client = await getSupabase();
  const { data, error } = await client
    .from(tableName)
    .insert([{ name }])
    .select()
    .single();

  return { data, error };
}

export async function updateAdminLookupRecord(tableName, recordId, name) {
  assertLookupTable(tableName);

  const client = await getSupabase();
  const { data, error } = await client
    .from(tableName)
    .update({ name })
    .eq("id", recordId)
    .select()
    .single();

  return { data, error };
}

export async function deleteAdminLookupRecord(tableName, recordId) {
  assertLookupTable(tableName);

  const client = await getSupabase();
  const { data, error } = await client
    .from(tableName)
    .delete()
    .eq("id", recordId)
    .select()
    .single();

  return { data, error };
}

const STRATEGY_ATTACHMENTS_BUCKET = "strategy-attachments";

export async function getStrategyAttachments(strategyId) {
  const client = await getSupabase();
  const { data, error } = await client
    .from("strategy_attachments")
    .select("*")
    .eq("strategy_id", strategyId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getFirstStrategyImageAttachment(strategyId) {
  const client = await getSupabase();
  const { data, error } = await client
    .from("strategy_attachments")
    .select("file_path, mime_type, file_name, created_at")
    .eq("strategy_id", strategyId)
    .or("mime_type.like.image/%,file_name.ilike.%.png,file_name.ilike.%.jpg,file_name.ilike.%.jpeg,file_name.ilike.%.webp,file_name.ilike.%.gif,file_name.ilike.%.bmp,file_name.ilike.%.svg")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return { data, error };
}

export async function createStrategyAttachment(attachmentData) {
  const client = await getSupabase();
  const { user } = await getCurrentUser();

  const { data, error } = await client
    .from("strategy_attachments")
    .insert([
      {
        ...attachmentData,
        owner_id: user?.id || null
      }
    ])
    .select()
    .single();

  return { data, error };
}

export async function deleteStrategyAttachment(attachmentId) {
  const client = await getSupabase();
  const { data, error } = await client
    .from("strategy_attachments")
    .delete()
    .eq("id", attachmentId)
    .select()
    .single();

  return { data, error };
}

export async function uploadStrategyAttachment(strategyId, file) {
  const client = await getSupabase();
  const safeName = sanitizeFileName(file.name);
  const uniquePrefix = `${Date.now()}-${crypto.randomUUID()}`;
  const path = `${strategyId}/${uniquePrefix}-${safeName}`;

  const { data, error } = await client
    .storage
    .from(STRATEGY_ATTACHMENTS_BUCKET)
    .upload(path, file, {
      upsert: false,
      contentType: file.type || "application/octet-stream"
    });

  if (error) {
    return { path: null, data: null, error };
  }

  return { path, data, error: null };
}

export async function removeStrategyAttachmentFile(path) {
  const client = await getSupabase();
  const { data, error } = await client
    .storage
    .from(STRATEGY_ATTACHMENTS_BUCKET)
    .remove([path]);

  return { data, error };
}

export async function getStrategyAttachmentSignedUrl(path) {
  const client = await getSupabase();
  const { data, error } = await client
    .storage
    .from(STRATEGY_ATTACHMENTS_BUCKET)
    .createSignedUrl(path, 60 * 60);

  return { data, error };
}

function sanitizeFileName(fileName) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
