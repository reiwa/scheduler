import { firestore } from 'firebase-admin'
import { CustomClaims } from './customClaims'
import { Doc } from './doc'
import { Owner } from './owner'
import { TagEmbedded } from './tagEmbedded'

export type Task = Doc & {
  assignee: Owner<CustomClaims> | null
  assigneeId: string | null
  assigneeRef: firestore.DocumentReference | null
  description: string | null
  dateEnd: firestore.Timestamp | null
  dateStart: firestore.Timestamp | null
  isDone: boolean
  listId: string | null
  listRef: firestore.DocumentReference | null
  name: string
  owner: Owner<CustomClaims>
  ownerId: string
  ownerRef: firestore.DocumentReference
  photoURLs: string[]
  tagIds: string[]
  tagRefs: firestore.DocumentReference[]
  tags: TagEmbedded[]
}
