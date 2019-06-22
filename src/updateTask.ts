import { auth, firestore } from 'firebase-admin'
import { https, region } from 'firebase-functions'
import { INVALID_ARGUMENT, NOT_FOUND, UNAUTHENTICATED } from './constants/code'
import { LISTS, TASKS, USERS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { message } from './helpers/message'
import { toOwner } from './helpers/toOwner'
import { HealthCheckData } from './types/healthCheck'
import { HealthCheckResult } from './types/healthCheckResult'
import { Task } from './types/task'
import { UpdateTaskData } from './types/updateTaskData'
import { UpdateTaskResult } from './types/updateTaskResult'
import { findMissingKey } from './utils/findMissingKey'
import { getAuthUser } from './utils/getAuthUser'
import { systemChangeFields } from './utils/systemChangeFIelds'

const handler = async (
  data: UpdateTaskData & HealthCheckData,
  context: https.CallableContext
): Promise<UpdateTaskResult | HealthCheckResult> => {
  if (data.healthCheck) return Date.now()

  const authUser = await getAuthUser(context)

  if (!authUser) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey<UpdateTaskData>(data, ['taskId'])

  if (missingArgument) {
    throw new https.HttpsError(
      INVALID_ARGUMENT,
      message(INVALID_ARGUMENT, missingArgument),
      { arguments: missingArgument }
    )
  }

  const taskChange: Partial<Task> = systemChangeFields()

  if (typeof data.assigneeId !== 'undefined') {
    const assigneeRecord = await auth().getUser(data.assigneeId)
    if (!assigneeRecord) {
      throw new https.HttpsError(NOT_FOUND, message(NOT_FOUND, 'assignee'), {
        uid: data.assigneeId
      })
    }
    taskChange.assignee = toOwner(assigneeRecord)
    taskChange.assigneeId = data.assigneeId
    taskChange.assigneeRef = firestore()
      .collection(USERS)
      .doc(data.assigneeId)
  }

  if (typeof data.dateEnd !== 'undefined') {
    taskChange.dateEnd = firestore.Timestamp.fromMillis(data.dateEnd)
  }

  if (typeof data.dateStart !== 'undefined') {
    taskChange.dateStart = firestore.Timestamp.fromMillis(data.dateStart)
  }

  if (typeof data.description !== 'undefined') {
    taskChange.description = data.description
  }

  if (typeof data.isDone !== 'undefined') {
    taskChange.isDone = data.isDone
  }

  if (typeof data.listId !== 'undefined') {
    taskChange.listId = data.listId
    taskChange.listRef = firestore()
      .collection(LISTS)
      .doc(data.listId)
  }

  if (typeof data.name !== 'undefined') {
    taskChange.name = data.name
  }

  if (typeof data.ownerId !== 'undefined') {
    const ownerRecord = await auth().getUser(data.ownerId)
    if (!ownerRecord) {
      throw new https.HttpsError(NOT_FOUND, message(NOT_FOUND, 'owner'), {
        uid: data.ownerId
      })
    }
    taskChange.owner = toOwner(ownerRecord)
    taskChange.ownerId = data.ownerId
    taskChange.ownerRef = firestore()
      .collection(USERS)
      .doc(data.ownerId)
  }

  await firestore()
    .collection(TASKS)
    .doc(data.taskId)
    .update(taskChange)

  return { taskId: data.taskId }
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
