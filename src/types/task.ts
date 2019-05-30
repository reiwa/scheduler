import { firestore } from 'firebase-admin'
import { Doc } from './doc'
import { Owner } from './owner'

export type Task = Doc & {
  assigneeId: string | null
  assignee: Owner | null
  assigneeRef: firestore.DocumentReference | null
  dateStart: firestore.Timestamp | null
  dateEnd: firestore.Timestamp | null
  name: string
  isDone: boolean
  ownerId: string
  ownerRef: firestore.DocumentReference
  owner: Owner
  projectId: string | null
  projectRef: firestore.DocumentReference | null
  photoURLs: string[]
  text: string | null
}
