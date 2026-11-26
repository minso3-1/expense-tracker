'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  async function loadCategories() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
  }

  useEffect(() => {
    loadCategories()
  }, [])

   async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) {
        // Безопасно пытаемся прочитать JSON, если не получится — выдаем общую ошибку
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'Ошибка при добавлении категории')
        return
      }

      setName('')
      loadCategories()
    } catch (err) {
      setError('Ошибка сети. Проверьте соединение.')
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Мои категории</h1>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название (например, Спорт)"
            required
            className="flex-1 border border-gray-300 p-2 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium">
            Добавить
          </button>
        </form>
        {error && <p className="text-rose-600 text-sm font-medium mb-4">{error}</p>}

        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c.id} className="bg-white p-3 border border-gray-200 rounded-lg text-gray-900 font-medium shadow-sm">
              {c.name}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}