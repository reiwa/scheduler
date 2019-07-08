import { CustomClaims } from './customClaims'
import { Doc } from './doc'
import { Owner } from './owner'

export type Followee = Doc & {
  photoURL: string | null
  displayName: string | null
  username: string
  ownerId: string
  owner: Owner<CustomClaims>
}
