import { HealthCheckData } from './healthCheck'

export type CreateTaskData = HealthCheckData & {
  dateStart: number | null
  dateEnd: number | null
  isDone: boolean
  projectId: string
  photoURLs: string[]
  text: string | null
  title: string | null
}
