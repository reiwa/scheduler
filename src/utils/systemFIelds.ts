import { firestore } from 'firebase-admin'

export const systemFields = (id: string) => {
  const now = firestore.Timestamp.now()

  return {
    id,
    createdAt: now,
    updatedAt: now
  }
}
