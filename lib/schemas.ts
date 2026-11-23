import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  name: z.string().min(1, 'Укажите имя'),
  password: z.string().min(8, 'Минимум 8 символов'),
})

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

export const expenseSchema = z.object({
  amount: z.coerce.number().positive('Сумма должна быть больше 0'),
  description: z.string().max(200).optional(),
  date: z.string().min(1, 'Укажите дату'),
  categoryId: z.string().min(1, 'Выберите категорию'),
})