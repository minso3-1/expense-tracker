import { Suspense } from 'react'
import { io } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import DeleteExpenseButton from '@/components/DeleteExpenseButton'

async function DashboardContent() {
  await io() // Говорим Next.js рендерить динамически

  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const expenses = await prisma.expense.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: 'desc' },
  })

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2 text-gray-900">Привет, {user.name || user.email}</h1>
      <p className="text-gray-700 font-medium mb-6 text-lg">Всего расходов: {total.toFixed(2)} ₽</p>

      <div className="flex justify-between items-center mb-6">
        <Link href="/expenses/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium">
          Добавить расход
        </Link>
      </div>

      {expenses.length === 0 ? (
        <p className="text-gray-600 text-lg">Расходов пока нет.</p>
      ) : (
        <ul className="space-y-3">
          {expenses.map((e) => (
            <li key={e.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
              <div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-gray-900 font-semibold text-lg">{e.category.name}</span>
                  <span className="text-xl font-bold text-rose-800">
                    {e.amount.toFixed(2)} ₽
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(e.date).toLocaleDateString('ru-RU')} {e.description && `· ${e.description}`}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <Link href={`/expenses/${e.id}/edit`} className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
                  Изменить
                </Link>
                <DeleteExpenseButton id={e.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="p-10 text-center text-gray-600">Загрузка данных...</div>}>
        <DashboardContent />
      </Suspense>
    </>
  )
}