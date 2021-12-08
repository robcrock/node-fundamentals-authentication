import "./env.js"
import { fastify } from "fastify"
import fastifyStatic from "fastify-static"
import fastifyCookie from "fastify-cookie"
import path from "path"
import { fileURLToPath } from "url"
import { connectDb } from "./db.js"
import { registerUser } from "./accounts/register.js"
import { authorizeUser } from "./accounts/authorize.js"
import { logUserIn } from "./accounts/logUserIn.js"
import { logUserOut } from "./accounts/logUserOut.js"
import { getAccessToken } from "./accounts/tokens.js"

// ESM specific features
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = fastify()

async function startApp() {
  try {
    app.register(fastifyCookie, {
      secret: process.env.COOKIE_SIGNATURE,
    })

    app.register(fastifyStatic, {
      root: path.join(__dirname, "public"),
    })

    app.post("/api/register", {}, async (request, reply) => {
      try {
        // Return userId stored in our database
        const userId = await registerUser(
          request.body.email,
          request.body.password
        )
        // Log the newly registered user in
        const { accessToken } = await logUserIn(userId, request, reply)
        reply.send({
          data: {
            status: "SUCCESS",
            userId,
            accessToken: accessToken,
          },
        })
      } catch (e) {
        console.error(e)
        reply.send({
          data: {
            status: "FAILED",
            userId,
          },
        })
      }
    })

    app.post("/api/authorize", {}, async (request, reply) => {
      try {
        const { isAuthorized, userId } = await authorizeUser(
          request.body.email,
          request.body.password
        )
        if (isAuthorized) {
          const { accessToken } = await logUserIn(userId, request, reply)
          reply.send({
            data: {
              status: "SUCCESS",
              userId,
              accessToken: accessToken,
            },
          })
        }
      } catch (e) {
        console.error(e)
        reply.send({
          data: {
            status: "FAILED",
            userId,
          },
        })
      }
    })

    app.post("/api/logout", {}, async (request, reply) => {
      try {
        await logUserOut(request, reply)
        reply.send({
          data: {
            status: "SUCCESS",
          },
        })
      } catch (e) {
        console.error(e)
        reply.send({
          data: {
            status: "FAILED",
            userId,
          },
        })
      }
    })

    app.get("/authorizeAccessToken", {}, async (request, reply) => {
      try {
        // Verify user login
        const accessToken = await getAccessToken(request, reply)
        // Return user email, if it exists, otherwise return unauthorized
        if (accessToken) {
          reply.send({
            data: accessToken,
          })
        } else {
          reply.send({
            data: "No Access Token",
          })
        }
      } catch (e) {
        throw new Error(e)
      }
    })

    await app.listen(3000)
    console.log("🚀 Server Listening at port: 3000")
  } catch (e) {
    console.error(e)
  }
}

connectDb().then(() => {
  startApp()
})
