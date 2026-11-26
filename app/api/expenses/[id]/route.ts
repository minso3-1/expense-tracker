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

// Вспомогательная функция для проверки, что запись принадлежит пользователю
async function findOwn(id: string, userId: string) {
  return prisma.expense.findFirst({ where: { id, userId } })
}

// GET: получить один расход
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  
  const { id } = await params
  const expense = await prisma.expense.findFirst({
    where: { id, userId: user.id },
    include: { category: true },
  })
  
  if (!expense) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
  return NextResponse.json(expense)
}

// PATCH: обновить расход
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  
  const { id } = await params
  const own = await findOwn(id, user.id)
  if (!own) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })

  const body = await req.json()
  const parsed = expenseSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Неверные данные' }, { status: 422 })

  const category = await prisma.category.findFirst({
    where: { id: parsed.data.categoryId, userId: user.id },
  })
  if (!category) return NextResponse.json({ error: 'Категория не найдена' }, { status: 422 })

  const updated = await prisma.expense.update({
    where: { id },
    data: {
      amount: parsed.data.amount,
      description: parsed.data.description,
      date: new Date(parsed.data.date),
      categoryId: parsed.data.categoryId,
    },
  })
  return NextResponse.json(updated)
}

// DELETE: удалить расход
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  
  const { id } = await params
  const own = await findOwn(id, user.id)
  if (!own) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })

  await prisma.expense.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}