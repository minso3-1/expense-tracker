'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/schemas'
import Link from 'next/link'
import { useState } from 'react'
import { z } from 'zod'

type LoginInput = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginInput) {
    setServerError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setServerError(j.error || 'Ошибка входа')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow border">
      <h1 className="text-2xl font-bold mb-4">Вход</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input {...register('email')} placeholder="Email" className="w-full border p-2 rounded" />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <input {...register('password')} type="password" placeholder="Пароль" className="w-full border p-2 rounded" />
          {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
        </div>
        {serverError && <p className="text-red-600 text-sm">{serverError}</p>}
        <button disabled={isSubmitting} className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50">
          {isSubmitting ? 'Вход...' : 'Войти'}
        </button>
      </form>
      <p className="mt-4 text-sm text-center">
        Нет аккаунта? <Link href="/register" className="text-blue-600 hover:underline">Зарегистрироваться</Link>
      </p>
    </div>
  )
}