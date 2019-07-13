export type Owner<T> = {
  customClaims: T | null
  displayName: string | null
  photoURL: string | null
  uid: string
}
