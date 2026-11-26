'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'

export default function NewExpensePage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setIsClient(true)
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setError('Не удалось загрузить категории'))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, description, date, categoryId }),
    })

    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j.error || 'Ошибка сохранения')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  if (!isClient) {
    return (
      <>
        <Navbar />
        <div className="p-10 text-center text-gray-600">Загрузка формы...</div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200 mt-10">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Новый расход</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="0.01" placeholder="Сумма" required className="w-full border border-gray-300 p-2 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание (необязательно)" className="w-full border border-gray-300 p-2 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <input value={date} onChange={(e) => setDate(e.target.value)} type="date" required className="w-full border border-gray-300 p-2 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full border border-gray-300 p-2 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Выберите категорию</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-rose-600 text-sm font-medium">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors font-medium">Сохранить</button>
        </form>
      </div>
    </>
  )
}