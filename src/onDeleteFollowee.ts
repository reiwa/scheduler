import { firestore } from 'firebase-admin'
import { EventContext, region } from 'firebase-functions'
import { FOLLOWEES, USERS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { Followee } from './types/followee'
import { detectDuplicateEvent } from './utils/detectDuplicateEvent'

const path = `${USERS}/{userId}/${FOLLOWEES}/{followeeId}`

const handler = async (
  snapshot: firestore.DocumentSnapshot,
  context: EventContext
) => {
  detectDuplicateEvent(context)

  const followee = snapshot.data() as Followee

  const { userId } = context.params

  const followeeRef = firestore()
    .collection(USERS)
    .doc(userId)

  const followerRef = firestore()
    .collection(USERS)
    .doc(followee.id)

  const count = firestore.FieldValue.increment(-1)

  await Promise.all([
    followeeRef.update({ followeeCount: count }),
    followerRef.update({ followerCount: count })
  ])
}

module.exports = region(ASIA_NORTHEAST1)
  .firestore.document(path)
  .onDelete(handler)
