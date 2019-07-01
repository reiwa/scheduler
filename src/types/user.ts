import { Doc } from './doc'

export type User = Doc & {
  displayName: string | null
  followeeCount: number
  followerCount: number
  photoURL: string | null
  username: string
}
