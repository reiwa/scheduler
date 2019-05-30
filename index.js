/* eslint-disable @typescript-eslint/no-var-requires */

Error.stackTraceLimit = 1

const FUNCTION_NAME = process.env.FUNCTION_NAME

if (FUNCTION_NAME) {
  require('source-map-support/register')
  const admin = require('firebase-admin')
  const projectId = process.env.GCLOUD_PROJECT
  const serviceAccount = require(`./service-account.${projectId}.json`)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${projectId}.firebaseio.com`
  })
}

if (!FUNCTION_NAME || FUNCTION_NAME === 'createList') {
  exports.createList = require('./lib/createList')
}

if (!FUNCTION_NAME || FUNCTION_NAME === 'createTag') {
  exports.createTag = require('./lib/createTag')
}

if (!FUNCTION_NAME || FUNCTION_NAME === 'createTask') {
  exports.createTask = require('./lib/createTask')
}

if (!FUNCTION_NAME || FUNCTION_NAME === 'createUser') {
  exports.createUser = require('./lib/createUser')
}

if (!FUNCTION_NAME || FUNCTION_NAME === 'deleteList') {
  exports.deleteList = require('./lib/deleteList')
}

if (!FUNCTION_NAME || FUNCTION_NAME === 'removeTaskTags') {
  exports.removeTaskTags = require('./lib/removeTaskTags')
}

if (!FUNCTION_NAME || FUNCTION_NAME === 'unionTaskTags') {
  exports.unionTaskTags = require('./lib/unionTaskTags')
}

if (!FUNCTION_NAME || FUNCTION_NAME === 'updateList') {
  exports.updateList = require('./lib/updateList')
}

if (!FUNCTION_NAME || FUNCTION_NAME === 'updateTask') {
  exports.updateTask = require('./lib/updateTask')
}
