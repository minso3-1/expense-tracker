'use client'

import { useRouter } from 'next/navigation'

export default function DeleteExpenseButton({ id }: { id: string }) {
  const router = useRouter()

  async function onDelete() {
    if (!confirm('Вы уверены, что хотите удалить этот расход?')) return
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      alert('Ошибка при удалении')
    }
  }

  return (
    <button onClick={onDelete} className="text-rose-600 text-sm font-medium hover:text-rose-800 hover:underline transition-colors">
      Удалить
    </button>
  )
}