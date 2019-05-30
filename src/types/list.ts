import { firestore } from 'firebase-admin'
import { Doc } from './doc'
import { Owner } from './owner'

export type List = Doc & {
  isArchived: boolean
  isPrivate: boolean
  name: string | null
  ownerId: string
  ownerRef: firestore.DocumentReference
  owner: Owner
}
