import { firestore } from 'firebase-admin'
import { https, region } from 'firebase-functions'
import {
  ALREADY_EXISTS,
  CANCELLED,
  INVALID_ARGUMENT,
  NOT_FOUND,
  UNAUTHENTICATED
} from './constants/code'
import { FOLLOWEES, USERS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { message } from './helpers/message'
import { CreateFolloweeData } from './types/createFolloweeData'
import { CreateFolloweeResult } from './types/createFolloweeResult'
import { Followee } from './types/followee'
import { HealthCheckData } from './types/healthCheck'
import { HealthCheckResult } from './types/healthCheckResult'
import { User } from './types/user'
import { findMissingKey } from './utils/findMissingKey'
import { getUserRecord } from './utils/getUserRecord'
import { systemFields } from './utils/systemFIelds'

const handler = async (
  data: CreateFolloweeData & HealthCheckData,
  context: https.CallableContext
): Promise<CreateFolloweeResult | HealthCheckResult> => {
  if (data.healthCheck) return Date.now()

  const userRecord = await getUserRecord(context)

  if (!userRecord) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey(data, ['followeeId'])

  if (missingArgument) {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(INVALID_ARGUMENT, missingArgument)
    )
  }

  if (userRecord.uid === data.followeeId) {
    throw new https.HttpsError(CANCELLED, CANCELLED)
  }

  const userRef = firestore()
    .collection(USERS)
    .doc(data.followeeId)

  const followeeRef = firestore()
    .collection(USERS)
    .doc(userRecord.uid)
    .collection(FOLLOWEES)
    .doc(data.followeeId)

  // update documents
  return firestore().runTransaction(async t => {
    const userSnap = await t.get(userRef)

    if (!userSnap.exists) {
      throw new https.HttpsError(NOT_FOUND, message(NOT_FOUND, 'user'))
    }

    const user = userSnap.data() as User

    const followee: Followee = {
      ...systemFields(userSnap.id),
      displayName: user.displayName,
      photoURL: user.photoURL
    }

    const followeeSnap = await t.get(followeeRef)

    if (followeeSnap.exists) {
      throw new https.HttpsError(ALREADY_EXISTS, ALREADY_EXISTS, {
        path: `/${USERS}/${userRecord.uid}/${FOLLOWEES}/${userSnap.id}`
      })
    }

    t.set(followeeRef, followee)

    return { followeeId: data.followeeId }
  })
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
