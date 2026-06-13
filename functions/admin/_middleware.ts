// Cloudflare Pages Function: Basic Auth for /admin
// Set these in Cloudflare Dashboard → Settings → Environment variables:
//   ADMIN_USERNAME = your-username
//   ADMIN_PASSWORD = your-password

export async function onRequest(context: any) {
  const { request, env } = context

  const username = env.ADMIN_USERNAME ?? 'admin'
  const password = env.ADMIN_PASSWORD ?? ''

  const authHeader = request.headers.get('Authorization')

  if (authHeader) {
    const encoded = authHeader.replace('Basic ', '')
    const decoded = atob(encoded)
    const [inputUser, inputPass] = decoded.split(':')

    if (inputUser === username && inputPass === password) {
      return context.next()
    }
  }

  return new Response('需要登录才能访问管理页面', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="重庆美食地图管理后台"',
    },
  })
}
