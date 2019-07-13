import { firestore } from 'firebase-admin'
import { https, region } from 'firebase-functions'
import { INVALID_ARGUMENT, UNAUTHENTICATED } from './constants/code'
import { USERS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { message } from './helpers/message'
import { HealthCheckData } from './types/healthCheck'
import { HealthCheckResult } from './types/healthCheckResult'
import { UpdateUserData } from './types/updateUserData'
import { UpdateUserResult } from './types/updateUserResult'
import { User } from './types/user'
import { findMissingKey } from './utils/findMissingKey'
import { getUserRecord } from './utils/getUserRecord'
import { systemChangeFields } from './utils/systemChangeFIelds'

const handler = async (
  data: UpdateUserData & HealthCheckData,
  context: https.CallableContext
): Promise<UpdateUserResult | HealthCheckResult> => {
  if (data.healthCheck) return Date.now()

  const userRecord = await getUserRecord(context)

  if (!userRecord) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey<UpdateUserData>(data, ['userId'])

  if (missingArgument) {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(INVALID_ARGUMENT, missingArgument),
      { arguments: missingArgument }
    )
  }

  const change: Partial<User> = systemChangeFields()

  if (typeof data.displayName !== 'undefined') {
    change.displayName = data.displayName
  }

  if (typeof data.photoURL !== 'undefined') {
    change.photoURL = data.photoURL
  }

  if (typeof data.description !== 'undefined') {
    change.description = data.description
  }

  await firestore()
    .collection(USERS)
    .doc(data.userId)
    .update(change)

  return { userId: data.userId }
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
