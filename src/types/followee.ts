import { Doc } from './doc'

export type Followee = Doc & {
  photoURL: string | null
  displayName: string | null
}
