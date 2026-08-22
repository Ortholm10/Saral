import { useEffect, useState } from 'react'
import { fetchDocumentHistory, type DocumentHistoryItem } from '@/lib/api'

/**
 * The signed-in user's finished documents.
 *
 * `null` means still loading; an array means settled. There is deliberately no
 * error state: an unreachable list and an empty list are the same thing to the
 * user, and a history list is never worth showing a failure for. Both the
 * Dashboard and Settings render from this one hook.
 */
export function useDocumentHistory(userId: string | undefined): DocumentHistoryItem[] | null {
  const [documents, setDocuments] = useState<DocumentHistoryItem[] | null>(null)

  useEffect(() => {
    if (!userId) return
    let ignore = false
    const controller = new AbortController()

    fetchDocumentHistory(userId, { signal: controller.signal })
      .then((items) => {
        if (!ignore) setDocuments(items)
      })
      .catch(() => {
        if (!ignore) setDocuments([])
      })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [userId])

  // Signed out there is nothing to fetch and nothing to wait for.
  return userId ? documents : []
}
