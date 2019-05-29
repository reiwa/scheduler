import { firestore } from 'firebase-admin'
import { https, region } from 'firebase-functions'
import { INVALID_ARGUMENT, NOT_FOUND, UNAUTHENTICATED } from './constants/code'
import { USERS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { message } from './helpers/message'
import { User } from './types/user'
import { findMissingKey } from './utils/findMissingKey'
import { getAuthUser } from './utils/getAuthUser'
import { systemFields } from './utils/systemFIelds'

const handler = async (data: any, context: https.CallableContext) => {
  if (data.healthCheck) return Date.now()

  const authUser = await getAuthUser(context)

  if (!authUser) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey(data, ['photoURL', 'username'])

  if (missingArgument) {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(INVALID_ARGUMENT)(missingArgument)
    )
  }

  const userId = authUser.uid

  const userRef = firestore()
    .collection(USERS)
    .doc(userId)

  const userSnap = await userRef.get()

  if (userSnap.exists) {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(NOT_FOUND)('user snapshot')
    )
  }

  const newUser: User = {
    ...systemFields(userId),
    displayName: authUser.displayName,
    photoURL: data.photoURL,
    username: data.username
  }

  return userRef.set(newUser)
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
