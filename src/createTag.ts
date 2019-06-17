import { https, region } from 'firebase-functions'
import { INVALID_ARGUMENT, UNAUTHENTICATED } from './constants/code'
import { ASIA_NORTHEAST1 } from './constants/region'
import { CreateTagData } from './types/createTagData'
import { CreateTagResult } from './types/createTagResult'
import { HealthCheckData } from './types/healthCheck'
import { HealthCheckResult } from './types/healthCheckResult'
import { Tag } from './types/tag'
import { createId } from './utils/createId'
import { findMissingKey } from './utils/findMissingKey'
import { getUserRecord } from './utils/getUserRecord'
import { systemFields } from './utils/systemFIelds'

const handler = async (
  data: CreateTagData & HealthCheckData,
  context: https.CallableContext
): Promise<CreateTagResult | HealthCheckResult> => {
  if (data.healthCheck) return Date.now()

  const userRecord = await getUserRecord(context)

  if (!userRecord) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey(data, ['name'])

  if (missingArgument) {
    throw new https.HttpsError(INVALID_ARGUMENT, INVALID_ARGUMENT, {
      missingArgument
    })
  }

  const newTagId = createId()

  const newTag: Tag = {
    ...systemFields(newTagId),
    color: null,
    listId: data.listId,
    name: data.name
  }

  console.log(newTag)

  return { tagId: newTagId }
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
