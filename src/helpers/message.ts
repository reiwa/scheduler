import { https } from 'firebase-functions'
import { ALREADY_EXISTS, INVALID_ARGUMENT, NOT_FOUND } from '../constants/code'

export const message = (code: https.FunctionsErrorCode) => {
  switch (code) {
    case ALREADY_EXISTS: {
      return (name: string) => {
        return `${name} already exists`
      }
    }
    case INVALID_ARGUMENT: {
      return (name: string) => {
        return `${name} not found`
      }
    }
    case NOT_FOUND: {
      return (name: string) => {
        return `${name} not found`
      }
    }
    default: {
      return () => ''
    }
  }
}
