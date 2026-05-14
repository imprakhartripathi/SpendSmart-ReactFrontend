import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import axios, { type Method } from 'axios'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import AppShell from '@/app/components/AppShell'
import BudgetDetail from '@/app/pages/BudgetDetail'
import BudgetsPage from '@/app/pages/Budgets'
import CategoriesPage from '@/app/pages/Categories'
import CategoryDetail from '@/app/pages/CategoryDetail'
import ExpenseDetail from '@/app/pages/ExpenseDetail'
import ExpensesPage from '@/app/pages/Expenses'
import IncomeDetail from '@/app/pages/IncomeDetail'
import IncomePage from '@/app/pages/Income'
import NotificationsPage from '@/app/pages/Notifications'
import Landing from '@/app/pages/Landing'
import LoginPage from '@/app/pages/Login'
import Overview from '@/app/pages/Overview'
import ProfilePage from '@/app/pages/Profile'
import OAuthCallback from '@/app/pages/OAuthCallback'
import RecurringDetail from '@/app/pages/RecurringDetail'
import RecurringPage from '@/app/pages/Recurring'
import SignupPage from '@/app/pages/Signup'
import { config } from '@/config/config'
import type {
  Budget,
  BudgetForm,
  BudgetProgress,
  BreakdownRow,
  Category,
  CategoryForm,
  DailyTrendRow,
  Expense,
  ExpenseForm,
  Flash,
  Income,
  IncomeForm,
  MonthlySummary,
  Notification,
  RecurringForm,
  RecurringRule,
  Session,
  SummaryCard,
  TrendRow,
  UserProfile,
} from '@/app/types'

type ServiceKey = keyof typeof config.api.services

const today = new Date().toISOString().slice(0, 10)
const now = new Date()
const sessionStorageKey = 'spendsmart.session.v1'

const defaultExpenseForm: ExpenseForm = {
  title: '',
  amount: '',
  categoryId: '',
  date: today,
  paymentMethod: 'CARD',
  notes: '',
  receiptUrl: '',
  recurring: false,
}

const defaultIncomeForm: IncomeForm = {
  title: '',
  amount: '',
  categoryId: '',
  source: 'SALARY',
  date: today,
  notes: '',
  recurring: false,
  recurrencePeriod: 'MONTHLY',
}

const defaultCategoryForm: CategoryForm = {
  name: '',
  type: 'EXPENSE',
  icon: '📁',
  colorCode: '#18c29c',
}

const defaultBudgetForm: BudgetForm = {
  name: '',
  categoryId: '',
  limitAmount: '',
  period: 'MONTHLY',
  alertThreshold: '80',
  startDate: today,
  endDate: today,
  active: true,
}

const defaultRecurringForm: RecurringForm = {
  title: '',
  amount: '',
  categoryId: '',
  type: 'EXPENSE',
  frequency: 'MONTHLY',
  startDate: today,
  endDate: '',
  nextDueDate: today,
  paymentMethod: 'BANK',
  description: '',
  active: true,
}

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const readSession = (): Session | null => {
  const raw = localStorage.getItem(sessionStorageKey)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Session
    if (parsed.token && parsed.userId && parsed.email) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const formatMoney = (value: number, currency: string): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return currencyFormatter.format(value)
  }
}

function App() {
  const services = config.api.services

  const [session, setSession] = useState<Session | null>(() => readSession())
  const [flash, setFlash] = useState<Flash | null>(null)
  const [working, setWorking] = useState(false)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [registerFullName, setRegisterFullName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerCurrency, setRegisterCurrency] = useState('USD')
  const [registerTimezone, setRegisterTimezone] = useState('Asia/Kolkata')
  const [registerMonthlyBudget, setRegisterMonthlyBudget] = useState('3000')

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profileTimezone, setProfileTimezone] = useState('UTC')
  const [profileAvatar, setProfileAvatar] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profileCurrency, setProfileCurrency] = useState('USD')
  const [profileMonthlyBudget, setProfileMonthlyBudget] = useState('0')

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>(defaultExpenseForm)
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null)
  const [expenseKeyword, setExpenseKeyword] = useState('')

  const [incomes, setIncomes] = useState<Income[]>([])
  const [incomeForm, setIncomeForm] = useState<IncomeForm>(defaultIncomeForm)
  const [editingIncomeId, setEditingIncomeId] = useState<number | null>(null)
  const [incomeKeyword, setIncomeKeyword] = useState('')

  const [categories, setCategories] = useState<Category[]>([])
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(defaultCategoryForm)
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)

  const [budgets, setBudgets] = useState<Budget[]>([])
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetProgress[]>([])
  const [budgetForm, setBudgetForm] = useState<BudgetForm>(defaultBudgetForm)
  const [editingBudgetId, setEditingBudgetId] = useState<number | null>(null)

  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([])
  const [upcomingRecurring, setUpcomingRecurring] = useState<RecurringRule[]>([])
  const [recurringForm, setRecurringForm] = useState<RecurringForm>(defaultRecurringForm)
  const [editingRecurringId, setEditingRecurringId] = useState<number | null>(null)

  const [notifications, setNotifications] = useState<Notification[]>([])

  const [analyticsYear, setAnalyticsYear] = useState(String(now.getFullYear()))
  const [analyticsMonth, setAnalyticsMonth] = useState(String(now.getMonth() + 1))
  const [analyticsTrailingMonths, setAnalyticsTrailingMonths] = useState('12')

  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<BreakdownRow[]>([])
  const [incomeVsExpenseTrend, setIncomeVsExpenseTrend] = useState<TrendRow[]>([])
  const [dailyTrend, setDailyTrend] = useState<DailyTrendRow[]>([])
  const [savingsTrend, setSavingsTrend] = useState<TrendRow[]>([])
  const [cashflowTrend, setCashflowTrend] = useState<TrendRow[]>([])
  const [topCategories, setTopCategories] = useState<BreakdownRow[]>([])
  const [forecastValue, setForecastValue] = useState(0)
  const [healthScore, setHealthScore] = useState<number | null>(null)

  const categoryNameMap = useMemo(
    () => new Map(categories.map((category) => [category.categoryId, category.name])),
    [categories],
  )

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === 'EXPENSE'),
    [categories],
  )

  const incomeCategories = useMemo(
    () => categories.filter((category) => category.type === 'INCOME'),
    [categories],
  )

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  )

  const resolveCategoryLabel = useCallback(
    (value: unknown) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return categoryNameMap.get(value) || `Category ${value}`
      }

      if (typeof value === 'string') {
        const numericMatch = value.match(/^category-(\d+)$/i)
        if (numericMatch) {
          const categoryId = Number(numericMatch[1])
          return categoryNameMap.get(categoryId) || value
        }

        if (/^\d+$/.test(value)) {
          const categoryId = Number(value)
          return categoryNameMap.get(categoryId) || `Category ${value}`
        }

        return value
      }

      return 'Uncategorised'
    },
    [categoryNameMap],
  )

  const overviewCards = useMemo<SummaryCard[]>(() => {
    if (!monthlySummary) return []

    const currency = profile?.currency || 'USD'

    return [
      {
        label: 'Monthly Income',
        value: formatMoney(monthlySummary.totalIncome, currency),
        tone: 'good',
      },
      {
        label: 'Monthly Expenses',
        value: formatMoney(monthlySummary.totalExpenses, currency),
        tone: 'bad',
      },
      {
        label: 'Net Savings',
        value: formatMoney(monthlySummary.netSavings, currency),
        tone: monthlySummary.netSavings >= 0 ? 'good' : 'bad',
      },
      {
        label: 'Savings Rate',
        value: `${monthlySummary.savingsRate.toFixed(2)}%`,
        tone: monthlySummary.savingsRate >= 0 ? 'good' : 'bad',
      },
      {
        label: 'Forecast (Next Month)',
        value: formatMoney(forecastValue, currency),
      },
      {
        label: 'Financial Health Score',
        value: healthScore === null ? 'Insufficient data' : `${healthScore.toFixed(2)} / 100`,
      },
      {
        label: 'Top Spend Category',
        value: resolveCategoryLabel(monthlySummary.topCategory || topCategories[0]?.category || 'Uncategorised'),
      },
      {
        label: 'Unread Notifications',
        value: String(unreadCount),
        tone: unreadCount > 0 ? 'bad' : 'good',
      },
    ]
  }, [forecastValue, healthScore, monthlySummary, profile?.currency, unreadCount, resolveCategoryLabel])

  const pieData = useMemo(() => {
    return categoryBreakdown
      .map((item) => {
        const rawCategory = item.category
        const suffix = rawCategory.replace('category-', '')
        const categoryId = Number(suffix)
        const label = Number.isFinite(categoryId)
          ? categoryNameMap.get(categoryId) || rawCategory
          : rawCategory

        return {
          name: label,
          value: item.amount,
        }
      })
      .filter((item) => item.value > 0)
  }, [categoryBreakdown, categoryNameMap])

  const recentExpenses = useMemo(
    () => [...expenses].slice(0, 8),
    [expenses],
  )

  const recentIncomes = useMemo(
    () => [...incomes].slice(0, 8),
    [incomes],
  )

  const runApi = async <T,>(
    service: ServiceKey,
    method: Method,
    path: string,
    params?: Record<string, string | number | boolean>,
    data?: unknown,
  ): Promise<T> => {
    const headers: Record<string, string> = {}
    if (session?.token) {
      headers.Authorization = `Bearer ${session.token}`
    }

    const response = await axios.request<T>({
      baseURL: services[service],
      url: path,
      method,
      timeout: config.api.timeoutMs,
      params,
      data,
      headers,
    })

    return response.data
  }

  const showError = (error: unknown, fallbackMessage: string) => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data
      if (typeof responseData === 'string') {
        setFlash({ kind: 'error', text: responseData })
        return
      }

      if (
        responseData &&
        typeof responseData === 'object' &&
        'message' in responseData &&
        typeof (responseData as { message: unknown }).message === 'string'
      ) {
        setFlash({ kind: 'error', text: (responseData as { message: string }).message })
        return
      }

      setFlash({ kind: 'error', text: `${fallbackMessage} (${error.message})` })
      return
    }

    setFlash({ kind: 'error', text: fallbackMessage })
  }

  const persistSession = (nextSession: Session | null) => {
    if (nextSession) {
      localStorage.setItem(sessionStorageKey, JSON.stringify(nextSession))
    } else {
      localStorage.removeItem(sessionStorageKey)
    }

    setSession(nextSession)
  }

  const syncProfileForm = (nextProfile: UserProfile) => {
    setProfile(nextProfile)
    setProfileName(nextProfile.fullName)
    setProfileEmail(nextProfile.email)
    setProfileTimezone(nextProfile.timezone)
    setProfileAvatar(nextProfile.avatarUrl || '')
    setProfileBio(nextProfile.bio || '')
    setProfileCurrency(nextProfile.currency || 'USD')
    setProfileMonthlyBudget(String(toNumber(nextProfile.monthlyBudget)))
  }

  const fetchProfile = async (userId: number) => {
    const userProfile = await runApi<UserProfile>('auth', 'GET', `/auth/profile/${userId}`)
    syncProfileForm({
      ...userProfile,
      monthlyBudget: toNumber(userProfile.monthlyBudget),
    })
  }

  const fetchCategories = async (userId: number) => {
    const rows = await runApi<Category[]>('category', 'GET', `/categories/user/${userId}`)
    setCategories(
      rows.map((row) => ({
        ...row,
        budgetLimit: toNumber(row.budgetLimit),
      })),
    )
  }

  const fetchExpenses = async (userId: number) => {
    const endpoint = expenseKeyword.trim().length
      ? '/expenses/search'
      : `/expenses/user/${userId}`

    const rows = await runApi<Expense[]>(
      'expense',
      'GET',
      endpoint,
      expenseKeyword.trim().length ? { userId, keyword: expenseKeyword.trim() } : undefined,
    )

    setExpenses(
      rows.map((row) => ({
        ...row,
        amount: toNumber(row.amount),
      })),
    )
  }

  const fetchIncomes = async (userId: number) => {
    const endpoint = incomeKeyword.trim().length
      ? '/incomes/search'
      : `/incomes/user/${userId}`

    const rows = await runApi<Income[]>(
      'income',
      'GET',
      endpoint,
      incomeKeyword.trim().length ? { userId, keyword: incomeKeyword.trim() } : undefined,
    )

    setIncomes(
      rows.map((row) => ({
        ...row,
        amount: toNumber(row.amount),
      })),
    )
  }

  const fetchBudgets = async (userId: number) => {
    const rows = await runApi<Budget[]>('budget', 'GET', `/budgets/user/${userId}`)
    setBudgets(
      rows.map((row) => ({
        ...row,
        limitAmount: toNumber(row.limitAmount),
        spentAmount: toNumber(row.spentAmount),
        alertThreshold: toNumber(row.alertThreshold),
      })),
    )

    const alerts = await runApi<BudgetProgress[]>('budget', 'GET', `/budgets/alerts/${userId}`)
    setBudgetAlerts(
      alerts.map((alert) => ({
        ...alert,
        limitAmount: toNumber(alert.limitAmount),
        spentAmount: toNumber(alert.spentAmount),
        percentageUsed: toNumber(alert.percentageUsed),
        remainingAmount: toNumber(alert.remainingAmount),
      })),
    )
  }

  const fetchRecurring = async (userId: number) => {
    const rows = await runApi<RecurringRule[]>('recurring', 'GET', `/recurring/user/${userId}`)
    setRecurringRules(
      rows.map((row) => ({
        ...row,
        amount: toNumber(row.amount),
      })),
    )

    const upcoming = await runApi<RecurringRule[]>(
      'recurring',
      'GET',
      `/recurring/upcomingMonth/${userId}`,
    )
    setUpcomingRecurring(
      upcoming.map((row) => ({
        ...row,
        amount: toNumber(row.amount),
      })),
    )
  }

  const fetchNotifications = async (userId: number) => {
    const rows = await runApi<Notification[]>(
      'notification',
      'GET',
      `/notifications/recipient/${userId}`,
    )
    setNotifications(rows)
  }

  const fetchDashboard = async (userId: number) => {
    const year = Number(analyticsYear)
    const month = Number(analyticsMonth)
    const trailingMonths = Number(analyticsTrailingMonths)
    const monthlyBudgetGoal = toNumber(profile?.monthlyBudget)

    const [
      summaryRaw,
      breakdownRaw,
      trendRaw,
      dailyRaw,
      savingsRaw,
      cashflowRaw,
      topRaw,
      forecastRaw,
    ] = await Promise.all([
      runApi<Record<string, unknown>>('analytics', 'GET', '/analytics/monthlySummary', {
        userId,
        year,
        month,
      }),
      runApi<Record<string, unknown>[]>(
        'analytics',
        'GET',
        '/analytics/categoryBreakdown',
        {
          userId,
          year,
          month,
        },
      ),
      runApi<Record<string, unknown>[]>(
        'analytics',
        'GET',
        '/analytics/incomeVsExpense',
        {
          userId,
          trailingMonths,
        },
      ),
      runApi<Record<string, unknown>[]>('analytics', 'GET', '/analytics/dailyTrend', {
        userId,
        year,
        month,
      }),
      runApi<Record<string, unknown>[]>(
        'analytics',
        'GET',
        '/analytics/savingsRate',
        {
          userId,
          trailingMonths,
        },
      ),
      runApi<Record<string, unknown>[]>('analytics', 'GET', '/analytics/cashflow', {
        userId,
        trailingMonths,
      }),
      runApi<Record<string, unknown>[]>(
        'analytics',
        'GET',
        '/analytics/topCategories',
        {
          userId,
          year,
          month,
        },
      ),
      runApi<Record<string, unknown>>('analytics', 'GET', '/analytics/forecast', {
        userId,
      }),
    ])

    setMonthlySummary({
      totalIncome: toNumber(summaryRaw.totalIncome),
      totalExpenses: toNumber(summaryRaw.totalExpenses),
      netSavings: toNumber(summaryRaw.netSavings),
      savingsRate: toNumber(summaryRaw.savingsRate),
      topCategory: resolveCategoryLabel(summaryRaw.topCategory),
    })

    setCategoryBreakdown(
      breakdownRaw.map((row) => ({
        category: resolveCategoryLabel(row.category),
        amount: toNumber(row.amount),
      })),
    )

    setIncomeVsExpenseTrend(
      trendRaw.map((row) => ({
        period: String(row.period ?? ''),
        income: toNumber(row.income),
        expense: toNumber(row.expense),
      })),
    )

    setDailyTrend(
      dailyRaw.map((row) => ({
        day: toNumber(row.day),
        expense: toNumber(row.expense),
      })),
    )

    setSavingsTrend(
      savingsRaw.map((row) => ({
        period: String(row.period ?? ''),
        savingsRate: toNumber(row.savingsRate),
      })),
    )

    setCashflowTrend(
      cashflowRaw.map((row) => ({
        period: String(row.period ?? ''),
        inflow: toNumber(row.inflow),
        outflow: toNumber(row.outflow),
        net: toNumber(row.net),
      })),
    )

    setTopCategories(
      topRaw.map((row) => ({
        category: resolveCategoryLabel(row.category),
        amount: toNumber(row.amount),
      })),
    )

    setForecastValue(toNumber(forecastRaw.forecast))

    try {
      const healthRaw = await runApi<Record<string, unknown>>(
        'analytics',
        'GET',
        '/analytics/healthScore',
        {
          userId,
          monthlyBudgetGoal,
        },
      )
      setHealthScore(toNumber(healthRaw.score))
    } catch {
      setHealthScore(null)
    }
  }

  const fetchAll = async (userId: number) => {
    setWorking(true)
    try {
      await fetchProfile(userId)
      await Promise.all([
        fetchCategories(userId),
        fetchExpenses(userId),
        fetchIncomes(userId),
        fetchBudgets(userId),
        fetchRecurring(userId),
        fetchNotifications(userId),
      ])
      await fetchDashboard(userId)
    } catch (error) {
      showError(error, 'Unable to load dashboard data')
    } finally {
      setWorking(false)
    }
  }

  useEffect(() => {
    if (!session) return
    void fetchAll(session.userId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => {
    if (!session) return
    void fetchDashboard(session.userId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsYear, analyticsMonth, analyticsTrailingMonths, profile?.monthlyBudget])

  useEffect(() => {
    if (session) return

    const match = window.location.pathname.match(/^\/oauth\/callback\/(google|github)$/i)
    if (!match) return

    const provider = match[1].toLowerCase()
    const search = new URLSearchParams(window.location.search)
    const code = search.get('code')
    const oauthError = search.get('error')

    if (oauthError) {
      setFlash({ kind: 'error', text: `OAuth login failed: ${oauthError}` })
      window.history.replaceState({}, '', '/')
      return
    }

    if (!code) {
      setFlash({ kind: 'error', text: 'OAuth login failed: authorization code missing.' })
      window.history.replaceState({}, '', '/')
      return
    }

    void (async () => {
      setWorking(true)
      try {
        const response = await runApi<{ token: string; userId: number; email: string }>(
          'auth',
          'POST',
          `/auth/oauth2/callback/${provider}`,
          undefined,
          { code },
        )

        persistSession({
          token: response.token,
          userId: response.userId,
          email: response.email,
        })
        setFlash({ kind: 'success', text: 'OAuth login successful' })
      } catch (error) {
        showError(error, 'OAuth login failed')
      } finally {
        setWorking(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const startOAuthLogin = async (provider: 'google' | 'github') => {
    setWorking(true)
    try {
      const response = await runApi<{ authorizationUrl: string }>(
        'auth',
        'GET',
        `/auth/oauth2/authorize/${provider}`,
      )

      if (!response.authorizationUrl) {
        throw new Error('Authorization URL was not returned')
      }
      window.location.href = response.authorizationUrl
    } catch (error) {
      showError(error, `Unable to start ${provider} login`)
      setWorking(false)
    }
  }

  const onLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setWorking(true)
    try {
      const response = await runApi<{ token: string; userId: number; email: string }>(
        'auth',
        'POST',
        '/auth/login',
        undefined,
        {
          email: loginEmail.trim(),
          password: loginPassword,
        },
      )

      persistSession({
        token: response.token,
        userId: response.userId,
        email: response.email,
      })
      setLoginPassword('')
      setFlash({ kind: 'success', text: 'Login successful' })
    } catch (error) {
      showError(error, 'Login failed')
    } finally {
      setWorking(false)
    }
  }

  const onRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setWorking(true)
    try {
      await runApi('auth', 'POST', '/auth/register', undefined, {
        fullName: registerFullName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        currency: registerCurrency,
        timezone: registerTimezone,
        monthlyBudget: toNumber(registerMonthlyBudget),
        provider: 'LOCAL',
      })

      setFlash({ kind: 'success', text: 'Registration complete. Please log in.' })
      setLoginEmail(registerEmail.trim())
      setRegisterPassword('')
    } catch (error) {
      showError(error, 'Registration failed')
    } finally {
      setWorking(false)
    }
  }

  const onLogout = async () => {
    if (!session) return

    try {
      await runApi('auth', 'POST', '/auth/logout', undefined, { token: session.token })
    } catch {
      // Local logout should still happen.
    }

    persistSession(null)
    setProfile(null)
    setExpenses([])
    setIncomes([])
    setCategories([])
    setBudgets([])
    setRecurringRules([])
    setNotifications([])
    setMonthlySummary(null)
    setFlash({ kind: 'success', text: 'Logged out' })
  }

  const saveExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session) return

    const payload = {
      userId: session.userId,
      categoryId: Number(expenseForm.categoryId),
      title: expenseForm.title.trim(),
      amount: toNumber(expenseForm.amount),
      currency: profile?.currency || 'USD',
      type: 'EXPENSE',
      paymentMethod: expenseForm.paymentMethod,
      date: expenseForm.date,
      notes: expenseForm.notes,
      receiptUrl: expenseForm.receiptUrl,
      recurring: expenseForm.recurring,
    }

    if (!payload.categoryId || !payload.title || payload.amount <= 0) {
      setFlash({ kind: 'error', text: 'Expense requires title, amount, and category.' })
      return
    }

    setWorking(true)
    try {
      if (editingExpenseId) {
        await runApi('expense', 'PUT', `/expenses/${editingExpenseId}`, undefined, payload)
      } else {
        await runApi('expense', 'POST', '/expenses', undefined, payload)
      }

      setExpenseForm(defaultExpenseForm)
      setEditingExpenseId(null)
      await Promise.all([
        fetchExpenses(session.userId),
        fetchBudgets(session.userId),
        fetchDashboard(session.userId),
      ])
      setFlash({ kind: 'success', text: 'Expense saved' })
    } catch (error) {
      showError(error, 'Could not save expense')
    } finally {
      setWorking(false)
    }
  }

  const editExpense = (expense: Expense) => {
    setEditingExpenseId(expense.expenseId)
    setExpenseForm({
      title: expense.title,
      amount: String(expense.amount),
      categoryId: String(expense.categoryId),
      date: expense.date,
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || '',
      receiptUrl: expense.receiptUrl || '',
      recurring: expense.recurring,
    })
  }

  const removeExpense = async (expenseId: number) => {
    if (!session) return

    setWorking(true)
    try {
      await runApi('expense', 'DELETE', `/expenses/${expenseId}`)
      await Promise.all([
        fetchExpenses(session.userId),
        fetchBudgets(session.userId),
        fetchDashboard(session.userId),
      ])
      setFlash({ kind: 'success', text: 'Expense deleted' })
    } catch (error) {
      showError(error, 'Could not delete expense')
    } finally {
      setWorking(false)
    }
  }

  const saveIncome = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session) return

    const payload = {
      userId: session.userId,
      categoryId: Number(incomeForm.categoryId),
      title: incomeForm.title.trim(),
      amount: toNumber(incomeForm.amount),
      currency: profile?.currency || 'USD',
      source: incomeForm.source,
      date: incomeForm.date,
      notes: incomeForm.notes,
      recurring: incomeForm.recurring,
      recurrencePeriod: incomeForm.recurring ? incomeForm.recurrencePeriod : undefined,
    }

    if (!payload.categoryId || !payload.title || payload.amount <= 0) {
      setFlash({ kind: 'error', text: 'Income requires title, amount, and category.' })
      return
    }

    setWorking(true)
    try {
      if (editingIncomeId) {
        await runApi('income', 'PUT', `/incomes/${editingIncomeId}`, undefined, payload)
      } else {
        await runApi('income', 'POST', '/incomes', undefined, payload)
      }

      setIncomeForm(defaultIncomeForm)
      setEditingIncomeId(null)
      await Promise.all([fetchIncomes(session.userId), fetchDashboard(session.userId)])
      setFlash({ kind: 'success', text: 'Income saved' })
    } catch (error) {
      showError(error, 'Could not save income')
    } finally {
      setWorking(false)
    }
  }

  const editIncome = (income: Income) => {
    setEditingIncomeId(income.incomeId)
    setIncomeForm({
      title: income.title,
      amount: String(income.amount),
      categoryId: String(income.categoryId),
      source: income.source,
      date: income.date,
      notes: income.notes || '',
      recurring: income.recurring,
      recurrencePeriod: income.recurrencePeriod || 'MONTHLY',
    })
  }

  const removeIncome = async (incomeId: number) => {
    if (!session) return

    setWorking(true)
    try {
      await runApi('income', 'DELETE', `/incomes/${incomeId}`)
      await Promise.all([fetchIncomes(session.userId), fetchDashboard(session.userId)])
      setFlash({ kind: 'success', text: 'Income deleted' })
    } catch (error) {
      showError(error, 'Could not delete income')
    } finally {
      setWorking(false)
    }
  }

  const saveCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session) return

    const payload = {
      userId: session.userId,
      name: categoryForm.name.trim(),
      type: categoryForm.type,
      icon: categoryForm.icon,
      colorCode: categoryForm.colorCode,
      defaultCategory: false,
    }

    if (!payload.name) {
      setFlash({ kind: 'error', text: 'Category name is required.' })
      return
    }

    setWorking(true)
    try {
      if (editingCategoryId) {
        await runApi('category', 'PUT', `/categories/${editingCategoryId}`, undefined, payload)
      } else {
        await runApi('category', 'POST', '/categories', undefined, payload)
      }

      setCategoryForm(defaultCategoryForm)
      setEditingCategoryId(null)
      await Promise.all([fetchCategories(session.userId), fetchBudgets(session.userId), fetchDashboard(session.userId)])
      setFlash({ kind: 'success', text: 'Category saved' })
    } catch (error) {
      showError(error, 'Could not save category')
    } finally {
      setWorking(false)
    }
  }

  const editCategory = (category: Category) => {
    setEditingCategoryId(category.categoryId)
    setCategoryForm({
      name: category.name,
      type: category.type,
      icon: category.icon || '📁',
      colorCode: category.colorCode || '#18c29c',
    })
  }

  const removeCategory = async (categoryId: number) => {
    if (!session) return

    setWorking(true)
    try {
      await runApi('category', 'DELETE', `/categories/${categoryId}`)
      await Promise.all([fetchCategories(session.userId), fetchDashboard(session.userId)])
      setFlash({ kind: 'success', text: 'Category deleted' })
    } catch (error) {
      showError(error, 'Could not delete category')
    } finally {
      setWorking(false)
    }
  }

  const initDefaultCategories = async () => {
    if (!session) return

    setWorking(true)
    try {
      await runApi('category', 'POST', `/categories/defaults/init/${session.userId}`)
      await Promise.all([fetchCategories(session.userId), fetchDashboard(session.userId)])
      setFlash({ kind: 'success', text: 'Default categories initialized' })
    } catch (error) {
      showError(error, 'Could not initialize default categories')
    } finally {
      setWorking(false)
    }
  }

  const saveBudget = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session) return

    const payload = {
      userId: session.userId,
      categoryId: budgetForm.categoryId ? Number(budgetForm.categoryId) : undefined,
      name: budgetForm.name.trim(),
      limitAmount: toNumber(budgetForm.limitAmount),
      currency: profile?.currency || 'USD',
      period: budgetForm.period,
      startDate: budgetForm.period === 'CUSTOM' ? budgetForm.startDate : undefined,
      endDate: budgetForm.period === 'CUSTOM' ? budgetForm.endDate : undefined,
      alertThreshold: toNumber(budgetForm.alertThreshold),
      active: budgetForm.active,
    }

    if (!payload.name || payload.limitAmount <= 0) {
      setFlash({ kind: 'error', text: 'Budget requires name and limit amount.' })
      return
    }

    setWorking(true)
    try {
      if (editingBudgetId) {
        await runApi('budget', 'PUT', `/budgets/${editingBudgetId}`, undefined, payload)
      } else {
        await runApi('budget', 'POST', '/budgets', undefined, payload)
      }

      setBudgetForm(defaultBudgetForm)
      setEditingBudgetId(null)
      await Promise.all([fetchBudgets(session.userId), fetchDashboard(session.userId)])
      setFlash({ kind: 'success', text: 'Budget saved' })
    } catch (error) {
      showError(error, 'Could not save budget')
    } finally {
      setWorking(false)
    }
  }

  const editBudget = (budget: Budget) => {
    setEditingBudgetId(budget.budgetId)
    setBudgetForm({
      name: budget.name,
      categoryId: budget.categoryId ? String(budget.categoryId) : '',
      limitAmount: String(budget.limitAmount),
      period: budget.period,
      alertThreshold: String(budget.alertThreshold),
      startDate: budget.startDate || today,
      endDate: budget.endDate || today,
      active: budget.active,
    })
  }

  const removeBudget = async (budgetId: number) => {
    if (!session) return

    setWorking(true)
    try {
      await runApi('budget', 'DELETE', `/budgets/${budgetId}`)
      await Promise.all([fetchBudgets(session.userId), fetchDashboard(session.userId)])
      setFlash({ kind: 'success', text: 'Budget deleted' })
    } catch (error) {
      showError(error, 'Could not delete budget')
    } finally {
      setWorking(false)
    }
  }

  const dispatchBudgetAlerts = async () => {
    if (!session) return

    setWorking(true)
    try {
      await runApi('budget', 'POST', `/budgets/alerts/${session.userId}/dispatch`)
      await Promise.all([fetchBudgets(session.userId), fetchNotifications(session.userId)])
      setFlash({ kind: 'success', text: 'Budget alerts dispatched' })
    } catch (error) {
      showError(error, 'Could not dispatch budget alerts')
    } finally {
      setWorking(false)
    }
  }

  const saveRecurring = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session) return

    const payload = {
      userId: session.userId,
      categoryId: Number(recurringForm.categoryId),
      title: recurringForm.title.trim(),
      amount: toNumber(recurringForm.amount),
      type: recurringForm.type,
      frequency: recurringForm.frequency,
      startDate: recurringForm.startDate,
      endDate: recurringForm.endDate || undefined,
      nextDueDate: recurringForm.nextDueDate,
      description: recurringForm.description,
      paymentMethod: recurringForm.paymentMethod,
      active: recurringForm.active,
    }

    if (!payload.categoryId || !payload.title || payload.amount <= 0) {
      setFlash({
        kind: 'error',
        text: 'Recurring rule requires title, amount, and category.',
      })
      return
    }

    setWorking(true)
    try {
      if (editingRecurringId) {
        await runApi('recurring', 'PUT', `/recurring/${editingRecurringId}`, undefined, payload)
      } else {
        await runApi('recurring', 'POST', '/recurring', undefined, payload)
      }

      setRecurringForm(defaultRecurringForm)
      setEditingRecurringId(null)
      await Promise.all([fetchRecurring(session.userId), fetchDashboard(session.userId)])
      setFlash({ kind: 'success', text: 'Recurring rule saved' })
    } catch (error) {
      showError(error, 'Could not save recurring rule')
    } finally {
      setWorking(false)
    }
  }

  const editRecurring = (rule: RecurringRule) => {
    setEditingRecurringId(rule.recurringId)
    setRecurringForm({
      title: rule.title,
      amount: String(rule.amount),
      categoryId: String(rule.categoryId),
      type: rule.type,
      frequency: rule.frequency,
      startDate: rule.startDate,
      endDate: rule.endDate || '',
      nextDueDate: rule.nextDueDate,
      paymentMethod: rule.paymentMethod,
      description: rule.description,
      active: rule.active,
    })
  }

  const deactivateRecurring = async (recurringId: number) => {
    if (!session) return

    setWorking(true)
    try {
      await runApi('recurring', 'DELETE', `/recurring/${recurringId}/deactivate`)
      await fetchRecurring(session.userId)
      setFlash({ kind: 'success', text: 'Recurring rule deactivated' })
    } catch (error) {
      showError(error, 'Could not deactivate recurring rule')
    } finally {
      setWorking(false)
    }
  }

  const removeRecurring = async (recurringId: number) => {
    if (!session) return

    setWorking(true)
    try {
      await runApi('recurring', 'DELETE', `/recurring/${recurringId}`)
      await fetchRecurring(session.userId)
      setFlash({ kind: 'success', text: 'Recurring rule deleted' })
    } catch (error) {
      showError(error, 'Could not delete recurring rule')
    } finally {
      setWorking(false)
    }
  }

  const processRecurringNow = async () => {
    if (!session) return

    setWorking(true)
    try {
      await runApi('recurring', 'POST', '/recurring/processUpcoming')
      await Promise.all([
        fetchRecurring(session.userId),
        fetchExpenses(session.userId),
        fetchIncomes(session.userId),
        fetchBudgets(session.userId),
        fetchDashboard(session.userId),
      ])
      setFlash({ kind: 'success', text: 'Recurring due transactions processed' })
    } catch (error) {
      showError(error, 'Could not process recurring transactions')
    } finally {
      setWorking(false)
    }
  }

  const markNotificationRead = async (notificationId: number) => {
    if (!session) return

    setWorking(true)
    try {
      await runApi('notification', 'PUT', `/notifications/${notificationId}/read`)
      await fetchNotifications(session.userId)
    } catch (error) {
      showError(error, 'Could not mark notification as read')
    } finally {
      setWorking(false)
    }
  }

  const acknowledgeNotification = async (notificationId: number) => {
    if (!session) return

    setWorking(true)
    try {
      await runApi('notification', 'PUT', `/notifications/${notificationId}/acknowledge`)
      await fetchNotifications(session.userId)
    } catch (error) {
      showError(error, 'Could not acknowledge notification')
    } finally {
      setWorking(false)
    }
  }

  const markAllRead = async () => {
    if (!session) return

    setWorking(true)
    try {
      await runApi('notification', 'PUT', `/notifications/recipient/${session.userId}/read-all`)
      await fetchNotifications(session.userId)
      setFlash({ kind: 'success', text: 'All notifications marked as read' })
    } catch (error) {
      showError(error, 'Could not mark all notifications as read')
    } finally {
      setWorking(false)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    if (!session) return

    setWorking(true)
    try {
      await runApi('notification', 'DELETE', `/notifications/${notificationId}`)
      await fetchNotifications(session.userId)
    } catch (error) {
      showError(error, 'Could not delete notification')
    } finally {
      setWorking(false)
    }
  }

  const updateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session) return

    setWorking(true)
    try {
      const updated = await runApi<UserProfile>(
        'auth',
        'PUT',
        `/auth/profile/${session.userId}`,
        undefined,
        {
          fullName: profileName,
          email: profileEmail,
          timezone: profileTimezone,
          avatarUrl: profileAvatar,
          bio: profileBio,
        },
      )
      syncProfileForm({
        ...updated,
        monthlyBudget: toNumber(updated.monthlyBudget),
      })
      setFlash({ kind: 'success', text: 'Profile updated' })
    } catch (error) {
      showError(error, 'Could not update profile')
    } finally {
      setWorking(false)
    }
  }

  const updateCurrency = async () => {
    if (!session) return

    setWorking(true)
    try {
      const updated = await runApi<UserProfile>(
        'auth',
        'PUT',
        `/auth/currency/${session.userId}`,
        undefined,
        {
          currency: profileCurrency,
        },
      )
      syncProfileForm({
        ...updated,
        monthlyBudget: toNumber(updated.monthlyBudget),
      })
      setFlash({ kind: 'success', text: 'Currency preference updated' })
    } catch (error) {
      showError(error, 'Could not update currency')
    } finally {
      setWorking(false)
    }
  }

  const updateMonthlyBudget = async () => {
    if (!session) return

    setWorking(true)
    try {
      const updated = await runApi<UserProfile>(
        'auth',
        'PUT',
        `/auth/monthly-budget/${session.userId}`,
        undefined,
        {
          monthlyBudget: toNumber(profileMonthlyBudget),
        },
      )
      syncProfileForm({
        ...updated,
        monthlyBudget: toNumber(updated.monthlyBudget),
      })
      await fetchDashboard(session.userId)
      setFlash({ kind: 'success', text: 'Monthly budget goal updated' })
    } catch (error) {
      showError(error, 'Could not update monthly budget goal')
    } finally {
      setWorking(false)
    }
  }

  const deactivateAccount = async () => {
    if (!session) return

    setWorking(true)
    try {
      await runApi('auth', 'DELETE', `/auth/deactivate/${session.userId}`)
      persistSession(null)
      setFlash({ kind: 'success', text: 'Account deactivated' })
    } catch (error) {
      showError(error, 'Could not deactivate account')
    } finally {
      setWorking(false)
    }
  }

  const primaryCurrency = profile?.currency || 'USD'

  const dashboardData = {
    sessionUserId: session?.userId ?? 0,
    profile,
    primaryCurrency,
    categoryNameMap,
    resolveCategoryLabel,
    expenseCategories,
    incomeCategories,
    unreadCount,
    overviewCards,
    pieData,
    monthlySummary,
    forecastValue,
    healthScore,
    recentExpenses,
    recentIncomes,
    expenses,
    incomes,
    categories,
    budgets,
    budgetAlerts,
    recurringRules,
    upcomingRecurring,
    notifications,
    analyticsYear,
    analyticsMonth,
    analyticsTrailingMonths,
    setAnalyticsYear,
    setAnalyticsMonth,
    setAnalyticsTrailingMonths,
    incomeVsExpenseTrend,
    dailyTrend,
    savingsTrend,
    cashflowTrend,
    topCategories,
    expenseForm,
    setExpenseForm,
    saveExpense,
    editExpense,
    removeExpense,
    expenseKeyword,
    setExpenseKeyword,
    fetchExpenses,
    editingExpenseId,
    setEditingExpenseId,
    defaultExpenseForm,
    incomeForm,
    setIncomeForm,
    saveIncome,
    editIncome,
    removeIncome,
    incomeKeyword,
    setIncomeKeyword,
    fetchIncomes,
    editingIncomeId,
    setEditingIncomeId,
    defaultIncomeForm,
    categoryForm,
    setCategoryForm,
    saveCategory,
    editCategory,
    removeCategory,
    initDefaultCategories,
    editingCategoryId,
    setEditingCategoryId,
    defaultCategoryForm,
    budgetForm,
    setBudgetForm,
    saveBudget,
    editBudget,
    removeBudget,
    dispatchBudgetAlerts,
    editingBudgetId,
    setEditingBudgetId,
    defaultBudgetForm,
    recurringForm,
    setRecurringForm,
    saveRecurring,
    editRecurring,
    deactivateRecurring,
    removeRecurring,
    processRecurringNow,
    editingRecurringId,
    setEditingRecurringId,
    defaultRecurringForm,
    markNotificationRead,
    acknowledgeNotification,
    deleteNotification,
    markAllRead,
    profileName,
    setProfileName,
    profileEmail,
    setProfileEmail,
    profileTimezone,
    setProfileTimezone,
    profileAvatar,
    setProfileAvatar,
    profileBio,
    setProfileBio,
    profileCurrency,
    setProfileCurrency,
    profileMonthlyBudget,
    setProfileMonthlyBudget,
    updateProfile,
    updateCurrency,
    updateMonthlyBudget,
    deactivateAccount,
    working,
    formatMoney,
    session,
  }

  const authData = {
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    onLogin,
    startOAuthLogin,
    registerFullName,
    setRegisterFullName,
    registerEmail,
    setRegisterEmail,
    registerPassword,
    setRegisterPassword,
    registerCurrency,
    setRegisterCurrency,
    registerTimezone,
    setRegisterTimezone,
    registerMonthlyBudget,
    setRegisterMonthlyBudget,
    onRegister,
    working,
    flash,
  }

  return (
    <BrowserRouter>
      {session ? (
        <AppShell onLogout={onLogout} profile={profile} unreadCount={unreadCount} working={working}>
          <Routes>
            <Route element={<Navigate replace to="/overview" />} path="/" />
            <Route element={<Overview data={dashboardData} />} path="/overview" />
            <Route element={<ExpensesPage data={dashboardData} />} path="/expenses" />
            <Route element={<ExpenseDetail data={dashboardData} />} path="/expenses/:id" />
            <Route element={<IncomePage data={dashboardData} />} path="/income" />
            <Route element={<IncomeDetail data={dashboardData} />} path="/income/:id" />
            <Route element={<CategoriesPage data={dashboardData} />} path="/categories" />
            <Route element={<CategoryDetail data={dashboardData} />} path="/categories/:id" />
            <Route element={<BudgetsPage data={dashboardData} />} path="/budgets" />
            <Route element={<BudgetDetail data={dashboardData} />} path="/budgets/:id" />
            <Route element={<RecurringPage data={dashboardData} />} path="/recurring" />
            <Route element={<RecurringDetail data={dashboardData} />} path="/recurring/:id" />
            <Route element={<NotificationsPage data={dashboardData} />} path="/notifications" />
            <Route element={<ProfilePage data={dashboardData} />} path="/profile" />
            <Route element={<Navigate replace to="/overview" />} path="*" />
          </Routes>
        </AppShell>
      ) : (
        <Routes>
          <Route element={<Landing />} path="/" />
          <Route element={<LoginPage data={authData} />} path="/login" />
          <Route element={<SignupPage data={authData} />} path="/signup" />
          <Route element={<OAuthCallback data={authData} />} path="/oauth/callback/:provider" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      )}
    </BrowserRouter>
  )
}

export default App
