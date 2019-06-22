import { firestore } from 'firebase-admin'

export const systemChangeFields = () => {
  const now = firestore.Timestamp.now()

  return { updatedAt: now }
}
