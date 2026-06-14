// GitHub OAuth callback for Decap CMS
// Flow: /admin → Decap CMS → GitHub OAuth → /api/auth/callback → token back to CMS
//
// Set in Cloudflare Dashboard → Environment variables:
//   GITHUB_CLIENT_ID = your-oauth-app-client-id
//   GITHUB_CLIENT_SECRET = your-oauth-app-secret

export async function onRequestGet(context: any) {
  const { request, env } = context
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return new Response('Missing code parameter', { status: 400 })
  }

  // Exchange code for access token
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

  const tokenData = await tokenResponse.json()

  if (tokenData.error) {
    return new Response(`OAuth error: ${tokenData.error_description}`, { status: 400 })
  }

  // Return HTML that passes the token back to the Decap CMS parent window
  return new Response(`<!DOCTYPE html>
<html><body>
<script>
  (function() {
    const token = '${tokenData.access_token}';
    // Decap CMS github backend listens for this postMessage pattern
    window.opener.postMessage(
      { type: 'login_success', token: token },
      '*'
    );
    // Also close the popup
    setTimeout(function() { window.close(); }, 100);
  })();
</script>
<p style="font-family:sans-serif;text-align:center;padding-top:40px;">登录成功，正在返回...</p>
</body></html>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
