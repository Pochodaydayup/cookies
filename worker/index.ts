// Cloudflare Worker: serves static assets + Decap CMS OAuth callback
// Set in Cloudflare Dashboard → Environment variables:
//   GITHUB_CLIENT_ID
//   GITHUB_CLIENT_SECRET

interface Env {
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  ASSETS: { fetch: (req: Request) => Promise<Response> }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/auth/callback') {
      // Step 1: CMS sends POST → return GitHub OAuth URL as JSON
      if (request.method === 'POST') {
        const redirectUri = `${url.origin}/api/auth/callback`
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo`
        return new Response(JSON.stringify({ url: githubAuthUrl }), {
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Step 2: GitHub callback with code → exchange for token
      const code = url.searchParams.get('code')
      if (!code) {
        return new Response('Missing code parameter', { status: 400 })
      }

      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
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

      const tokenData = await tokenResponse.json() as { error?: string; access_token?: string; error_description?: string }

      if (tokenData.error) {
        return new Response(`OAuth error: ${tokenData.error_description}`, { status: 400 })
      }

      return new Response(`<!DOCTYPE html>
<html><body>
<script>
  (function() {
    var token = '${tokenData.access_token}';
    window.opener.postMessage(
      { type: 'login_success', token: token },
      '*'
    );
    setTimeout(function() { window.close(); }, 100);
  })();
</script>
<p style="font-family:sans-serif;text-align:center;padding-top:40px;">登录成功，正在返回...</p>
</body></html>`, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    // Everything else: serve static assets
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
