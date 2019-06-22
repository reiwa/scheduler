import { firestore } from 'firebase-admin'
import { CustomClaims } from './customClaims'
import { Doc } from './doc'
import { Owner } from './owner'

export type List = Doc & {
  description: string | null
  isArchived: boolean
  isPrivate: boolean
  memberIds: string[]
  memberRefs: firestore.DocumentReference[]
  members: Owner<CustomClaims>[]
  name: string
  owner: Owner<CustomClaims>
  ownerId: string
  ownerRef: firestore.DocumentReference
}
