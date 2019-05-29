import { Doc } from './doc'

export type User = Doc & {
  displayName: string
  photoURL: string | null
  username: string
}
