import { HealthCheckData } from './healthCheck'

export type UpdateTaskData = HealthCheckData & {
  name: string
}
