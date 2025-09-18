export type UnreadEventDetail = { count: number }

const EVENT = 'notifications:unread'

export function emitUnreadCount(count: number) {
  try {
    window.dispatchEvent(
      new CustomEvent<UnreadEventDetail>(EVENT, { detail: { count } })
    )
  } catch {
    console.log('Failed to emit unread count')
  }
}

export function onUnreadCount(handler: (count: number) => void) {
  const listener = (e: Event) => {
    const ce = e as CustomEvent<UnreadEventDetail>
    const n = Number(ce.detail?.count)
    if (!Number.isNaN(n)) handler(n)
  }
  window.addEventListener(EVENT, listener as EventListener)
  return () => window.removeEventListener(EVENT, listener as EventListener)
}
