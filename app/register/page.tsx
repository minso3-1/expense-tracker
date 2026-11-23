'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '@/lib/schemas'
import Link from 'next/link'
import { useState } from 'react'
import { z } from 'zod'

type RegisterInput = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(data: RegisterInput) {
    setServerError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setServerError(j.error || 'Ошибка регистрации')
      return
    }
    // Автоматический вход после регистрации
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password }),
    })
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow border">
      <h1 className="text-2xl font-bold mb-4">Регистрация</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input {...register('name')} placeholder="Имя" className="w-full border p-2 rounded" />
          {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <input {...register('email')} placeholder="Email" className="w-full border p-2 rounded" />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <input {...register('password')} type="password" placeholder="Пароль" className="w-full border p-2 rounded" />
          {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
        </div>
        {serverError && <p className="text-red-600 text-sm">{serverError}</p>}
        <button disabled={isSubmitting} className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-50">
          {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
      <p className="mt-4 text-sm text-center">
        Уже есть аккаунт? <Link href="/login" className="text-blue-600 hover:underline">Войти</Link>
      </p>
    </div>
  )
}