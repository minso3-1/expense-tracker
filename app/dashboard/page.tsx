import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const expenses = await prisma.expense.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: 'desc' },
  })

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2">Привет, {user.name || user.email}</h1>
        <p className="text-gray-600 mb-4">Всего расходов: {total.toFixed(2)} ₽</p>

        <Link href="/expenses/new" className="inline-block bg-blue-600 text-white px-4 py-2 rounded mb-4">Добавить расход</Link>

        {expenses.length === 0 ? (
          <p className="text-gray-500">Расходов пока нет.</p>
        ) : (
          <ul className="space-y-2">
            {expenses.map((e) => (
              <li key={e.id} className="bg-white p-3 rounded border flex justify-between items-center">
                <div>
                  <div className="font-medium">{e.category.name} — {e.amount.toFixed(2)} ₽</div>
                  <div className="text-sm text-gray-500">
                    {new Date(e.date).toLocaleDateString('ru-RU')} {e.description && `· ${e.description}`}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}