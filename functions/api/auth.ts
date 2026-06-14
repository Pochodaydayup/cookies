// GitHub OAuth callback for Decap CMS
// Set these in Cloudflare Dashboard → Settings → Environment variables:
//   GITHUB_CLIENT_ID = your-oauth-app-client-id
//   GITHUB_CLIENT_SECRET = your-oauth-app-secret

export async function onRequestPost(context: any) {
  const { request, env } = context

  const body = await request.json()
  const code = body.code

  if (!code) {
    return new Response(JSON.stringify({ error: 'Missing code' }), { status: 400 })
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const data = await response.json()

  if (data.error) {
    return new Response(JSON.stringify({ error: data.error_description }), { status: 400 })
  }

  return new Response(JSON.stringify({ token: data.access_token }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
