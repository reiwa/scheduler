import { auth } from 'firebase-admin'
import { CustomClaims } from '../types/customClaims'
import { Owner } from '../types/owner'

export const toOwner = (userRecord: auth.UserRecord): Owner<CustomClaims> => {
  return {
    displayName: userRecord.displayName || null,
    photoURL: userRecord.photoURL || null,
    uid: userRecord.uid,
    customClaims: userRecord.customClaims as CustomClaims
  }
}
