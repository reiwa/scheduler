import { firestore } from 'firebase-admin'
import { https, region } from 'firebase-functions'
import { INVALID_ARGUMENT, UNAUTHENTICATED } from './constants/code'
import { PROJECTS, USERS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { message } from './helpers/message'
import { CreateListData } from './types/createListData'
import { CreateListResult } from './types/createListResult'
import { List } from './types/list'
import { createId } from './utils/createId'
import { findMissingKey } from './utils/findMissingKey'
import { getAuthUser } from './utils/getAuthUser'
import { systemFields } from './utils/systemFIelds'

const handler = async (
  data: CreateListData,
  context: https.CallableContext
): Promise<CreateListResult> => {
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

  const newProjectId = createId()

  const newProjectRef = firestore()
    .collection(PROJECTS)
    .doc(newProjectId)

  const newProject: List = {
    ...systemFields(newProjectId),
    isArchived: false,
    isPrivate: data.isPrivate,
    ownerId: authUser.uid,
    ownerRef: firestore()
      .collection(USERS)
      .doc(authUser.uid),
    owner: authUser,
    name: data.name
  }

  await newProjectRef.set(newProject)

  return newProject
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
