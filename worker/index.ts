// Cloudflare Worker: serves static assets + Decap CMS OAuth

import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from './src/env'

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> }
}

function popupPage(clientId: string, redirectUri: string, scope: string): string {
  return `<!DOCTYPE html>
<html><head><style>
  body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #1A1B2E; }
  .container { text-align: center; }
  a { color: #3B7FFF; }
</style></head>
<body>
<div class="container">
  <p>正在跳转到 GitHub 登录...</p>
  <p>如果没有自动跳转，<a id="link" href="#">点击这里</a></p>
</div>
<script>
  var authUrl = 'https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}';
  document.getElementById('link').href = authUrl;
  window.location.href = authUrl;
</script>
</body></html>`;
}

function callbackPage(token: string, baseUrl: string): string {
  return `<!DOCTYPE html>
<html><head><style>
  body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #1A1B2E; }
  .container { text-align: center; }
  .success { color: #34B369; font-size: 18px; margin-bottom: 8px; }
</style></head>
<body>
<div class="container">
  <div class="success">&#10003; 登录成功</div>
  <p>正在返回管理页面...</p>
</div>
<script>
  var token = '${token}';
  var data = JSON.stringify({ token: token, provider: 'github' });
  var msg = 'authorization:github:success:' + data;
  var targetOrigin = '${baseUrl}';

  // The popup navigated through GitHub and back, so window.opener might be null
  // due to cross-origin navigation. Try postMessage with specific origin.
  function trySend() {
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(msg, targetOrigin);
        return true;
      }
    } catch(e) {}
    return false;
  }

  // Try multiple times
  if (!trySend()) {
    setTimeout(function() { trySend(); }, 100);
    setTimeout(function() { trySend(); }, 300);
    setTimeout(function() { trySend(); }, 600);
    setTimeout(function() { trySend(); }, 1000);
    setTimeout(function() { trySend(); }, 2000);
  }

  setTimeout(function() { window.close(); }, 4000);
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
