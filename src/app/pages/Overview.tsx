import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
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
import ChartCard from '@/app/components/ChartCard'
import ChartTooltip from '@/app/components/ChartTooltip'
import HeroHeader from '@/app/components/HeroHeader'
import InsightCard from '@/app/components/InsightCard'
import StatCard from '@/app/components/StatCard'

const piePalette = ['#0d3b3f', '#18c29c', '#7aa6c7', '#c9a15b', '#8e9bb2', '#d7e7ea']

export default function Overview({ data }: { data: any }) {
  const {
    profile,
    overviewCards,
    pieData,
    incomeVsExpenseTrend,
    cashflowTrend,
    topCategories,
    recentExpenses,
    budgetAlerts,
    budgets,
    upcomingRecurring,
    expenses,
    formatMoney,
    primaryCurrency,
    analyticsYear,
    analyticsMonth,
    analyticsTrailingMonths,
    setAnalyticsYear,
    setAnalyticsMonth,
    setAnalyticsTrailingMonths,
    monthlySummary,
    forecastValue,
    healthScore,
    unreadCount,
    dailyTrend,
    savingsTrend,
  } = data

  const primaryCards = overviewCards.slice(0, 4)

  const secondaryCards = [
    {
      label: 'Forecast',
      value: formatMoney(forecastValue, primaryCurrency),
      tone: 'neutral',
    },
    {
      label: 'Health score',
      value: healthScore === null ? 'Unavailable' : `${healthScore.toFixed(1)} / 100`,
      tone:
        healthScore === null
          ? 'neutral'
          : healthScore >= 70
            ? 'good'
            : healthScore >= 45
              ? 'warning'
              : 'bad',
    },
    {
      label: 'Top category',
      value: monthlySummary?.topCategory || topCategories[0]?.category || '—',
      tone: 'neutral',
    },
    {
      label: 'Alerts',
      value: String(budgetAlerts.filter((alert: any) => alert.thresholdReached || alert.exceeded).length),
      tone: budgetAlerts.some((alert: any) => alert.thresholdReached || alert.exceeded)
        ? 'warning'
        : 'good',
    },
  ]

  return (
    <section className="page-stack">
      <HeroHeader
        kicker="Overview"
        title={`Good to see you, ${profile?.fullName?.split(' ')[0] || 'there'}`}
        description="Your wealth cockpit surfaces the signal first: savings, budgets, cash flow, recurring commitments, and exception alerts."
        actions={
          <>
            <Link className="button button-secondary" to="/expenses">
              Add expense
            </Link>
            <Link className="button" to="/budgets">
              Review budgets
            </Link>
          </>
        }
        meta={
          <div className="stack">
            <div className="chip-row">
              <span className="pill pill-muted">Unread {unreadCount}</span>
              <span className="pill">
                {analyticsYear}-{analyticsMonth.padStart(2, '0')}
              </span>
              <span className="pill">{analyticsTrailingMonths} mo view</span>
            </div>
            <div className="row-3">
              <label className="field">
                Year
                <input
                  type="number"
                  value={analyticsYear}
                  onChange={(event) => setAnalyticsYear(event.target.value)}
                />
              </label>
              <label className="field">
                Month
                <input
                  max="12"
                  min="1"
                  type="number"
                  value={analyticsMonth}
                  onChange={(event) => setAnalyticsMonth(event.target.value)}
                />
              </label>
              <label className="field">
                Trailing months
                <input
                  max="24"
                  min="1"
                  type="number"
                  value={analyticsTrailingMonths}
                  onChange={(event) => setAnalyticsTrailingMonths(event.target.value)}
                />
              </label>
            </div>
          </div>
        }
      />

      <section className="card-grid">
        {primaryCards.map((card: any) => (
          <StatCard
            caption={card.label === 'Financial Health Score' ? 'Model score' : undefined}
            key={card.label}
            title={card.label}
            tone={card.tone}
            value={card.value}
          />
        ))}
      </section>

      <section className="card-grid">
        {secondaryCards.map((card: any) => (
          <StatCard key={card.label} title={card.label} tone={card.tone} value={card.value} />
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="col-span-8">
          <ChartCard
            size="tall"
            title="Cash flow"
            description="Income and expense trajectories over the selected trailing window."
            action={<span className="pill">Trendline</span>}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashflowTrend}>
                <defs>
                  <linearGradient id="cashflow-inflow" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#18c29c" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#18c29c" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="cashflow-outflow" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#dc5a63" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#dc5a63" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="cashflow-net" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7aa6c7" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#7aa6c7" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf2f7" vertical={false} />
                <XAxis dataKey="period" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip currency={primaryCurrency} />} />
                <Legend />
                <Line dataKey="inflow" dot={false} stroke="#18c29c" strokeLinecap="round" strokeWidth={3} type="monotone" />
                <Line dataKey="outflow" dot={false} stroke="#dc5a63" strokeLinecap="round" strokeWidth={3} type="monotone" />
                <Line dataKey="net" dot={false} stroke="#0d3b3f" strokeLinecap="round" strokeWidth={3} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="col-span-4 rail-stack rail-stack--sticky">
          <InsightCard
            title="Monthly savings"
            value={monthlySummary ? formatMoney(monthlySummary.netSavings, primaryCurrency) : '—'}
            description="Net position after expenses."
            tone={monthlySummary && monthlySummary.netSavings >= 0 ? 'good' : 'bad'}
          />
          <InsightCard
            title="Forecast"
            value={formatMoney(forecastValue, primaryCurrency)}
            description="Projected next month balance."
            tone="neutral"
          />
          <InsightCard
            title="Health score"
            value={healthScore === null ? 'Unavailable' : `${healthScore.toFixed(1)} / 100`}
            description="Derived from spending rhythm and budget pressure."
            tone={
              healthScore === null
                ? 'neutral'
                : healthScore >= 70
                  ? 'good'
                  : healthScore >= 45
                    ? 'warning'
                    : 'bad'
            }
          />
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="col-span-8">
          <ChartCard size="default" title="Category breakdown" description="Largest monthly expense groups.">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 8, right: 24, bottom: 28, left: 24 }}>
                <Pie data={pieData} dataKey="value" innerRadius={52} nameKey="name" outerRadius={84} paddingAngle={4}>
                  {pieData.map((slice: any, index: number) => (
                    <Cell key={slice.name} fill={piePalette[index % piePalette.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip currency={primaryCurrency} />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="col-span-4">
          <ChartCard size="compact" title="Spending pulse" description="Daily expense signal for the current month.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrend}>
                <CartesianGrid stroke="#edf2f7" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip currency={primaryCurrency} />} />
                <Bar dataKey="expense" fill="#dc5a63" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="col-span-8">
          <ChartCard size="compact" title="Savings momentum" description="A rolling savings snapshot over the trailing window.">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsTrend}>
                <defs>
                  <linearGradient id="savings-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#18c29c" stopOpacity={0.38} />
                    <stop offset="100%" stopColor="#18c29c" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf2f7" vertical={false} />
                <XAxis dataKey="period" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip currency={primaryCurrency} />} />
                <Area dataKey="savingsRate" stroke="#18c29c" fill="url(#savings-area)" fillOpacity={1} strokeWidth={3} type="monotone" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="col-span-4">
          <ChartCard size="compact" title="Recent expenses" description="Quick glance at the latest transactions.">
            <div className="flow-grid">
              {(recentExpenses || expenses).slice(0, 5).map((expense: any) => (
                <Link className="flow-item" key={expense.expenseId} to={`/expenses/${expense.expenseId}`}>
                  <div>
                    <strong>{expense.title}</strong>
                    <p>{expense.date}</p>
                  </div>
                  <span>{formatMoney(expense.amount, primaryCurrency)}</span>
                </Link>
              ))}
            </div>
          </ChartCard>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="col-span-4">
          <ChartCard size="compact" title="Income vs expense" description="Monthly comparison for the trailing window.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenseTrend}>
                <CartesianGrid stroke="#edf2f7" vertical={false} />
                <XAxis dataKey="period" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip currency={primaryCurrency} />} />
                <Legend />
                <Bar dataKey="income" fill="#18c29c" radius={[10, 10, 0, 0]} />
                <Bar dataKey="expense" fill="#dc5a63" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="col-span-4">
          <ChartCard size="compact" title="Top categories" description="Highest spend categories by amount.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategories} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 12 }}>
                <CartesianGrid stroke="#edf2f7" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} width={140} tickMargin={8} />
                <Tooltip content={<ChartTooltip currency={primaryCurrency} />} />
                <Bar dataKey="amount" fill="#0d3b3f" radius={[0, 12, 12, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="col-span-4">
          <ChartCard size="compact" title="Alerts" description="Budgets needing attention.">
            <div className="flow-grid">
              {budgetAlerts.slice(0, 4).map((alert: any) => (
                <Link className="flow-item" key={alert.budgetId} to={`/budgets/${alert.budgetId}`}>
                  <div>
                    <strong>Budget #{alert.budgetId}</strong>
                    <p>{alert.thresholdReached ? 'Threshold reached' : 'Monitoring'}</p>
                  </div>
                  <span>{alert.percentageUsed.toFixed(1)}%</span>
                </Link>
              ))}
            </div>
          </ChartCard>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="col-span-8">
          <ChartCard size="compact" title="Budget progress" description="Threshold pressure across active budgets.">
            <div className="flow-grid">
              {budgets.slice(0, 4).map((budget: any) => {
                const used = budget.limitAmount > 0 ? (budget.spentAmount / budget.limitAmount) * 100 : 0
                return (
                  <div className="flow-item" key={budget.budgetId}>
                    <div className="stack">
                      <strong>{budget.name}</strong>
                      <p>
                        {formatMoney(budget.spentAmount, primaryCurrency)} / {formatMoney(budget.limitAmount, primaryCurrency)}
                      </p>
                      <div className="budget-card__progress">
                        <div
                          className={used >= budget.alertThreshold ? 'progress-bar progress-alert' : 'progress-bar'}
                          style={{ width: `${Math.min(100, used)}%` }}
                        />
                      </div>
                    </div>
                    <span className="badge">{Math.round(used)}%</span>
                  </div>
                )
              })}
            </div>
          </ChartCard>
        </div>

        <div className="col-span-4">
          <ChartCard size="compact" title="Recurring due soon" description="Upcoming fixed obligations and subscriptions.">
            <div className="flow-grid">
              {upcomingRecurring.slice(0, 4).map((rule: any) => (
                <Link className="flow-item" key={rule.recurringId} to={`/recurring/${rule.recurringId}`}>
                  <div>
                    <strong>{rule.title}</strong>
                    <p>{rule.frequency}</p>
                  </div>
                  <span>{rule.nextDueDate}</span>
                </Link>
              ))}
            </div>
          </ChartCard>
        </div>
      </section>
    </section>
  )
}
