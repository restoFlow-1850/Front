import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email('Email noto\'g\'ri formatda'),
    password: z.string().min(6, 'Parol kamida 6 belgi bo\'lishi kerak'),
})

export const registerSchema = z.object({
    name: z.string().min(2, 'Ism kamida 2 belgi'),
    email: z.string().email('Email noto\'g\'ri formatda'),
    password: z.string().min(6, 'Parol kamida 6 belgi bo\'lishi kerak'),
    phone: z.string().min(9, 'Telefon raqam noto\'g\'ri'),
})