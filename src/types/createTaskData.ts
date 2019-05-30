import { HealthCheckData } from './healthCheck'

export type CreateTaskData = HealthCheckData & {
  dateStart: number | null
  dateEnd: number | null
  projectId: string
  photoURLs: string[]
  text: string | null
  name: string
}
