import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function createUser(email: string, name: string) {
  const passwordHash = await bcrypt.hash('demo1234', 10)
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  })

  const categoryNames = ['Еда', 'Транспорт', 'Жильё', 'Развлечения', 'Прочее']
  const categories = await Promise.all(
    categoryNames.map((n) =>
      prisma.category.create({ data: { name: n, userId: user.id } })
    )
  )

  const expensesData = [
    { amount: 450, description: 'Продукты', daysAgo: 1, cat: 0 },
    { amount: 120, description: 'Метро', daysAgo: 1, cat: 1 },
    { amount: 3000, description: 'Аренда', daysAgo: 3, cat: 2 },
    { amount: 800, description: 'Кино', daysAgo: 4, cat: 3 },
    { amount: 250, description: 'Кофе', daysAgo: 5, cat: 0 },
    { amount: 90, description: 'Автобус', daysAgo: 6, cat: 1 },
    { amount: 1200, description: 'Коммуналка', daysAgo: 7, cat: 2 },
    { amount: 600, description: 'Концерт', daysAgo: 8, cat: 3 },
    { amount: 350, description: 'Обед', daysAgo: 9, cat: 0 },
    { amount: 150, description: 'Такси', daysAgo: 10, cat: 1 },
    { amount: 200, description: 'Книга', daysAgo: 11, cat: 4 },
    { amount: 500, description: 'Подарок', daysAgo: 12, cat: 4 },
  ]

  for (const e of expensesData) {
    const date = new Date()
    date.setDate(date.getDate() - e.daysAgo)
    await prisma.expense.create({
      data: {
        amount: e.amount,
        description: e.description,
        date,
        categoryId: categories[e.cat].id,
        userId: user.id,
      },
    })
  }
}

async function main() {
  await prisma.expense.deleteMany()
  await prisma.category.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  await createUser('demo@example.com', 'Демо Пользователь')
  await createUser('demo2@example.com', 'Второй Пользователь')

  console.log('Seed завершён: 2 пользователя, по 5 категорий и 12 расходов')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })