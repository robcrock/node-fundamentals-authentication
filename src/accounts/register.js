import bcrypt from "bcryptjs"

const { genSalt, hash } = bcrypt

export async function registerUser(email, password) {
  try {
    const { user } = await import("../user/user.js")
    // generate salt
    const salt = await genSalt(10)

    // hash with salt
    const hashedPassword = await hash(password, salt)

    // Store in database
    const result = await user.insertOne({
      email: email,
      password: hashedPassword,
    })
    // Return user from database
    return result.insertedId
  } catch (e) {
    console.log(e)
  }
}
