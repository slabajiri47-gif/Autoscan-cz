export interface SupabaseConfig {
  url?: string
  anonKey?: string
}

export const supabaseConfig: SupabaseConfig = {
  url: (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, ''),
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
}

export const supabaseAvailable = Boolean(supabaseConfig.url && supabaseConfig.anonKey)

export async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) throw new Error('Supabase není nakonfigurovaný.')
  const response = await fetch(`${supabaseConfig.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${supabaseConfig.anonKey}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  if (!response.ok) throw new Error(`Supabase request selhal (${response.status}).`)
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
