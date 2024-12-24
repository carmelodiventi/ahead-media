import {createServerClient, parseCookieHeader, serializeCookieHeader} from '@supabase/ssr'
export const createSupabaseServerClient = (request: Request) => {
  const cookies = parseCookieHeader(request.headers.get('Cookie') ?? '')
  const headers = new Headers()
  const supabaseClient = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookies
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
        )
      },
    },
  })
  return { supabaseClient, headers }
}