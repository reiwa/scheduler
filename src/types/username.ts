import { Doc } from './doc'

export type Username = Doc & {
  ownerId: string
  username: string
}
