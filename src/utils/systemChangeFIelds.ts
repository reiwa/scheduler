import { firestore } from 'firebase-admin'

export const systemUpdateFields = () => {
  const now = firestore.Timestamp.now()

  return { updatedAt: now }
}
