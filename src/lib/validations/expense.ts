import { z } from 'zod'

export const expenseSchema = z.object({
  merchant: z.string().min(1, 'Merchant is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  currency: z.string().default('USD'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  category_id: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type ExpenseInput = z.infer<typeof expenseSchema>