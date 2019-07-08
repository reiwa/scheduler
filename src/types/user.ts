import { Doc } from './doc'

export type User = Doc & {
  description: string
  displayName: string | null
  followeeCount: number
  followerCount: number
  photoURL: string | null
  username: string
}
