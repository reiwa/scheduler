export const findMissingKey = <T>(data: T, keys: string[]) => {
  for (const key of keys) {
    if (key in data) continue
    return key
  }
  return null
}
