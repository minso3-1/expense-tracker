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
    <nav className="bg-white border-b p-4 mb-6">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="font-bold text-lg">Учёт расходов</Link>
        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="hover:underline">Главная</Link>
          <Link href="/expenses/new" className="hover:underline">Добавить</Link>
          <button onClick={logout} className="text-red-600 hover:underline">Выйти</button>
        </div>
      </div>
    </nav>
  )
}