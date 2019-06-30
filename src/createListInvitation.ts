import { firestore } from 'firebase-admin'
import { https, region } from 'firebase-functions'
import {
  INVALID_ARGUMENT,
  PERMISSION_DENIED,
  UNAUTHENTICATED
} from './constants/code'
import { INVITATIONS, LISTS, USERS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { message } from './helpers/message'
import { CreateListInvitationData } from './types/createListInvitationData'
import { CreateListInvitationResult } from './types/createListInvitationResult'
import { HealthCheckData } from './types/healthCheck'
import { HealthCheckResult } from './types/healthCheckResult'
import { Invitation } from './types/invitation'
import { List } from './types/list'
import { createId } from './utils/createId'
import { findMissingKey } from './utils/findMissingKey'
import { getUserRecord } from './utils/getUserRecord'
import { systemFields } from './utils/systemFIelds'

const handler = async (
  data: CreateListInvitationData & HealthCheckData,
  context: https.CallableContext
): Promise<CreateListInvitationResult | HealthCheckResult> => {
  if (data.healthCheck) return Date.now()

  const userRecord = await getUserRecord(context)

  if (!userRecord) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey(data, ['listId', 'type'])

  if (missingArgument) {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(INVALID_ARGUMENT, missingArgument)
    )
  }

  const listRef = firestore()
    .collection(LISTS)
    .doc(data.listId)

  const listSnap = await listRef.get()

  const list = listSnap.data() as List

  if (!list.memberIds.includes(userRecord.uid)) {
    throw new https.HttpsError(
      PERMISSION_DENIED,
      message(PERMISSION_DENIED, `lists/${data.listId}`),
      { collection: LISTS, docId: data.listId }
    )
  }

  const newInvitationId = createId()

  const newInvitationRef = firestore()
    .collection(LISTS)
    .doc(data.listId)
    .collection(INVITATIONS)
    .doc(newInvitationId)

  const newInvitation: Invitation = {
    ...systemFields(newInvitationId),
    listId: data.listId,
    ownerId: userRecord.uid,
    ownerRef: firestore()
      .collection(USERS)
      .doc(userRecord.uid),
    type: data.type
  }

  await newInvitationRef.set(newInvitation)

  return { invitationId: newInvitationId }
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
