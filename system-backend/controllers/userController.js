import bcrypt from 'bcryptjs'
import { usersTable } from '../database/schema.ts'
import { eq } from 'drizzle-orm'

export async function registerUser(request, reply) {
  const { name, phone_number, email, pin } = request.body


  const pin_hash = await bcrypt.hash(pin, 12)

  await request.server.dbConnection.insert(usersTable).values({
    name,
    phone_number,
    email,
    pin_hash
  })

  return reply.code(201).send({ success: true })
}

export async function loginUser(request, reply) {
  const { phone_number, pin } = request.body

  const users = await request.server.dbConnection
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone_number, phone_number))
    .limit(1)

  
  if (users.length === 0) {
    return reply.code(401).send({ error: 'Invalid credentials' })
  }

  const user = users[0]

  
  const validPin = await bcrypt.compare(pin, user.pin_hash)

  if (!validPin) {
    return reply.code(401).send({ error: 'Invalid credentials' })
  }

  
  const token = request.server.jwt.sign(
    { sub: user.id },
    { expiresIn: process.env.JWT_EXPIRY }
  )

  
  return reply.code(200).send({
    access_token: token
  })
}
