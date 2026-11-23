import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const expenseSchema = z.object({
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
  date: z.string(),
  categoryId: z.string(),
})

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const expenses = await prisma.expense.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(expenses)
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const body = await req.json()
  const parsed = expenseSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Неверные данные' }, { status: 422 })

  // Проверяем, что выбранная категория принадлежит именно этому пользователю
  const category = await prisma.category.findFirst({
    where: { id: parsed.data.categoryId, userId: user.id },
  })
  if (!category) return NextResponse.json({ error: 'Категория не найдена' }, { status: 422 })

  const expense = await prisma.expense.create({
    data: {
      amount: parsed.data.amount,
      description: parsed.data.description,
      date: new Date(parsed.data.date),
      categoryId: parsed.data.categoryId,
      userId: user.id,
    },
  })
  return NextResponse.json(expense, { status: 201 })
}