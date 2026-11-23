import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Неверные данные' }, { status: 422 })

    const { email, password, name } = parsed.data
    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        categories: { create: [{ name: 'Прочее' }] },
      },
    })
    return NextResponse.json({ id: user.id }, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Email уже занят' }, { status: 409 })
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}