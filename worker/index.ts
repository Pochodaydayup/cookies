// Cloudflare Worker: serves static assets + Decap CMS OAuth (redirect flow)

import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from './src/env'

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // Start OAuth: redirect to GitHub
    if (url.pathname === '/api/auth/login') {
      const redirectUri = `${url.origin}/api/auth/callback`
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo`
      return Response.redirect(githubAuthUrl, 302)
    }

    // OAuth callback: exchange code for token, then redirect to admin with token
    if (url.pathname === '/api/auth/callback') {
      const code = url.searchParams.get('code')
      if (!code) {
        return new Response('Missing code', { status: 400 })
      }

      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        }),
      })

      const tokenData = await tokenResponse.json() as { error?: string; access_token?: string; error_description?: string }

      if (tokenData.error) {
        return new Response(`OAuth error: ${tokenData.error_description}`, { status: 400 })
      }

      // Redirect back to admin page with token in sessionStorage via a small HTML page
      return new Response(`<!DOCTYPE html>
<html><body>
<script>
  sessionStorage.setItem('github_token', '${tokenData.access_token}');
  window.location.href = '/admin/';
</script>
</body></html>`, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
