import { firestore } from 'firebase-admin'
import { Doc } from './doc'

export type Invitation = Doc & {
  listId: string
  type: 'unlimited'
  ownerId: string
  ownerRef: firestore.DocumentReference
}
