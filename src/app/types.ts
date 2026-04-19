import { config } from '@/config/config'

export type ServiceKey = keyof typeof config.api.services

export type TabKey =
  | 'overview'
  | 'expenses'
  | 'income'
  | 'categories'
  | 'budgets'
  | 'recurring'
  | 'notifications'
  | 'profile'

export type Flash = {
  kind: 'success' | 'error'
  text: string
}

export type Session = {
  token: string
  userId: number
  email: string
}

export type UserProfile = {
  userId: number
  fullName: string
  email: string
  currency: string
  timezone: string
  avatarUrl: string
  bio: string
  provider: 'LOCAL' | 'GOOGLE' | 'GITHUB'
  active: boolean
  createdAt: string
  monthlyBudget: number
}

export type Expense = {
  expenseId: number
  userId: number
  categoryId: number
  title: string
  amount: number
  currency: string
  type: 'EXPENSE' | 'SPLIT'
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'BANK' | 'WALLET'
  date: string
  notes: string
  receiptUrl: string
  recurring: boolean
}

export type Income = {
  incomeId: number
  userId: number
  categoryId: number
  title: string
  amount: number
  currency: string
  source:
    | 'SALARY'
    | 'FREELANCE'
    | 'BUSINESS'
    | 'INVESTMENT'
    | 'GIFT'
    | 'OTHER'
  date: string
  notes: string
  recurring: boolean
  recurrencePeriod?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
}

export type Category = {
  categoryId: number
  userId: number
  name: string
  type: 'EXPENSE' | 'INCOME'
  icon: string
  colorCode: string
  budgetLimit?: number
  defaultCategory: boolean
}

export type Budget = {
  budgetId: number
  userId: number
  categoryId?: number
  name: string
  limitAmount: number
  currency: string
  period: 'MONTHLY' | 'WEEKLY' | 'CUSTOM'
  startDate?: string
  endDate?: string
  spentAmount: number
  alertThreshold: number
  active: boolean
}

export type BudgetProgress = {
  budgetId: number
  limitAmount: number
  spentAmount: number
  percentageUsed: number
  remainingAmount: number
  thresholdReached: boolean
  exceeded: boolean
}

export type RecurringRule = {
  recurringId: number
  userId: number
  categoryId: number
  title: string
  amount: number
  type: 'EXPENSE' | 'INCOME'
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  startDate: string
  endDate?: string
  nextDueDate: string
  active: boolean
  description: string
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'BANK' | 'WALLET'
}

export type Notification = {
  notificationId: number
  recipientId: number
  type:
    | 'WELCOME'
    | 'BUDGET_ALERT'
    | 'RECURRING_DUE'
    | 'MONTHLY_SUMMARY'
    | 'BUDGET_EXCEEDED'
    | 'BIG_EXPENSE_ALERT'
    | 'SYSTEM'
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  title: string
  message: string
  relatedId?: number
  relatedType?: string
  read: boolean
  acknowledged: boolean
  createdAt: string
}

export type SummaryCard = {
  label: string
  value: string
  tone?: 'good' | 'bad' | 'neutral'
}

export type MonthlySummary = {
  totalIncome: number
  totalExpenses: number
  netSavings: number
  savingsRate: number
  topCategory: string
}

export type TrendRow = {
  period: string
  income?: number
  expense?: number
  inflow?: number
  outflow?: number
  net?: number
  savingsRate?: number
}

export type BreakdownRow = {
  category: string
  amount: number
}

export type DailyTrendRow = {
  day: number
  expense: number
}

export type ExpenseForm = {
  title: string
  amount: string
  categoryId: string
  date: string
  paymentMethod: Expense['paymentMethod']
  notes: string
  receiptUrl: string
  recurring: boolean
}

export type IncomeForm = {
  title: string
  amount: string
  categoryId: string
  source: Income['source']
  date: string
  notes: string
  recurring: boolean
  recurrencePeriod: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
}

export type CategoryForm = {
  name: string
  type: Category['type']
  icon: string
  colorCode: string
}

export type BudgetForm = {
  name: string
  categoryId: string
  limitAmount: string
  period: Budget['period']
  alertThreshold: string
  startDate: string
  endDate: string
  active: boolean
}

export type RecurringForm = {
  title: string
  amount: string
  categoryId: string
  type: RecurringRule['type']
  frequency: RecurringRule['frequency']
  startDate: string
  endDate: string
  nextDueDate: string
  paymentMethod: RecurringRule['paymentMethod']
  description: string
  active: boolean
}
