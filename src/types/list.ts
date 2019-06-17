import { firestore } from 'firebase-admin'
import { Doc } from './doc'
import { Owner } from './owner'

export type List = Doc & {
  description: string | null
  isArchived: boolean
  isPrivate: boolean
  memberIds: string[]
  members: Owner[]
  name: string
  owner: Owner
  ownerId: string
  ownerRef: firestore.DocumentReference
}
