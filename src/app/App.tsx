import { useEffect, useMemo, useState } from 'react'
import axios, { type Method } from 'axios'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { config } from '@/config/config'

type ServiceKey = keyof typeof config.api.services

type TabKey =
  | 'overview'
  | 'expenses'
  | 'income'
  | 'categories'
  | 'budgets'
  | 'recurring'
  | 'notifications'
  | 'profile'

type Flash = {
  kind: 'success' | 'error'
  text: string
}

type Session = {
  token: string
  userId: number
  email: string
}

type UserProfile = {
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

type Expense = {
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

type Income = {
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

type Category = {
  categoryId: number
  userId: number
  name: string
  type: 'EXPENSE' | 'INCOME'
  icon: string
  colorCode: string
  budgetLimit?: number
  defaultCategory: boolean
}

type Budget = {
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

type BudgetProgress = {
  budgetId: number
  limitAmount: number
  spentAmount: number
  percentageUsed: number
  remainingAmount: number
  thresholdReached: boolean
  exceeded: boolean
}

type RecurringRule = {
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

type Notification = {
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

type SummaryCard = {
  label: string
  value: string
  tone?: 'good' | 'bad' | 'neutral'
}

type MonthlySummary = {
  totalIncome: number
  totalExpenses: number
  netSavings: number
  savingsRate: number
  topCategory: string
}

type TrendRow = {
  period: string
  income?: number
  expense?: number
  inflow?: number
  outflow?: number
  net?: number
  savingsRate?: number
}

type BreakdownRow = {
  category: string
  amount: number
}

type DailyTrendRow = {
  day: number
  expense: number
}

type ExpenseForm = {
  title: string
  amount: string
  categoryId: string
  date: string
  paymentMethod: Expense['paymentMethod']
  notes: string
  receiptUrl: string
  recurring: boolean
}

type IncomeForm = {
  title: string
  amount: string
  categoryId: string
  source: Income['source']
  date: string
  notes: string
  recurring: boolean
  recurrencePeriod: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
}

type CategoryForm = {
  name: string
  type: Category['type']
  icon: string
  colorCode: string
}

type BudgetForm = {
  name: string
  categoryId: string
  limitAmount: string
  period: Budget['period']
  alertThreshold: string
  startDate: string
  endDate: string
  active: boolean
}

type RecurringForm = {
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

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const today = new Date().toISOString().slice(0, 10)
const now = new Date()

const sessionStorageKey = 'spendsmart.session.v1'

const piePalette = ['#d9472b', '#ef8d32', '#ffd166', '#2a9d8f', '#3478f6', '#7e58b6']

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
  colorCode: '#ef8d32',
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
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
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

  const categoryNameMap = useMemo(() => {
    return new Map(categories.map((category) => [category.categoryId, category.name]))
  }, [categories])

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
        value: monthlySummary.topCategory,
      },
      {
        label: 'Unread Notifications',
        value: String(unreadCount),
        tone: unreadCount > 0 ? 'bad' : 'good',
      },
    ]
  }, [forecastValue, healthScore, monthlySummary, profile?.currency, unreadCount])

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

    const alerts = await runApi<BudgetProgress[]>(
      'budget',
      'GET',
      `/budgets/alerts/${userId}`,
    )

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

    const [summaryRaw, breakdownRaw, trendRaw, dailyRaw, savingsRaw, cashflowRaw, topRaw, forecastRaw] =
      await Promise.all([
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
      topCategory:
        typeof summaryRaw.topCategory === 'string'
          ? summaryRaw.topCategory
          : 'Uncategorised',
    })

    setCategoryBreakdown(
      breakdownRaw.map((row) => ({
        category: String(row.category ?? 'category-unknown'),
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
        category: String(row.category ?? 'unknown'),
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
        window.history.replaceState({}, '', '/')
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

  const onLogin = async (event: React.FormEvent<HTMLFormElement>) => {
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

  const onRegister = async (event: React.FormEvent<HTMLFormElement>) => {
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
      // no-op; local logout should still happen.
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

  const saveExpense = async (event: React.FormEvent<HTMLFormElement>) => {
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

  const saveIncome = async (event: React.FormEvent<HTMLFormElement>) => {
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

  const saveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
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
        await runApi(
          'category',
          'PUT',
          `/categories/${editingCategoryId}`,
          undefined,
          payload,
        )
      } else {
        await runApi('category', 'POST', '/categories', undefined, payload)
      }

      setCategoryForm(defaultCategoryForm)
      setEditingCategoryId(null)
      await fetchCategories(session.userId)
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
      colorCode: category.colorCode || '#ef8d32',
    })
  }

  const removeCategory = async (categoryId: number) => {
    if (!session) return

    setWorking(true)
    try {
      await runApi('category', 'DELETE', `/categories/${categoryId}`)
      await fetchCategories(session.userId)
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
      await fetchCategories(session.userId)
      setFlash({ kind: 'success', text: 'Default categories initialized' })
    } catch (error) {
      showError(error, 'Could not initialize default categories')
    } finally {
      setWorking(false)
    }
  }

  const saveBudget = async (event: React.FormEvent<HTMLFormElement>) => {
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

  const saveRecurring = async (event: React.FormEvent<HTMLFormElement>) => {
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
        await runApi(
          'recurring',
          'PUT',
          `/recurring/${editingRecurringId}`,
          undefined,
          payload,
        )
      } else {
        await runApi('recurring', 'POST', '/recurring', undefined, payload)
      }

      setRecurringForm(defaultRecurringForm)
      setEditingRecurringId(null)
      await fetchRecurring(session.userId)
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

  const updateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
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

  if (!session) {
    return (
      <main className="app-shell app-auth-shell">
        <header className="hero">
          <p className="hero-kicker">SpendSmart Case Study Implementation</p>
          <h1>Track. Visualize. Save. Grow.</h1>
          <p>
            Production-style frontend wired to all 8 backend services: Auth,
            Expense, Income, Category, Budget, Analytics, Recurring, and
            Notifications.
          </p>
        </header>

        {flash ? (
          <p className={`flash flash-${flash.kind}`}>{flash.text}</p>
        ) : null}

        <section className="auth-grid">
          <article className="panel">
            <h2>Login</h2>
            <form className="stack" onSubmit={onLogin}>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                />
              </label>
              <label>
                Password
                <input
                  required
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                />
              </label>
              <button disabled={working} type="submit">
                {working ? 'Working...' : 'Login'}
              </button>
            </form>
            <div className="oauth-stack">
              <p className="muted">Or continue with</p>
              <div className="oauth-buttons">
                <button
                  className="button-oauth button-google"
                  disabled={working}
                  onClick={() => void startOAuthLogin('google')}
                  type="button"
                >
                  Google
                </button>
                <button
                  className="button-oauth button-github"
                  disabled={working}
                  onClick={() => void startOAuthLogin('github')}
                  type="button"
                >
                  GitHub
                </button>
              </div>
            </div>
          </article>

          <article className="panel">
            <h2>Register</h2>
            <form className="stack" onSubmit={onRegister}>
              <label>
                Full Name
                <input
                  required
                  value={registerFullName}
                  onChange={(event) => setRegisterFullName(event.target.value)}
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={registerEmail}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                />
              </label>
              <label>
                Password
                <input
                  required
                  type="password"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                />
              </label>
              <div className="row row-2">
                <label>
                  Currency
                  <select
                    value={registerCurrency}
                    onChange={(event) => setRegisterCurrency(event.target.value)}
                  >
                    {['USD', 'INR', 'EUR', 'GBP'].map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Timezone
                  <input
                    value={registerTimezone}
                    onChange={(event) => setRegisterTimezone(event.target.value)}
                  />
                </label>
              </div>
              <label>
                Monthly Budget Goal
                <input
                  min="0"
                  step="0.01"
                  type="number"
                  value={registerMonthlyBudget}
                  onChange={(event) =>
                    setRegisterMonthlyBudget(event.target.value)
                  }
                />
              </label>
              <button disabled={working} type="submit">
                {working ? 'Working...' : 'Create Account'}
              </button>
            </form>
          </article>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="hero hero-dashboard">
        <div>
          <p className="hero-kicker">SpendSmart Dashboard</p>
          <h1>{profile?.fullName || session.email}</h1>
          <p>
            Functional end-to-end finance app with live microservice orchestration
            and visualization.
          </p>
        </div>
        <div className="hero-actions">
          <span className="chip">
            User #{session.userId} · {profile?.currency || 'USD'}
          </span>
          <button className="button-soft" disabled={working} onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </header>

      {flash ? <p className={`flash flash-${flash.kind}`}>{flash.text}</p> : null}

      <nav className="tab-row">
        {(
          [
            ['overview', 'Overview'],
            ['expenses', 'Expenses'],
            ['income', 'Income'],
            ['categories', 'Categories'],
            ['budgets', 'Budgets'],
            ['recurring', 'Recurring'],
            ['notifications', `Notifications (${unreadCount})`],
            ['profile', 'Profile'],
          ] as Array<[TabKey, string]>
        ).map(([tab, label]) => (
          <button
            className={tab === activeTab ? 'tab-active' : ''}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' ? (
        <section className="stack-lg">
          <article className="panel">
            <h2>Analytics Controls</h2>
            <div className="row row-3">
              <label>
                Year
                <input
                  type="number"
                  value={analyticsYear}
                  onChange={(event) => setAnalyticsYear(event.target.value)}
                />
              </label>
              <label>
                Month
                <input
                  max="12"
                  min="1"
                  type="number"
                  value={analyticsMonth}
                  onChange={(event) => setAnalyticsMonth(event.target.value)}
                />
              </label>
              <label>
                Trailing Months
                <input
                  max="24"
                  min="1"
                  type="number"
                  value={analyticsTrailingMonths}
                  onChange={(event) => setAnalyticsTrailingMonths(event.target.value)}
                />
              </label>
            </div>
          </article>

          <section className="card-grid">
            {overviewCards.map((card) => (
              <article className={`stat-card tone-${card.tone || 'neutral'}`} key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </article>
            ))}
          </section>

          <section className="chart-grid">
            <article className="panel">
              <h3>Category Breakdown</h3>
              {pieData.length === 0 ? (
                <p className="muted">No category data for selected month.</p>
              ) : (
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        innerRadius={54}
                        nameKey="name"
                        outerRadius={95}
                      >
                        {pieData.map((slice, index) => (
                          <Cell key={slice.name} fill={piePalette[index % piePalette.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </article>

            <article className="panel">
              <h3>Income vs Expense Trend</h3>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={260}>
                  <BarChart data={incomeVsExpenseTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="income" fill="#2a9d8f" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expense" fill="#d9472b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel">
              <h3>Daily Expense Trend</h3>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={260}>
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      dataKey="expense"
                      stroke="#d9472b"
                      strokeWidth={3}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel">
              <h3>Savings Rate Trend</h3>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={260}>
                  <LineChart data={savingsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      dataKey="savingsRate"
                      stroke="#3478f6"
                      strokeWidth={3}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel panel-wide">
              <h3>Cash Flow</h3>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={260}>
                  <LineChart data={cashflowTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line dataKey="inflow" stroke="#2a9d8f" strokeWidth={3} type="monotone" />
                    <Line dataKey="outflow" stroke="#d9472b" strokeWidth={3} type="monotone" />
                    <Line dataKey="net" stroke="#3478f6" strokeWidth={3} type="monotone" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <article className="panel">
            <h3>Top Spending Categories</h3>
            <div className="list-grid">
              {topCategories.length === 0 ? (
                <p className="muted">No top category data yet.</p>
              ) : (
                topCategories.map((item) => (
                  <div className="list-row" key={`${item.category}-${item.amount}`}>
                    <span>{item.category}</span>
                    <strong>{formatMoney(item.amount, primaryCurrency)}</strong>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === 'expenses' ? (
        <section className="stack-lg">
          <article className="panel">
            <h2>{editingExpenseId ? 'Edit Expense' : 'Add Expense'}</h2>
            <form className="stack" onSubmit={saveExpense}>
              <div className="row row-3">
                <label>
                  Title
                  <input
                    required
                    value={expenseForm.title}
                    onChange={(event) =>
                      setExpenseForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Amount
                  <input
                    min="0"
                    required
                    step="0.01"
                    type="number"
                    value={expenseForm.amount}
                    onChange={(event) =>
                      setExpenseForm((prev) => ({ ...prev, amount: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Category
                  <select
                    required
                    value={expenseForm.categoryId}
                    onChange={(event) =>
                      setExpenseForm((prev) => ({ ...prev, categoryId: event.target.value }))
                    }
                  >
                    <option value="">Select</option>
                    {expenseCategories.map((category) => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="row row-3">
                <label>
                  Date
                  <input
                    required
                    type="date"
                    value={expenseForm.date}
                    onChange={(event) =>
                      setExpenseForm((prev) => ({ ...prev, date: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Payment Method
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(event) =>
                      setExpenseForm((prev) => ({
                        ...prev,
                        paymentMethod: event.target.value as Expense['paymentMethod'],
                      }))
                    }
                  >
                    {['CASH', 'CARD', 'UPI', 'BANK', 'WALLET'].map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="checkbox-label">
                  <input
                    checked={expenseForm.recurring}
                    onChange={(event) =>
                      setExpenseForm((prev) => ({ ...prev, recurring: event.target.checked }))
                    }
                    type="checkbox"
                  />
                  Mark as recurring
                </label>
              </div>
              <label>
                Notes
                <textarea
                  rows={3}
                  value={expenseForm.notes}
                  onChange={(event) =>
                    setExpenseForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                />
              </label>
              <label>
                Receipt URL
                <input
                  placeholder="https://..."
                  value={expenseForm.receiptUrl}
                  onChange={(event) =>
                    setExpenseForm((prev) => ({ ...prev, receiptUrl: event.target.value }))
                  }
                />
              </label>
              <div className="button-row">
                <button disabled={working} type="submit">
                  {working ? 'Saving...' : editingExpenseId ? 'Update Expense' : 'Add Expense'}
                </button>
                {editingExpenseId ? (
                  <button
                    className="button-soft"
                    onClick={() => {
                      setEditingExpenseId(null)
                      setExpenseForm(defaultExpenseForm)
                    }}
                    type="button"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>
          </article>

          <article className="panel">
            <div className="row row-2 row-bottom">
              <h3>Expense List ({expenses.length})</h3>
              <div className="row row-2">
                <input
                  placeholder="Search title/notes"
                  value={expenseKeyword}
                  onChange={(event) => setExpenseKeyword(event.target.value)}
                />
                <button
                  className="button-soft"
                  disabled={working}
                  onClick={() => void fetchExpenses(session.userId)}
                  type="button"
                >
                  Search
                </button>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.expenseId}>
                      <td>{expense.date}</td>
                      <td>{expense.title}</td>
                      <td>{categoryNameMap.get(expense.categoryId) || expense.categoryId}</td>
                      <td>{formatMoney(expense.amount, primaryCurrency)}</td>
                      <td className="actions-cell">
                        <button onClick={() => editExpense(expense)} type="button">
                          Edit
                        </button>
                        <button
                          className="button-danger"
                          onClick={() => void removeExpense(expense.expenseId)}
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === 'income' ? (
        <section className="stack-lg">
          <article className="panel">
            <h2>{editingIncomeId ? 'Edit Income' : 'Add Income'}</h2>
            <form className="stack" onSubmit={saveIncome}>
              <div className="row row-3">
                <label>
                  Title
                  <input
                    required
                    value={incomeForm.title}
                    onChange={(event) =>
                      setIncomeForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Amount
                  <input
                    min="0"
                    required
                    step="0.01"
                    type="number"
                    value={incomeForm.amount}
                    onChange={(event) =>
                      setIncomeForm((prev) => ({ ...prev, amount: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Category
                  <select
                    required
                    value={incomeForm.categoryId}
                    onChange={(event) =>
                      setIncomeForm((prev) => ({ ...prev, categoryId: event.target.value }))
                    }
                  >
                    <option value="">Select</option>
                    {incomeCategories.map((category) => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="row row-3">
                <label>
                  Source
                  <select
                    value={incomeForm.source}
                    onChange={(event) =>
                      setIncomeForm((prev) => ({
                        ...prev,
                        source: event.target.value as Income['source'],
                      }))
                    }
                  >
                    {['SALARY', 'FREELANCE', 'BUSINESS', 'INVESTMENT', 'GIFT', 'OTHER'].map(
                      (source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label>
                  Date
                  <input
                    required
                    type="date"
                    value={incomeForm.date}
                    onChange={(event) =>
                      setIncomeForm((prev) => ({ ...prev, date: event.target.value }))
                    }
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    checked={incomeForm.recurring}
                    onChange={(event) =>
                      setIncomeForm((prev) => ({ ...prev, recurring: event.target.checked }))
                    }
                    type="checkbox"
                  />
                  Recurring income
                </label>
              </div>
              {incomeForm.recurring ? (
                <label>
                  Recurrence Period
                  <select
                    value={incomeForm.recurrencePeriod}
                    onChange={(event) =>
                      setIncomeForm((prev) => ({
                        ...prev,
                        recurrencePeriod: event.target
                          .value as IncomeForm['recurrencePeriod'],
                      }))
                    }
                  >
                    {['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'].map(
                      (period) => (
                        <option key={period} value={period}>
                          {period}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              ) : null}
              <label>
                Notes
                <textarea
                  rows={3}
                  value={incomeForm.notes}
                  onChange={(event) =>
                    setIncomeForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                />
              </label>
              <div className="button-row">
                <button disabled={working} type="submit">
                  {working ? 'Saving...' : editingIncomeId ? 'Update Income' : 'Add Income'}
                </button>
                {editingIncomeId ? (
                  <button
                    className="button-soft"
                    onClick={() => {
                      setEditingIncomeId(null)
                      setIncomeForm(defaultIncomeForm)
                    }}
                    type="button"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>
          </article>

          <article className="panel">
            <div className="row row-2 row-bottom">
              <h3>Income List ({incomes.length})</h3>
              <div className="row row-2">
                <input
                  placeholder="Search title/notes"
                  value={incomeKeyword}
                  onChange={(event) => setIncomeKeyword(event.target.value)}
                />
                <button
                  className="button-soft"
                  disabled={working}
                  onClick={() => void fetchIncomes(session.userId)}
                  type="button"
                >
                  Search
                </button>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Source</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((income) => (
                    <tr key={income.incomeId}>
                      <td>{income.date}</td>
                      <td>{income.title}</td>
                      <td>{income.source}</td>
                      <td>{formatMoney(income.amount, primaryCurrency)}</td>
                      <td className="actions-cell">
                        <button onClick={() => editIncome(income)} type="button">
                          Edit
                        </button>
                        <button
                          className="button-danger"
                          onClick={() => void removeIncome(income.incomeId)}
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === 'categories' ? (
        <section className="stack-lg">
          <article className="panel">
            <div className="row row-2 row-bottom">
              <h2>{editingCategoryId ? 'Edit Category' : 'Create Category'}</h2>
              <button className="button-soft" disabled={working} onClick={initDefaultCategories} type="button">
                Seed Default Categories
              </button>
            </div>
            <form className="stack" onSubmit={saveCategory}>
              <div className="row row-4">
                <label>
                  Name
                  <input
                    required
                    value={categoryForm.name}
                    onChange={(event) =>
                      setCategoryForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Type
                  <select
                    value={categoryForm.type}
                    onChange={(event) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        type: event.target.value as Category['type'],
                      }))
                    }
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </label>
                <label>
                  Icon
                  <input
                    value={categoryForm.icon}
                    onChange={(event) =>
                      setCategoryForm((prev) => ({ ...prev, icon: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Color
                  <input
                    type="color"
                    value={categoryForm.colorCode}
                    onChange={(event) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        colorCode: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <div className="button-row">
                <button disabled={working} type="submit">
                  {working
                    ? 'Saving...'
                    : editingCategoryId
                      ? 'Update Category'
                      : 'Create Category'}
                </button>
                {editingCategoryId ? (
                  <button
                    className="button-soft"
                    onClick={() => {
                      setEditingCategoryId(null)
                      setCategoryForm(defaultCategoryForm)
                    }}
                    type="button"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>
          </article>

          <article className="panel">
            <h3>Categories ({categories.length})</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Budget Limit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.categoryId}>
                      <td>
                        <span style={{ color: category.colorCode || '#2a1a12' }}>
                          {category.icon} {category.name}
                        </span>
                      </td>
                      <td>{category.type}</td>
                      <td>
                        {category.budgetLimit
                          ? formatMoney(toNumber(category.budgetLimit), primaryCurrency)
                          : '—'}
                      </td>
                      <td className="actions-cell">
                        <button onClick={() => editCategory(category)} type="button">
                          Edit
                        </button>
                        <button
                          className="button-danger"
                          onClick={() => void removeCategory(category.categoryId)}
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === 'budgets' ? (
        <section className="stack-lg">
          <article className="panel">
            <div className="row row-2 row-bottom">
              <h2>{editingBudgetId ? 'Edit Budget' : 'Create Budget'}</h2>
              <button
                className="button-soft"
                disabled={working}
                onClick={dispatchBudgetAlerts}
                type="button"
              >
                Dispatch Active Alerts
              </button>
            </div>
            <form className="stack" onSubmit={saveBudget}>
              <div className="row row-4">
                <label>
                  Name
                  <input
                    required
                    value={budgetForm.name}
                    onChange={(event) =>
                      setBudgetForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Category (optional)
                  <select
                    value={budgetForm.categoryId}
                    onChange={(event) =>
                      setBudgetForm((prev) => ({ ...prev, categoryId: event.target.value }))
                    }
                  >
                    <option value="">Overall budget</option>
                    {expenseCategories.map((category) => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Limit Amount
                  <input
                    min="0"
                    required
                    step="0.01"
                    type="number"
                    value={budgetForm.limitAmount}
                    onChange={(event) =>
                      setBudgetForm((prev) => ({
                        ...prev,
                        limitAmount: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Alert %
                  <input
                    max="100"
                    min="1"
                    step="1"
                    type="number"
                    value={budgetForm.alertThreshold}
                    onChange={(event) =>
                      setBudgetForm((prev) => ({
                        ...prev,
                        alertThreshold: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="row row-3">
                <label>
                  Period
                  <select
                    value={budgetForm.period}
                    onChange={(event) =>
                      setBudgetForm((prev) => ({
                        ...prev,
                        period: event.target.value as Budget['period'],
                      }))
                    }
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </label>
                <label>
                  Start Date
                  <input
                    disabled={budgetForm.period !== 'CUSTOM'}
                    type="date"
                    value={budgetForm.startDate}
                    onChange={(event) =>
                      setBudgetForm((prev) => ({ ...prev, startDate: event.target.value }))
                    }
                  />
                </label>
                <label>
                  End Date
                  <input
                    disabled={budgetForm.period !== 'CUSTOM'}
                    type="date"
                    value={budgetForm.endDate}
                    onChange={(event) =>
                      setBudgetForm((prev) => ({ ...prev, endDate: event.target.value }))
                    }
                  />
                </label>
              </div>

              <label className="checkbox-label">
                <input
                  checked={budgetForm.active}
                  onChange={(event) =>
                    setBudgetForm((prev) => ({ ...prev, active: event.target.checked }))
                  }
                  type="checkbox"
                />
                Budget is active
              </label>

              <div className="button-row">
                <button disabled={working} type="submit">
                  {working ? 'Saving...' : editingBudgetId ? 'Update Budget' : 'Create Budget'}
                </button>
                {editingBudgetId ? (
                  <button
                    className="button-soft"
                    onClick={() => {
                      setEditingBudgetId(null)
                      setBudgetForm(defaultBudgetForm)
                    }}
                    type="button"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>
          </article>

          <article className="panel">
            <h3>Budget Progress</h3>
            <div className="budget-grid">
              {budgets.map((budget) => {
                const usedPercent =
                  budget.limitAmount > 0
                    ? (budget.spentAmount / budget.limitAmount) * 100
                    : 0
                const safePercent = Math.max(0, Math.min(100, usedPercent))

                return (
                  <div className="budget-card" key={budget.budgetId}>
                    <div className="row row-2 row-bottom">
                      <strong>{budget.name}</strong>
                      <span>{usedPercent.toFixed(1)}%</span>
                    </div>
                    <p>
                      {formatMoney(budget.spentAmount, primaryCurrency)} /{' '}
                      {formatMoney(budget.limitAmount, primaryCurrency)}
                    </p>
                    <div className="progress-track">
                      <div
                        className={`progress-bar ${usedPercent >= budget.alertThreshold ? 'progress-alert' : ''}`}
                        style={{ width: `${safePercent}%` }}
                      />
                    </div>
                    <div className="actions-cell">
                      <button onClick={() => editBudget(budget)} type="button">
                        Edit
                      </button>
                      <button
                        className="button-danger"
                        onClick={() => void removeBudget(budget.budgetId)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </article>

          <article className="panel">
            <h3>Active Alerts ({budgetAlerts.length})</h3>
            <div className="list-grid">
              {budgetAlerts.length === 0 ? (
                <p className="muted">No thresholds reached yet.</p>
              ) : (
                budgetAlerts.map((alert) => (
                  <div className="list-row" key={alert.budgetId}>
                    <span>Budget #{alert.budgetId}</span>
                    <strong>{alert.percentageUsed.toFixed(2)}%</strong>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === 'recurring' ? (
        <section className="stack-lg">
          <article className="panel">
            <div className="row row-2 row-bottom">
              <h2>{editingRecurringId ? 'Edit Recurring Rule' : 'Add Recurring Rule'}</h2>
              <button className="button-soft" disabled={working} onClick={processRecurringNow} type="button">
                Process Due Now
              </button>
            </div>
            <form className="stack" onSubmit={saveRecurring}>
              <div className="row row-4">
                <label>
                  Title
                  <input
                    required
                    value={recurringForm.title}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Amount
                  <input
                    min="0"
                    required
                    step="0.01"
                    type="number"
                    value={recurringForm.amount}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({ ...prev, amount: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Type
                  <select
                    value={recurringForm.type}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({
                        ...prev,
                        type: event.target.value as RecurringRule['type'],
                      }))
                    }
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </label>
                <label>
                  Category
                  <select
                    required
                    value={recurringForm.categoryId}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({ ...prev, categoryId: event.target.value }))
                    }
                  >
                    <option value="">Select</option>
                    {(recurringForm.type === 'EXPENSE' ? expenseCategories : incomeCategories).map(
                      (category) => (
                        <option key={category.categoryId} value={category.categoryId}>
                          {category.name}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>
              <div className="row row-4">
                <label>
                  Frequency
                  <select
                    value={recurringForm.frequency}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({
                        ...prev,
                        frequency: event.target.value as RecurringRule['frequency'],
                      }))
                    }
                  >
                    {['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'].map((frequency) => (
                      <option key={frequency} value={frequency}>
                        {frequency}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Start Date
                  <input
                    type="date"
                    value={recurringForm.startDate}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({ ...prev, startDate: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Next Due Date
                  <input
                    type="date"
                    value={recurringForm.nextDueDate}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({
                        ...prev,
                        nextDueDate: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  End Date
                  <input
                    type="date"
                    value={recurringForm.endDate}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({ ...prev, endDate: event.target.value }))
                    }
                  />
                </label>
              </div>
              <div className="row row-2">
                <label>
                  Payment Method
                  <select
                    value={recurringForm.paymentMethod}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({
                        ...prev,
                        paymentMethod: event.target
                          .value as RecurringRule['paymentMethod'],
                      }))
                    }
                  >
                    {['CASH', 'CARD', 'UPI', 'BANK', 'WALLET'].map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="checkbox-label">
                  <input
                    checked={recurringForm.active}
                    onChange={(event) =>
                      setRecurringForm((prev) => ({ ...prev, active: event.target.checked }))
                    }
                    type="checkbox"
                  />
                  Active rule
                </label>
              </div>
              <label>
                Description
                <textarea
                  rows={3}
                  value={recurringForm.description}
                  onChange={(event) =>
                    setRecurringForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </label>
              <div className="button-row">
                <button disabled={working} type="submit">
                  {working
                    ? 'Saving...'
                    : editingRecurringId
                      ? 'Update Rule'
                      : 'Create Rule'}
                </button>
                {editingRecurringId ? (
                  <button
                    className="button-soft"
                    onClick={() => {
                      setEditingRecurringId(null)
                      setRecurringForm(defaultRecurringForm)
                    }}
                    type="button"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>
          </article>

          <article className="panel">
            <h3>Recurring Rules ({recurringRules.length})</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Frequency</th>
                    <th>Next Due</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recurringRules.map((rule) => (
                    <tr key={rule.recurringId}>
                      <td>{rule.title}</td>
                      <td>{rule.type}</td>
                      <td>{rule.frequency}</td>
                      <td>{rule.nextDueDate}</td>
                      <td>{formatMoney(rule.amount, primaryCurrency)}</td>
                      <td className="actions-cell">
                        <button onClick={() => editRecurring(rule)} type="button">
                          Edit
                        </button>
                        <button
                          className="button-soft"
                          onClick={() => void deactivateRecurring(rule.recurringId)}
                          type="button"
                        >
                          Deactivate
                        </button>
                        <button
                          className="button-danger"
                          onClick={() => void removeRecurring(rule.recurringId)}
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <h3>Upcoming This Month ({upcomingRecurring.length})</h3>
            <div className="list-grid">
              {upcomingRecurring.length === 0 ? (
                <p className="muted">No recurring dues this month.</p>
              ) : (
                upcomingRecurring.map((rule) => (
                  <div className="list-row" key={`upcoming-${rule.recurringId}`}>
                    <span>
                      {rule.title} ({rule.type})
                    </span>
                    <strong>{rule.nextDueDate}</strong>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === 'notifications' ? (
        <section className="stack-lg">
          <article className="panel">
            <div className="row row-2 row-bottom">
              <h2>Notification Center</h2>
              <button className="button-soft" disabled={working} onClick={markAllRead} type="button">
                Mark All Read
              </button>
            </div>
            <div className="list-grid">
              {notifications.length === 0 ? (
                <p className="muted">No notifications yet.</p>
              ) : (
                notifications.map((notification) => (
                  <article
                    className={`notification-card severity-${notification.severity.toLowerCase()}`}
                    key={notification.notificationId}
                  >
                    <div className="row row-2 row-bottom">
                      <strong>{notification.title}</strong>
                      <span>{notification.type}</span>
                    </div>
                    <p>{notification.message}</p>
                    <small>{new Date(notification.createdAt).toLocaleString()}</small>
                    <div className="actions-cell">
                      {!notification.read ? (
                        <button
                          onClick={() => void markNotificationRead(notification.notificationId)}
                          type="button"
                        >
                          Mark Read
                        </button>
                      ) : null}
                      {!notification.acknowledged ? (
                        <button
                          className="button-soft"
                          onClick={() =>
                            void acknowledgeNotification(notification.notificationId)
                          }
                          type="button"
                        >
                          Acknowledge
                        </button>
                      ) : null}
                      <button
                        className="button-danger"
                        onClick={() => void deleteNotification(notification.notificationId)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === 'profile' ? (
        <section className="stack-lg">
          <article className="panel">
            <h2>Profile</h2>
            <form className="stack" onSubmit={updateProfile}>
              <div className="row row-2">
                <label>
                  Full Name
                  <input
                    required
                    value={profileName}
                    onChange={(event) => setProfileName(event.target.value)}
                  />
                </label>
                <label>
                  Email
                  <input
                    required
                    type="email"
                    value={profileEmail}
                    onChange={(event) => setProfileEmail(event.target.value)}
                  />
                </label>
              </div>
              <div className="row row-2">
                <label>
                  Timezone
                  <input
                    value={profileTimezone}
                    onChange={(event) => setProfileTimezone(event.target.value)}
                  />
                </label>
                <label>
                  Avatar URL
                  <input
                    value={profileAvatar}
                    onChange={(event) => setProfileAvatar(event.target.value)}
                  />
                </label>
              </div>
              <label>
                Bio
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(event) => setProfileBio(event.target.value)}
                />
              </label>
              <button disabled={working} type="submit">
                {working ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </article>

          <article className="panel">
            <h3>Preferences</h3>
            <div className="row row-2">
              <label>
                Currency
                <select
                  value={profileCurrency}
                  onChange={(event) => setProfileCurrency(event.target.value)}
                >
                  {['USD', 'INR', 'EUR', 'GBP'].map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </label>
              <div className="button-row align-end">
                <button disabled={working} onClick={updateCurrency} type="button">
                  Save Currency
                </button>
              </div>
            </div>

            <div className="row row-2">
              <label>
                Monthly Budget Goal
                <input
                  min="0"
                  step="0.01"
                  type="number"
                  value={profileMonthlyBudget}
                  onChange={(event) => setProfileMonthlyBudget(event.target.value)}
                />
              </label>
              <div className="button-row align-end">
                <button disabled={working} onClick={updateMonthlyBudget} type="button">
                  Save Goal
                </button>
              </div>
            </div>

            <div className="danger-zone">
              <p>
                Deactivate account keeps data for audit but blocks login and app access.
              </p>
              <button
                className="button-danger"
                disabled={working}
                onClick={deactivateAccount}
                type="button"
              >
                Deactivate Account
              </button>
            </div>
          </article>
        </section>
      ) : null}
    </main>
  )
}

export default App
