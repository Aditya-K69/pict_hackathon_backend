import bcrypt from 'bcryptjs'
import { usersTable } from '../database/schema.ts'
import { pinResetTable } from '../database/schema.ts'
import { eq , and , isNull, desc,gt} from 'drizzle-orm'


const genOTP = ()=>{
  return Math.floor(100000 + Math.random() * 900000).toString();
}


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


export async function forgotPIN(request, reply) {
  try {
    const { email } = request.body;

    // Always respond success (prevent user enumeration)
    const user = await request.server.dbConnection
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (user.length === 0) {
      return reply.send({
        message: "If the account exists, an OTP has been sent",
      });
    }

    const otp = genOTP(); // e.g. "482913"
    const otpHash = await bcrypt.hash(otp, 10);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Invalidate previous unused OTPs
    await request.server.dbConnection
      .update(pinResetTable)
      .set({ used_at: new Date() })
      .where(
        and(
          eq(pinResetTable.user_id, user[0].id),
          isNull(pinResetTable.used_at)
        )
      );

    // Insert new OTP
    await request.server.dbConnection.insert(pinResetTable).values({
      user_id: user[0].id,
      token_hash: otpHash,
      expires_at: expiresAt,
    });

    // TODO: send OTP via email/SMS
    console.log("OTP (dev only):", otp);

    return reply.send({
      message: `If the account exists, an OTP has been sent ${otp}`,
    });
  } catch (err) {
    return reply.code(500).send({
      error: "internal_server_error",
      message: err
    });
  }
}

export async function authOTP(request, reply) {
  try {
    const { email, otp } = request.body;

    if (!email || !otp) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    // 1. Fetch user
    const users = await request.server.dbConnection
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (users.length === 0) {
      return reply.code(401).send({ message: "Invalid OTP" });
    }

    const user = users[0];

    // 2. Fetch latest valid OTP
    const resetPINs = await request.server.dbConnection
      .select()
      .from(pinResetTable)
      .where(
        and(
          eq(pinResetTable.user_id, user.id),
          isNull(pinResetTable.used_at),
          gt(pinResetTable.expires_at, new Date())
        )
      )
      .orderBy(desc(pinResetTable.created_at))
      .limit(1);

    if (resetPINs.length === 0) {
      return reply.code(401).send({ message: "Invalid or expired OTP" });
    }

    const resetPIN = resetPINs[0];

    // 3. Compare OTP correctly
    const validOTP = await bcrypt.compare(otp, resetPIN.token_hash);

    if (!validOTP) {
      return reply.code(401).send({
        message: "You have entered the wrong OTP",
      });
    }

    // 4. Mark OTP as used (single-use enforcement)
    await request.server.dbConnection
      .update(pinResetTable)
      .set({ used_at: new Date() })
      .where(eq(pinResetTable.id, resetPIN.id));

    // 5. Issue short-lived reset token
    const resetToken = request.server.jwt.sign(
      { userId: user.id, purpose: "reset_pin" },
      { expiresIn: "10m" }
    );

    return reply.send({
      reset_token: resetToken,
    });

  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({
      error: "internal_server_error",
    });
  }
}


export async function resetPIN(request, reply) {
  try {
    const { reset_token, new_pin } = request.body;

    if (!reset_token || !new_pin) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    let payload;
    try {
      payload = request.server.jwt.verify(reset_token);
    } catch {
      return reply.code(401).send({ error: "invalid_or_expired_token" });
    }

    if (payload.purpose !== "reset_pin") {
      return reply.code(403).send({ error: "invalid_token_scope" });
    }


    const pinHash = await bcrypt.hash(new_pin, 12);

    await request.server.dbConnection
      .update(usersTable)
      .set({ pin_hash: pinHash })
      .where(eq(usersTable.id, payload.userId));

    // Invalidate all reset tokens for safety
    await request.server.dbConnection
      .delete(pinResetTable)
      .where(eq(pinResetTable.user_id, payload.userId));

    return reply.send({ message: "PIN reset successful" });

  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ error: "internal_server_error" });
  }
}