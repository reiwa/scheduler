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
import { CreateUserData } from './types/createUserData'
import { CreateUserResult } from './types/createUserResult'
import { User } from './types/user'
import { findMissingKey } from './utils/findMissingKey'
import { getAuthUser } from './utils/getAuthUser'
import { systemFields } from './utils/systemFIelds'

const handler = async (
  data: CreateUserData,
  context: https.CallableContext
): Promise<CreateUserResult> => {
  if (data.healthCheck) return Date.now()

  const authUser = await getAuthUser(context)

  if (!authUser) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey(data, ['photoURL', 'username'])

  if (missingArgument) {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(INVALID_ARGUMENT, missingArgument)
    )
  }

  const userId = authUser.uid

  const userRef = firestore()
    .collection(USERS)
    .doc(userId)

  const userSnap = await userRef.get()

  if (userSnap.exists) {
    throw new https.HttpsError(ALREADY_EXISTS, message(ALREADY_EXISTS, 'user'))
  }

  const newUser: User = {
    ...systemFields(userId),
    displayName: authUser.displayName,
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
      throw new https.HttpsError(
        ALREADY_EXISTS,
        message(ALREADY_EXISTS, 'username')
      )
    }

    await t.set(userRef, newUser)

    return newUser
  })
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
