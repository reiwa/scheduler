import { firestore } from 'firebase-admin'
import { https, region } from 'firebase-functions'
import { INVALID_ARGUMENT, NOT_FOUND, UNAUTHENTICATED } from './constants/code'
import { LISTS, TASKS, USERS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { message } from './helpers/message'
import { toOwner } from './helpers/toOwner'
import { CreateTaskData } from './types/createTaskData'
import { CreateTaskResult } from './types/createTaskResult'
import { Task } from './types/task'
import { createId } from './utils/createId'
import { findMissingKey } from './utils/findMissingKey'
import { getUserRecord } from './utils/getUserRecord'
import { systemFields } from './utils/systemFIelds'

const handler = async (
  data: CreateTaskData,
  context: https.CallableContext
): Promise<CreateTaskResult> => {
  if (data.healthCheck) return Date.now()

  const userRecord = await getUserRecord(context)

  if (!userRecord) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey(data, [
    'description',
    'dateStart',
    'dateEnd',
    'name',
    'listId',
    'photoURLs'
  ])

  if (missingArgument) {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(INVALID_ARGUMENT, missingArgument)
    )
  }

  if (data.listId === '') {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(INVALID_ARGUMENT, 'incalid-listId')
    )
  }

  if (!data.name) {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(INVALID_ARGUMENT, 'invalid-name')
    )
  }

  const newTaskId = createId()

  const newTaskRef = firestore()
    .collection(TASKS)
    .doc(newTaskId)

  const listRef = firestore()
    .collection(LISTS)
    .doc(data.listId)

  const ownerRef = firestore()
    .collection(USERS)
    .doc(userRecord.uid)

  const newTask: Task = {
    ...systemFields(newTaskId),
    assigneeId: null,
    assignee: null,
    assigneeRef: null,
    description: data.description || null,
    dateStart: data.dateStart
      ? firestore.Timestamp.fromMillis(data.dateStart)
      : null,
    dateEnd: data.dateEnd ? firestore.Timestamp.fromMillis(data.dateEnd) : null,
    name: data.name,
    isDone: false,
    ownerId: userRecord.uid,
    ownerRef,
    owner: toOwner(userRecord),
    listId: data.listId,
    listRef,
    photoURLs: data.photoURLs,
    tagIds: [],
    tagRefs: [],
    tags: []
  }

  return firestore().runTransaction(async t => {
    const listSnap = await t.get(listRef)

    if (!listSnap.exists) {
      throw new https.HttpsError(NOT_FOUND, NOT_FOUND, {
        path: `${LISTS}/${data.listId}`
      })
    }

    await t.set(newTaskRef, newTask)

    return newTask
  })
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
