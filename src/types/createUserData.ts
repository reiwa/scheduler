import { HealthCheckData } from './healthCheck'

export type CreateUserData = HealthCheckData & {
  photoURL: string
  username: string
}
