import { https, region } from 'firebase-functions'
import { UNAUTHENTICATED } from './constants/code'
import { ASIA_NORTHEAST1 } from './constants/region'
import { getUserRecord } from './utils/getUserRecord'

const handler = async (
  data: any,
  context: https.CallableContext
): Promise<any> => {
  if (data.healthCheck) return Date.now()

  const userRecord = await getUserRecord(context)

  if (!userRecord) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  return null
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
