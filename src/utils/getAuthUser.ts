import { https } from 'firebase-functions'
import { Owner } from '../types/owner'

export const getAuthUser = (context: https.CallableContext): Owner | null => {
  if (typeof context.auth === 'undefined') return null

  return {
    displayName: context.auth.token.name || null,
    photoURL: context.auth.token.picture || null,
    uid: context.auth.uid
  }
}
