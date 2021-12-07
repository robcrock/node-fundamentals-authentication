import jwt from "jsonwebtoken"

const JWTSignature = process.env.JWT_SIGNATURE
const CONNECTED_APP_SECRET = process.env.CONNECTED_APP_SECRET_VALUE

export async function logUserOut(request, reply) {
  try {
    const { session } = await import("../session/session.js")

    if (request?.cookies?.refreshToken) {
      const { refreshToken } = request.cookies
      // Decode refresh token
      const { sessionToken } = jwt.verify(refreshToken, CONNECTED_APP_SECRET)
      // Delete database record for session
      await session.deleteOne({ sessionToken })
    }
    // Remove Cookies
    reply.clearCookie("refreshToken").clearCookie("accessToken")
  } catch (e) {
    console.error(e)
  }
}
