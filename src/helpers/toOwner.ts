import { auth } from 'firebase-admin'
import { Owner } from '../types/owner'

export const toOwner = (userRecord: auth.UserRecord): Owner => {
  return {
    displayName: userRecord.displayName || null,
    photoURL: userRecord.photoURL || null,
    uid: userRecord.uid
  }
}
