// Every page that touches Supabase checks this first, so the app degrades to a
// clear "connect your database" screen instead of a crash when a pilot demo
// environment doesn't have credentials configured yet.
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
