import { https, region } from 'firebase-functions'
import { UNAUTHENTICATED } from './constants/code'
import { ASIA_NORTHEAST1 } from './constants/region'
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

  return null
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
