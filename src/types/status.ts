import { Doc } from './doc'

export type Status = Doc & {
  entityHashtagTexts: string[]
  favoriteCount: number
  retweetCount: number
  text: string
  userId: string
  userName: string
  userScreenName: string
  userProfileImageUrl: string
  userProtected: boolean
}
