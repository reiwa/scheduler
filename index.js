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

if (!FUNCTION_NAME || FUNCTION_NAME === 'createUser') {
  exports.createUser = require('./lib/createUser')
}
