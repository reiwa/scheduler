export const findMissingKey = (data: any, keys: string[]) => {
  for (const key of keys) {
    if (key in data) continue
    return key
  }
  return null
}
