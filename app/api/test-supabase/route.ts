import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return Response.json(
      { error: 'Missing env vars', url: !!url, key: !!key },
      { status: 400 }
    )
  }

  const supabase = createClient(url, key)

  try {
    const { error } = await supabase.from('events').select('count').limit(1)
    
    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ success: true, message: 'Connected to Supabase' })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}