import { auth, firestore } from 'firebase-admin'
import { https, region } from 'firebase-functions'
import {
  ALREADY_EXISTS,
  INVALID_ARGUMENT,
  UNAUTHENTICATED
} from './constants/code'
import { USERNAMES, USERS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { message } from './helpers/message'
import { HealthCheckData } from './types/healthCheck'
import { HealthCheckResult } from './types/healthCheckResult'
import { UpdateUsernameData } from './types/updateUsernameData'
import { UpdateUsernameResult } from './types/updateUsernameResult'
import { User } from './types/user'
import { Username } from './types/username'
import { findMissingKey } from './utils/findMissingKey'
import { getUserRecord } from './utils/getUserRecord'
import { systemFields } from './utils/systemFIelds'

const handler = async (
  data: UpdateUsernameData & HealthCheckData,
  context: https.CallableContext
): Promise<UpdateUsernameResult | HealthCheckResult> => {
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

  // allow a-z and A-z and 0-9 and '_' and '-'
  if (data.username.match(/^[a-zA-Z0-9_\-.]{3,15}$/) === null) {
    throw new https.HttpsError(INVALID_ARGUMENT, INVALID_ARGUMENT)
  }

  data.username = data.username.toLocaleLowerCase()

  const userId = userRecord.uid

  const userRef = firestore()
    .collection(USERS)
    .doc(userId)

  const usernameRef = firestore()
    .collection(USERNAMES)
    .doc(data.username)

  const newUsername: Username = {
    ...systemFields(data.username),
    username: data.username,
    ownerId: userId
  }

  const userChange: Partial<User> = { username: data.username }

  await firestore().runTransaction(async t => {
    const userSnap = await t.get(userRef)

    if (userSnap.exists) {
      throw new https.HttpsError(ALREADY_EXISTS, ALREADY_EXISTS, {
        path: `/users/${userId}`
      })
    }

    const usernameSnap = await t.get(usernameRef)

    if (usernameSnap.exists) {
      throw new https.HttpsError(ALREADY_EXISTS, ALREADY_EXISTS, {
        path: `/usernames/${data.username}`
      })
    }

    const user = userSnap.data() as User

    t.set(usernameRef, newUsername)

    if (user.username) {
      const lastUsernameRef = firestore()
        .collection(USERNAMES)
        .doc(user.username)

      t.delete(lastUsernameRef)
    }

    t.update(userRef, userChange)
  })

  await auth().setCustomUserClaims(userId, {
    username: data.username
  })

  return { userId }
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
