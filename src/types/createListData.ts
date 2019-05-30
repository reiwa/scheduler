import { HealthCheckData } from './healthCheck'

export type CreateListData = HealthCheckData & {
  isPrivate: boolean
  name: string | null
}
