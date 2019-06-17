import { firestore } from 'firebase-admin'
import { Doc } from './doc'
import { Owner } from './owner'
import { TagEmbedded } from './tagEmbedded'

export type Task = Doc & {
  assignee: Owner | null
  assigneeId: string | null
  assigneeRef: firestore.DocumentReference | null
  description: string | null
  dateEnd: firestore.Timestamp | null
  dateStart: firestore.Timestamp | null
  isDone: boolean
  listId: string | null
  listRef: firestore.DocumentReference | null
  name: string
  owner: Owner
  ownerId: string
  ownerRef: firestore.DocumentReference
  photoURLs: string[]
  tagIds: string[]
  tagRefs: firestore.DocumentReference[]
  tags: TagEmbedded[]
}
