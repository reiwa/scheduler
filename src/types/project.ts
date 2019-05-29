import { firestore } from 'firebase-admin'
import { Doc } from './doc'
import { Owner } from './owner'

export type Project = Doc & {
  isArchived: boolean
  name: string | null
  ownerId: string
  ownerRef: firestore.DocumentReference
  owner: Owner
  text: string | null
}
