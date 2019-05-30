import { https, region } from 'firebase-functions'
import { INVALID_ARGUMENT, UNAUTHENTICATED } from './constants/code'
import { ASIA_NORTHEAST1 } from './constants/region'
import { message } from './helpers/message'
import { findMissingKey } from './utils/findMissingKey'
import { getAuthUser } from './utils/getAuthUser'

const handler = async (
  data: any,
  context: https.CallableContext
): Promise<any> => {
  if (data.healthCheck) return Date.now()

  const authUser = await getAuthUser(context)

  if (!authUser) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey(data, ['taskId'])

  if (missingArgument) {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(INVALID_ARGUMENT, missingArgument)
    )
  }

  return null
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
