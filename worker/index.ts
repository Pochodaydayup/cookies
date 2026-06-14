// Cloudflare Worker: serves static assets + Decap CMS OAuth

import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from './src/env'

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> }
}

function popupPage(clientId: string, redirectUri: string, scope: string): string {
  return `<!DOCTYPE html>
<html><body>
<p style="font-family:sans-serif;text-align:center;padding-top:40px;">正在跳转到 GitHub 登录...</p>
<script>
  // Handle handshake from parent (Decap CMS)
  window.addEventListener('message', function(e) {
    if (e.data === 'authorizing:github') {
      e.source.postMessage('authorizing:github', e.origin);
    }
  });
  var authUrl = 'https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}';
  window.location.href = authUrl;
</script>
</body></html>`;
}

function callbackPage(token: string, baseUrl: string): string {
  return `<!DOCTYPE html>
<html><body>
<p style="font-family:sans-serif;text-align:center;padding-top:40px;">登录成功，正在返回...</p>
<script>
  var token = '${token}';
  var data = JSON.stringify({ token: token, provider: 'github' });
  var msg = 'authorization:github:success:' + data;

  // The parent's authorizeCallback checks e.origin === base_url.
  // postMessage with specific targetOrigin to match what Decap CMS expects.
  var targetOrigin = '${baseUrl}';

  function trySend() {
    if (window.opener) {
      window.opener.postMessage(msg, targetOrigin);
    }
  }

  trySend();
  setTimeout(trySend, 200);
  setTimeout(trySend, 500);
  setTimeout(trySend, 1000);
  setTimeout(trySend, 2000);
  setTimeout(function() { window.close(); }, 3000);
</script>
</body></html>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/auth/callback') {
      const code = url.searchParams.get('code')

      if (!code) {
        const scope = url.searchParams.get('scope') || 'repo'
        const redirectUri = `${url.origin}/api/auth/callback`
        return new Response(popupPage(GITHUB_CLIENT_ID, redirectUri, scope), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
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

      return new Response(callbackPage(tokenData.access_token!, url.origin), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
