// Cloudflare Worker: serves static assets + Decap CMS OAuth
// Set in Cloudflare Dashboard → Environment variables:
//   GITHUB_CLIENT_ID
//   GITHUB_CLIENT_SECRET

interface Env {
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  ASSETS: { fetch: (req: Request) => Promise<Response> }
}

// HTML page for the OAuth popup — handles Netlify-style postMessage handshake then redirects to GitHub
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

// HTML page for the callback — exchanges code for token and sends back to parent
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

  // The parent (CMS) needs to register authorizeCallback first.
  // It registers that only after the handshake. Re-trigger the handshake
  // flow so the parent registers the authorizeCallback listener, then send the token.
  window.addEventListener('message', function(e) {
    if (e.data === 'authorizing:github') {
      // Parent is asking for handshake — respond and then send the token
      e.source.postMessage('authorizing:github', e.origin);
      // Small delay to let the parent register authorizeCallback
      setTimeout(function() {
        sendToken();
        setTimeout(function() { window.close(); }, 300);
      }, 100);
    }
  });

  // Also try sending immediately in case parent already has the listener
  setTimeout(sendToken, 300);
</script>
</body></html>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/auth/callback') {
      const code = url.searchParams.get('code')

      // No code → initial popup load from Decap CMS
      if (!code) {
        const scope = url.searchParams.get('scope') || 'repo'
        const redirectUri = `${url.origin}/api/auth/callback`

        const html = popupPage(env.GITHUB_CLIENT_ID, redirectUri, scope)
        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      }

      // Have code → exchange for token
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
        const errData = JSON.stringify({ message: tokenData.error_description })
        return new Response(`<!DOCTYPE html>
<html><body>
<script>
  if (window.opener) {
    window.opener.postMessage('authorization:github:error:${errData}', '*');
  }
</script>
<p>OAuth error: ${tokenData.error_description}</p>
</body></html>`, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      }

      const html = callbackPage(tokenData.access_token!)
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    // Everything else: serve static assets
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
