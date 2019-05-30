import { https, region } from 'firebase-functions'
import { INVALID_ARGUMENT, UNAUTHENTICATED } from './constants/code'
import { ASIA_NORTHEAST1 } from './constants/region'
import { message } from './helpers/message'
import { CreateListData } from './types/createListData'
import { CreateTagResult } from './types/createTaskResult'
import { Tag } from './types/tag'
import { createId } from './utils/createId'
import { findMissingKey } from './utils/findMissingKey'
import { getAuthUser } from './utils/getAuthUser'
import { systemFields } from './utils/systemFIelds'

const handler = async (
  data: CreateListData,
  context: https.CallableContext
): Promise<CreateTagResult> => {
  if (data.healthCheck) return Date.now()

  const authUser = await getAuthUser(context)

  if (!authUser) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey(data, ['name'])

  if (missingArgument) {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(INVALID_ARGUMENT, missingArgument)
    )
  }

  const tagId = createId()

  const newTag: Tag = {
    ...systemFields(tagId),
    color: null,
    listId: createId(),
    name: 'fake-name'
  }

  return newTag
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
