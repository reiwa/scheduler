import { HealthCheckData } from './healthCheck'

export type CreateProjectData = HealthCheckData & {
  name: string | null
  text: string | null
}
