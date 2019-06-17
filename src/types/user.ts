import { Doc } from './doc'

export type User = Doc & {
  displayName: string | null
  photoURL: string | null
  username: string
}
