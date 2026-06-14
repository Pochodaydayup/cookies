// GitHub OAuth callback for Decap CMS on Cloudflare Pages
// Set in Cloudflare Dashboard → Environment variables:
//   GITHUB_CLIENT_ID
//   GITHUB_CLIENT_SECRET

export async function onRequestGet(context: any) {
  const { request, env } = context
  const url = new URL(request.url)
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

  const tokenData = await tokenResponse.json()

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
