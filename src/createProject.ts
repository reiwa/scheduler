import { firestore } from 'firebase-admin'
import { https, region } from 'firebase-functions'
import { INVALID_ARGUMENT, UNAUTHENTICATED } from './constants/code'
import { PROJECTS, USERS } from './constants/collection'
import { ASIA_NORTHEAST1 } from './constants/region'
import { message } from './helpers/message'
import { CreateProjectData } from './types/createProjectData'
import { Project } from './types/project'
import { createId } from './utils/createId'
import { findMissingKey } from './utils/findMissingKey'
import { getAuthUser } from './utils/getAuthUser'
import { systemFields } from './utils/systemFIelds'

const handler = async (
  data: CreateProjectData,
  context: https.CallableContext
) => {
  if (data.healthCheck) return Date.now()

  const authUser = await getAuthUser(context)

  if (!authUser) {
    throw new https.HttpsError(UNAUTHENTICATED, UNAUTHENTICATED)
  }

  const missingArgument = findMissingKey(data, ['name', 'text'])

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

  const newProject: Project = {
    ...systemFields(newProjectId),
    isArchived: false,
    ownerId: authUser.uid,
    ownerRef: firestore()
      .collection(USERS)
      .doc(authUser.uid),
    owner: authUser,
    text: data.text,
    name: data.name
  }

  return newProjectRef.set(newProject)
}

module.exports = region(ASIA_NORTHEAST1).https.onCall(handler)
