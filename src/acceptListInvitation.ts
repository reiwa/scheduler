import { firestore } from 'firebase-admin'
import { https, region } from 'firebase-functions'
import {
  ALREADY_EXISTS,
  INVALID_ARGUMENT,
  NOT_FOUND,
  UNAUTHENTICATED
} from './constants/code'
import { INVITATIONS, LISTS, USERS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { toOwner } from './helpers/toOwner'
import { AcceptListInvitationData } from './types/acceptListInvitationData'
import { AcceptListInvitationResult } from './types/acceptListInvitationResult'
import { HealthCheckData } from './types/healthCheck'
import { HealthCheckResult } from './types/healthCheckResult'
import { List } from './types/list'
import { findMissingKey } from './utils/findMissingKey'
import { getUserRecord } from './utils/getUserRecord'

const handler = async (
  data: AcceptListInvitationData & HealthCheckData,
  context: https.CallableContext
): Promise<AcceptListInvitationResult | HealthCheckResult> => {
  if (data.healthCheck) return Date.now()

  const userRecord = await getUserRecord(context)

  if (!userRecord) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey(data, ['invitationId', 'listId'])

  if (missingArgument) {
    throw new https.HttpsError(INVALID_ARGUMENT, INVALID_ARGUMENT, {
      missingArgument
    })
  }

  const listRef = firestore()
    .collection(LISTS)
    .doc(data.listId)

  const invitationRef = firestore()
    .collection(LISTS)
    .doc(data.listId)
    .collection(INVITATIONS)
    .doc(data.invitationId)

  return firestore().runTransaction(async t => {
    const listSnap = await t.get(listRef)

    if (!listSnap) {
      throw new https.HttpsError(NOT_FOUND, NOT_FOUND, {
        path: `/${LISTS}/${data.invitationId}`
      })
    }

    const invitationSnap = await t.get(invitationRef)

    if (!invitationSnap) {
      throw new https.HttpsError(NOT_FOUND, NOT_FOUND, {
        path: `/${LISTS}/${data.invitationId}`
      })
    }

    const list = listSnap.data() as List

    if (list.memberIds.includes(userRecord.uid)) {
      throw new https.HttpsError(ALREADY_EXISTS, ALREADY_EXISTS, {})
    }

    await listRef.update({
      memberIds: firestore.FieldValue.arrayUnion(userRecord.uid),
      members: firestore.FieldValue.arrayUnion(toOwner(userRecord)),
      memberRefs: firestore.FieldValue.arrayUnion(
        firestore()
          .collection(USERS)
          .doc(userRecord.uid)
      )
    })

    return { invitationId: data.invitationId }
  })
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
