import { auth } from 'firebase-admin'
import { Owner } from '../types/owner'

export const toOwner = <T>(userRecord: auth.UserRecord): Owner<T> => {
  return {
    displayName: userRecord.displayName || null,
    photoURL: userRecord.photoURL || null,
    uid: userRecord.uid,
    customClaims: (userRecord.customClaims as T) || null
  }
}
