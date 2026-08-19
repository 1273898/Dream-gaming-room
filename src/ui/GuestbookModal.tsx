import { useEffect, useRef, useState } from 'react'
import { useRoomStore } from '../store'
import {
  fetchMessages,
  guestbookEnabled,
  postMessage,
  type GuestbookMessage,
} from '../guestbook/guestbook'

const MAX_CONTENT = 50
const MAX_NAME = 12

function formatTime(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 访客留言弹窗：进入场景一段时间后自动弹出一次，可留一句话 + ID，下方展示最近留言 */
export function GuestbookModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const isNight = useRoomStore((s) => s.isNight)
  const [messages, setMessages] = useState<GuestbookMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [nickname, setNickname] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [done, setDone] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 打开时拉取最近留言，并重置上次提交的状态
  useEffect(() => {
    if (!open || !guestbookEnabled) return
    let cancelled = false
    setDone(false)
    setSubmitError(false)
    setLoading(true)
    setLoadError(false)
    fetchMessages()
      .then((rows) => {
        if (!cancelled) setMessages(rows)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  // Esc 关闭
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // 卸载时清理自动关闭定时器
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    },
    [],
  )

  const submit = async () => {
    const text = content.trim()
    if (!text || submitting || done) return
    setSubmitting(true)
    setSubmitError(false)
    try {
      const row = await postMessage(nickname.trim(), text)
      setMessages((prev) => [row, ...prev].slice(0, 20))
      setContent('')
      setDone(true)
      // 让访客看到自己那条出现在列表顶部后，弹窗自动淡出
      closeTimer.current = setTimeout(onClose, 1500)
    } catch {
      setSubmitError(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (!guestbookEnabled) return null

  return (
    <div
      className={`guestbook-overlay${open ? ' open' : ''}${isNight ? ' night' : ''}`}
      aria-hidden={!open}
      onClick={onClose}
    >
      <div
        className="guestbook-card"
        role="dialog"
        aria-modal="true"
        aria-label="访客留言"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="guestbook-head">
          <strong>留言板</strong>
          <button
            type="button"
            className="guestbook-close"
            aria-label="关闭留言板"
            tabIndex={open ? 0 : -1}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="guestbook-form">
          <input
            value={nickname}
            maxLength={MAX_NAME}
            placeholder="你的 ID（选填）"
            tabIndex={open ? 0 : -1}
            onChange={(e) => setNickname(e.target.value)}
          />
          <textarea
            value={content}
            maxLength={MAX_CONTENT}
            rows={2}
            placeholder="留下一句话…"
            tabIndex={open ? 0 : -1}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="guestbook-form-foot">
            <span className="guestbook-count">
              {content.length}/{MAX_CONTENT}
            </span>
            <button
              type="button"
              disabled={!content.trim() || submitting || done}
              tabIndex={open ? 0 : -1}
              onClick={submit}
            >
              {done ? '已留下足迹 ✓' : submitting ? '提交中…' : '留下足迹'}
            </button>
          </div>
          {submitError && <p className="guestbook-error">提交失败，请再试一次</p>}
        </div>

        <ul className="guestbook-list">
          {loading && <li className="guestbook-tip">留言加载中…</li>}
          {loadError && <li className="guestbook-tip">留言加载失败，稍后再来看看吧</li>}
          {!loading && !loadError && messages.length === 0 && (
            <li className="guestbook-tip">还没有留言，来抢沙发</li>
          )}
          {messages.map((m) => (
            <li key={m.id}>
              <div className="guestbook-meta">
                <span className="guestbook-name">{m.nickname || '匿名访客'}</span>
                <span className="guestbook-time">{formatTime(m.created_at)}</span>
              </div>
              <p>{m.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
