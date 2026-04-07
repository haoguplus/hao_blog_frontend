const PENDING_SCROLL_RESTORE_KEY = 'hao-blog:pending-scroll-restore'

type PendingScrollRestore = {
  route: string
  top: number
  left: number
}

const readPendingScrollRestore = (): PendingScrollRestore | null => {
  if (typeof window === 'undefined') return null

  try {
    const rawValue = window.sessionStorage.getItem(PENDING_SCROLL_RESTORE_KEY)
    if (!rawValue) return null

    const parsedValue = JSON.parse(rawValue) as PendingScrollRestore
    if (!parsedValue?.route) return null

    return {
      route: String(parsedValue.route),
      top: Number(parsedValue.top || 0),
      left: Number(parsedValue.left || 0),
    }
  } catch {
    return null
  }
}

export const setPendingScrollRestore = (payload: PendingScrollRestore) => {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(PENDING_SCROLL_RESTORE_KEY, JSON.stringify(payload))
}

export const applyPendingScrollRestore = (route: string) => {
  if (typeof window === 'undefined') return false

  const pendingRestore = readPendingScrollRestore()
  if (!pendingRestore || pendingRestore.route !== route) return false

  window.sessionStorage.removeItem(PENDING_SCROLL_RESTORE_KEY)
  window.scrollTo({
    top: pendingRestore.top,
    left: pendingRestore.left,
    behavior: 'auto',
  })

  return true
}
