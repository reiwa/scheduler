import { firestore } from 'firebase-admin'

export const createId = (): string => {
  return firestore()
    .collection('default')
    .doc().id
}
