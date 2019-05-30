import { Doc } from './doc'

export type Tag = Doc & {
  color: string | null
  listId: string
  name: string
}
