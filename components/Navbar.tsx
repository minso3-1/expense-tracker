'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200 p-4 mb-6 shadow-sm">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="font-bold text-xl text-gray-900">
          Учёт расходов
        </Link>
        <div className="flex gap-5 items-center">
          <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Главная
          </Link>
          <Link href="/expenses/new" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Добавить
          </Link>
          <Link href="/categories" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Категории
          </Link>
          <button onClick={logout} className="text-rose-600 hover:text-rose-800 font-medium ml-2 transition-colors">
            Выйти
          </button>
        </div>
      </div>
    </nav>
  )
}