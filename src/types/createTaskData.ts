import { HealthCheckData } from './healthCheck'

export type CreateTaskData = HealthCheckData & {
  dateEnd: number | null
  dateStart: number | null
  description: string | null
  listId: string
  name: string
  photoURLs: string[]
}
