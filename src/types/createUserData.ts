import { HealthCheckData } from './healthCheck'

export type CreateUserData = HealthCheckData & {
  displayName: string
}
