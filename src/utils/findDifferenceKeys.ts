export const findDifferenceKeys = <
  T extends Record<string, any>,
  U extends Record<string, any>
>(
  a: T,
  b: U,
  keys: string[]
) => {
  const differences = []
  for (const key of keys) {
    if (key in a && key in b && a[key] !== b[key]) {
      differences.push(key)
    }
  }
  return differences
}
