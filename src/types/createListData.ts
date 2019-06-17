import { HealthCheckData } from './healthCheck'

export type CreateListData = HealthCheckData & {
  description: string | null
  isPrivate: boolean
  name: string
}
