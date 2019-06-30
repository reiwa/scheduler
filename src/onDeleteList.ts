import { firestore } from 'firebase-admin'
import { region } from 'firebase-functions'
import { LISTS, TASKS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { List } from './types/list'
import { createBatchArray } from './utils/createBatchArray'

const path = `${LISTS}/{listId}`

const handler = async (snapshot: firestore.DocumentSnapshot) => {
  const list = snapshot.data() as List

  const tasksQuerySnap = await firestore()
    .collection(TASKS)
    .where('listId', '==', list.id)
    .get()

  for (const snaps of createBatchArray(tasksQuerySnap.docs)) {
    const batch = firestore().batch()
    for (const snap of snaps) {
      batch.delete(snap.ref)
    }
    await batch.commit()
  }
}

module.exports = region(ASIA_NORTHEAST1)
  .firestore.document(path)
  .onDelete(handler)
