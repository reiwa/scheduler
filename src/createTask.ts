import { firestore } from 'firebase-admin'
import { https, region } from 'firebase-functions'
import { INVALID_ARGUMENT, NOT_FOUND, UNAUTHENTICATED } from './constants/code'
import { PROJECTS, TASKS, USERS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { message } from './helpers/message'
import { CreateTaskData } from './types/createTaskData'
import { CreateTaskResult } from './types/createTaskResult'
import { Task } from './types/task'
import { createId } from './utils/createId'
import { findMissingKey } from './utils/findMissingKey'
import { getAuthUser } from './utils/getAuthUser'
import { systemFields } from './utils/systemFIelds'

const handler = async (
  data: CreateTaskData,
  context: https.CallableContext
): Promise<CreateTaskResult> => {
  if (data.healthCheck) return Date.now()

  const authUser = await getAuthUser(context)

  if (!authUser) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey(data, [
    'dateStart',
    'dateEnd',
    'projectId',
    'photoURLs',
    'text',
    'title'
  ])

  if (missingArgument) {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(INVALID_ARGUMENT, missingArgument)
    )
  }

  const newTaskId = createId()

  const newTaskRef = firestore()
    .collection(TASKS)
    .doc(newTaskId)

  const newTask: Task = {
    ...systemFields(newTaskId),
    dateStart: data.dateStart
      ? firestore.Timestamp.fromMillis(data.dateStart)
      : null,
    dateEnd: data.dateEnd ? firestore.Timestamp.fromMillis(data.dateEnd) : null,
    isDone: false,
    ownerId: authUser.uid,
    ownerRef: firestore()
      .collection(USERS)
      .doc(authUser.uid),
    owner: authUser,
    projectId: data.projectId,
    projectRef: firestore()
      .collection(PROJECTS)
      .doc(data.projectId),
    photoURLs: data.photoURLs,
    text: data.text,
    title: data.title
  }

  const projectRef = firestore()
    .collection(PROJECTS)
    .doc(data.projectId)

  return firestore().runTransaction(async t => {
    const projectSnap = await t.get(projectRef)

    if (!projectSnap.exists) {
      throw new https.HttpsError(NOT_FOUND, message(NOT_FOUND, 'project'))
    }

    await t.set(newTaskRef, newTask)

    return newTask
  })
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
