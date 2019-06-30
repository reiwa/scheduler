import { auth, firestore } from 'firebase-admin'
import { https, region } from 'firebase-functions'
import { INVALID_ARGUMENT, NOT_FOUND, UNAUTHENTICATED } from './constants/code'
import { LISTS, USERS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { message } from './helpers/message'
import { toOwner } from './helpers/toOwner'
import { CustomClaims } from './types/customClaims'
import { HealthCheckData } from './types/healthCheck'
import { HealthCheckResult } from './types/healthCheckResult'
import { List } from './types/list'
import { Owner } from './types/owner'
import { UpdateListData } from './types/updateListData'
import { UpdateListResult } from './types/updateListResult'
import { findMissingKey } from './utils/findMissingKey'
import { getAuthUser } from './utils/getAuthUser'
import { systemChangeFields } from './utils/systemChangeFIelds'

const handler = async (
  data: UpdateListData & HealthCheckData,
  context: https.CallableContext
): Promise<UpdateListResult | HealthCheckResult> => {
  if (data.healthCheck) return Date.now()

  const authUser = await getAuthUser(context)

  if (!authUser) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey<UpdateListData>(data, ['listId'])

  if (missingArgument) {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(INVALID_ARGUMENT, missingArgument),
      { arguments: missingArgument }
    )
  }

  const listChange: Partial<List> = systemChangeFields()

  if (typeof data.description !== 'undefined') {
    listChange.description = data.description
  }

  if (typeof data.isArchived !== 'undefined') {
    listChange.isArchived = data.isArchived
  }

  if (typeof data.isPrivate !== 'undefined') {
    listChange.isPrivate = data.isPrivate
  }

  if (typeof data.memberIds !== 'undefined') {
    const members: Owner<CustomClaims>[] = []
    for (const memberId of data.memberIds) {
      const memberRecord = await auth().getUser(memberId)
      if (!memberRecord) {
        throw new https.HttpsError(NOT_FOUND, message(NOT_FOUND, 'member'), {
          uid: memberId
        })
      }
      const member = toOwner<CustomClaims>(memberRecord)
      members.push(member)
    }
    listChange.members = members
    listChange.memberIds = data.memberIds
    listChange.memberRefs = data.memberIds.map(memberId => {
      return firestore()
        .collection(USERS)
        .doc(memberId)
    })
  }

  if (typeof data.name !== 'undefined') {
    listChange.name = data.name
  }

  if (typeof data.ownerId !== 'undefined') {
    const ownerRecord = await auth().getUser(data.ownerId)
    if (!ownerRecord) {
      throw new https.HttpsError(NOT_FOUND, message(NOT_FOUND, 'owner'), {
        uid: ownerRecord
      })
    }
    const owner = toOwner<CustomClaims>(ownerRecord)
    listChange.owner = owner
    listChange.ownerId = data.ownerId
    listChange.ownerRef = firestore()
      .collection(USERS)
      .doc(data.ownerId)
  }

  await firestore()
    .collection(LISTS)
    .doc(data.listId)
    .update(listChange)

  return { listId: data.listId }
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
