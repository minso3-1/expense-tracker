
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Получить список категорий текущего пользователя
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(categories)
}

// Создать новую категорию
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  try {
    const body = await req.json()
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Введите название категории' }, { status: 422 })
    }

    // Создаем категорию, привязывая её к текущему пользователю
    const category = await prisma.category.create({
      data: { 
        name: body.name.trim(), 
        userId: user.id 
      },
    })
    
    return NextResponse.json(category, { status: 201 })
  } catch (err: any) {
    // Код P2002 означает, что категория с таким названием уже есть у этого пользователя
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Такая категория уже есть' }, { status: 409 })
    }
    
    console.error('Ошибка при создании категории:', err)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}