export {}

declare global {
  namespace Express {
    export interface User {
      preferred_username: string,
      roles?: string[]
    }
  }
}
