/* eslint-disable @typescript-eslint/no-var-requires */

require('source-map-support/register')

Error.stackTraceLimit = 1

const FUNCTION_NAME = process.env.FUNCTION_NAME

const admin = require('firebase-admin')

const projectId = process.env.GCLOUD_PROJECT

const serviceAccount = require(`./service-account.${projectId}.json`)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${projectId}.firebaseio.com`,
  storageBucket: `${projectId}.appspot.com`
})

if (!FUNCTION_NAME || FUNCTION_NAME === 'acceptListInvitation') {
  exports.acceptListInvitation = require('./lib/acceptListInvitation')
}

if (!FUNCTION_NAME || FUNCTION_NAME === 'createFollowee') {
  exports.createFollowee = require('./lib/createFollowee')
}

if (!FUNCTION_NAME || FUNCTION_NAME === 'createList') {
  exports.createList = require('./lib/createList')
}

if (!FUNCTION_NAME || FUNCTION_NAME === 'createListInvitation') {
  exports.createListInvitation = require('./lib/createListInvitation')
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

if (!FUNCTION_NAME || FUNCTION_NAME === 'onCreateFollowee') {
  exports.onCreateFollowee = require('./lib/onCreateFollowee')
}

if (!FUNCTION_NAME || FUNCTION_NAME === 'onDeleteFollowee') {
  exports.onDeleteFollowee = require('./lib/onDeleteFollowee')
}

if (!FUNCTION_NAME || FUNCTION_NAME === 'onDeleteList') {
  exports.onDeleteList = require('./lib/onDeleteList')
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
