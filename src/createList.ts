import { firestore } from 'firebase-admin'
import { https, region } from 'firebase-functions'
import { INVALID_ARGUMENT, UNAUTHENTICATED } from './constants/code'
import { LISTS, USERS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { message } from './helpers/message'
import { toOwner } from './helpers/toOwner'
import { CreateListData } from './types/createListData'
import { CreateListResult } from './types/createListResult'
import { HealthCheckData } from './types/healthCheck'
import { HealthCheckResult } from './types/healthCheckResult'
import { List } from './types/list'
import { createId } from './utils/createId'
import { findMissingKey } from './utils/findMissingKey'
import { getUserRecord } from './utils/getUserRecord'
import { systemFields } from './utils/systemFIelds'

const handler = async (
  data: CreateListData & HealthCheckData,
  context: https.CallableContext
): Promise<CreateListResult | HealthCheckResult> => {
  if (data.healthCheck) return Date.now()

  const userRecord = await getUserRecord(context)

  if (!userRecord) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey(data, [
    'description',
    'isPrivate',
    'name'
  ])

  if (missingArgument) {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(INVALID_ARGUMENT, missingArgument)
    )
  }

  const newListId = createId()

  const newListRef = firestore()
    .collection(LISTS)
    .doc(newListId)

  const ownerRef = firestore()
    .collection(USERS)
    .doc(userRecord.uid)

  const newList: List = {
    ...systemFields(newListId),
    description: data.description || null,
    isArchived: false,
    isPrivate: data.isPrivate,
    memberIds: [userRecord.uid],
    members: [toOwner(userRecord)],
    name: data.name,
    owner: toOwner(userRecord),
    ownerId: userRecord.uid,
    ownerRef
  }

  await newListRef.set(newList)

  return { listId: newListId }
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
