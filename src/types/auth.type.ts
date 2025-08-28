import type { User } from './user.type'

export type LoginPayload = { email: string; password: string }
export type LoginResponse = {
  accessToken: string
  refreshToken: string
  user: User
}
