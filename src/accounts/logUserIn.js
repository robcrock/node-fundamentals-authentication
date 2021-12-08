import { refreshTokens } from "./user.js"

export async function logUserIn(userId, request, reply) {
  // Create JWT
  // Set Cookie
  const { accessToken } = await refreshTokens(userId, reply)
  return { accessToken }
}
