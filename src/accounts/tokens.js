import jwt from "jsonwebtoken"
import { randomBytes } from "crypto"

const JWTSignature = process.env.JWT_SIGNATURE
const CLIENT_ID = process.env.CONNECTED_APP_SECRET_ID
const ISSUER = process.env.CONNECTED_APP_ID
const CONNECTED_APP_SECRET = process.env.CONNECTED_APP_SECRET_VALUE

export async function createTokens(sessionToken, userId) {
  try {
    // Create Refresh Token
    // Session Id
    const refreshToken = jwt.sign(
      {
        sessionToken,
      },
      CONNECTED_APP_SECRET
    )
    // Create Access Token
    // Session Id, User Id
    const jwtOptions = {
      expiresIn: "10m",
      header: {
        kid: CLIENT_ID,
        iss: ISSUER,
      },
    }

    const tableauPayload = {
      jti: randomBytes(64).toString("hex"),
      iss: ISSUER,
      aud: "tableau",
      sub: "robert@vizsimply.com",
      scope: ["tableau:views:embed"],
    }

    const accessToken = jwt.sign(
      {
        sessionToken,
        userId,
        ...tableauPayload,
      },
      CONNECTED_APP_SECRET,
      jwtOptions
    )

    // Return Refresh Token & Access Token
    return { accessToken, refreshToken }
  } catch (e) {
    console.error(e)
  }
}

export async function getAccessToken(request, reply) {
  try {
    // Check to make sure access token exists
    if (request?.cookies?.accessToken) {
      const { accessToken } = request.cookies
      return accessToken
    }
  } catch (e) {
    console.error(e)
  }
}
