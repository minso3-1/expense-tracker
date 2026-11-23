import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSession, verifyPassword } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({ email: z.string().email(), password: z.string() })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Неверные данные' }, { status: 422 })

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
  }

  await createSession(user.id)
  return NextResponse.json({ id: user.id })
}