import assert from 'assert'

export const createBatchArray = <T>(array: T[], limit = 500): T[][] => {
  assert(array)
  assert(limit)

  const task: T[][] = []

  array.forEach((b, index) => {
    const n = parseInt((index / limit).toString())
    if (!task[n]) {
      task[n] = []
    }
    task[n].push(b)
  })

  return task
}
