/**
 * 访客留言的 Supabase REST 客户端（直连 PostgREST，不引 SDK）
 * key 为 publishable key，数据库侧由 RLS 限制为「可读、可插、不可改删」
 */

export interface GuestbookMessage {
  id: number
  nickname: string | null
  content: string
  created_at: string
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** 环境变量齐备才启用留言模块，否则弹窗静默不加载 */
export const guestbookEnabled = Boolean(url && key)

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${url}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: key!,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  if (!res.ok) throw new Error(`guestbook request failed: ${res.status}`)
  return res.json() as Promise<T>
}

/** 最近 20 条留言，新的在前 */
export function fetchMessages(): Promise<GuestbookMessage[]> {
  return request<GuestbookMessage[]>(
    '/messages?select=id,nickname,content,created_at&order=created_at.desc&limit=20',
  )
}

/** 提交一条留言；nickname 传空串时存 null（展示层回退为「匿名访客」） */
export async function postMessage(nickname: string, content: string): Promise<GuestbookMessage> {
  const rows = await request<GuestbookMessage[]>('/messages', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ nickname: nickname || null, content }),
  })
  return rows[0]
}
