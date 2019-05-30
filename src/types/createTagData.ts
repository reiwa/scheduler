import { HealthCheckData } from './healthCheck'

export type CreateTagData = HealthCheckData & {
  color: string
  listId: string
  name: string
}
