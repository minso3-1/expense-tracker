import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
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
  try {
    const user = await getCurrentUser()
    if (!user) {
      console.log('❌ Ошибка: пользователь не авторизован')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await req.json()
    console.log('📥 Получены данные от формы:', body)

    if (!body.amount || !body.date || !body.categoryId) {
      return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 422 })
    }

    // Проверяем, что категория существует и принадлежит этому юзеру
    const category = await prisma.category.findFirst({
      where: { id: body.categoryId, userId: user.id },
    })

    if (!category) {
      console.log('❌ Ошибка: категория не найдена или чужая')
      return NextResponse.json({ error: 'Категория не найдена' }, { status: 422 })
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(body.amount), // На всякий случай переводим в число
        description: body.description || '',
        date: new Date(body.date),
        categoryId: body.categoryId,
        userId: user.id,
      },
    })
    
    console.log('✅ Расход создан:', expense)
    return NextResponse.json(expense, { status: 201 })
    
  } catch (error: any) {
    console.error('🔥 ОШИБКА СЕРВЕРА ПРИ СОЗДАНИИ РАСХОДА:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}