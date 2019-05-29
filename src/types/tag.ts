import { Doc } from './doc'

export type Tag = Doc & {
  count: number
  description: string
  name: string
  type: string
}
