import { firestore } from 'firebase-admin'
import { https, region } from 'firebase-functions'
import {
  ALREADY_EXISTS,
  INVALID_ARGUMENT,
  UNAUTHENTICATED
} from './constants/code'
import { USERS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { message } from './helpers/message'
import { toOwner } from './helpers/toOwner'
import { CreateUserData } from './types/createUserData'
import { CreateUserResult } from './types/createUserResult'
import { HealthCheckData } from './types/healthCheck'
import { HealthCheckResult } from './types/healthCheckResult'
import { User } from './types/user'
import { findMissingKey } from './utils/findMissingKey'
import { getUserRecord } from './utils/getUserRecord'
import { systemFields } from './utils/systemFIelds'

const handler = async (
  data: CreateUserData & HealthCheckData,
  context: https.CallableContext
): Promise<CreateUserResult | HealthCheckResult> => {
  if (data.healthCheck) return Date.now()

  const userRecord = await getUserRecord(context)

  if (!userRecord) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey(data, ['photoURL', 'username'])

  if (missingArgument) {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(INVALID_ARGUMENT, missingArgument)
    )
  }

  const userId = userRecord.uid

  const userRef = firestore()
    .collection(USERS)
    .doc(userId)

  const userSnap = await userRef.get()

  if (userSnap.exists) {
    throw new https.HttpsError(ALREADY_EXISTS, message(ALREADY_EXISTS, 'user'))
  }

  const newUser: User = {
    ...systemFields(userId),
    displayName: toOwner(userRecord).displayName,
    photoURL: data.photoURL,
    username: data.username
  }

  const usersRef = firestore()
    .collection(USERS)
    .where('username', '==', data.username)
    .limit(1)

  return firestore().runTransaction(async t => {
    const usersQuerySnap = await t.get(usersRef)

    if (!usersQuerySnap.empty) {
      throw new https.HttpsError(ALREADY_EXISTS, ALREADY_EXISTS)
    }

    await t.set(userRef, newUser)

    return { userId }
  })
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
