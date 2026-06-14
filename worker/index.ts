// Cloudflare Worker: serves static assets + Decap CMS OAuth
// GitHub credentials are injected at build time via worker/src/env.ts

import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from './src/env'

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> }
}

function popupPage(clientId: string, redirectUri: string, scope: string): string {
  return `<!DOCTYPE html>
<html><body>
<p style="font-family:sans-serif;text-align:center;padding-top:40px;">正在跳转到 GitHub 登录...</p>
<script>
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

function callbackPage(token: string): string {
  return `<!DOCTYPE html>
<html><body>
<p style="font-family:sans-serif;text-align:center;padding-top:40px;">登录成功，正在返回...</p>
<script>
  var data = JSON.stringify({ token: '${token}', provider: 'github' });
  var msg = 'authorization:github:success:' + data;

  function sendToken() {
    if (window.opener) {
      window.opener.postMessage(msg, '*');
    }
  }

  window.addEventListener('message', function(e) {
    if (e.data === 'authorizing:github') {
      e.source.postMessage('authorizing:github', e.origin);
      setTimeout(function() {
        sendToken();
        setTimeout(function() { window.close(); }, 300);
      }, 100);
    }
  });

  setTimeout(sendToken, 300);
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

      return new Response(callbackPage(tokenData.access_token!), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
