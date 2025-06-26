export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  // 默认带上 cookie
  init.credentials = 'include'

  let response = await fetch(input, init)

  // 如果 access token 过期，后端通常返回 401
  if (response.status === 401) {
    // 尝试刷新 token
    const refreshResp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: localStorage.getItem('refresh_token'),
      }),
    })
    if (refreshResp.ok) {
      const data = await refreshResp.json()
      localStorage.setItem('access_token', data.access)
      init.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
    }
      response = await fetch(input, init)
    } else {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('username')
      window.location.href = '/login'
      throw new Error('登录已过期，请重新登录')
    }
  }
  return response
}

// 获取 cookie 工具
export function getCookie(name: string) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()!.split(';').shift()
  return ''
}
