import { firestore } from 'firebase-admin'
import { Doc } from './doc'
import { Owner } from './owner'

export type Task = Doc & {
  dateStart: firestore.Timestamp | null
  dateEnd: firestore.Timestamp | null
  isDone: boolean
  ownerId: string
  ownerRef: firestore.DocumentReference
  owner: Owner
  projectId: string | null
  projectRef: firestore.DocumentReference | null
  photoURLs: string[]
  text: string | null
  title: string | null
}
