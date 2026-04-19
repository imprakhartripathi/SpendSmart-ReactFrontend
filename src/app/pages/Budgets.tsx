import { Link } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import HeroHeader from '@/app/components/HeroHeader'
import SectionHeader from '@/app/components/SectionHeader'
import StatCard from '@/app/components/StatCard'
import ChartTooltip from '@/app/components/ChartTooltip'

const utilizationPalette = ['#18c29c', '#0d3b3f', '#d7e7ea']

export default function BudgetsPage({ data }: { data: any }) {
  const {
    budgets,
    budgetAlerts,
    editBudget,
    removeBudget,
    formatMoney,
    primaryCurrency,
    expenseCategories,
    dispatchBudgetAlerts,
    working,
  } = data

  const activeBudgets = budgets.filter((budget: any) => budget.active)
  const overThreshold = budgetAlerts.filter((alert: any) => alert.thresholdReached || alert.exceeded)

  return (
    <section className="stack-lg">
      <HeroHeader
        kicker="Budgets"
        title="Budgeting that feels like a premium control room."
        description="Use progress cards, warnings, and utilization rings to keep spend guardrails elegant and obvious."
        actions={
          <>
            <button className="button button-secondary" disabled={working} onClick={dispatchBudgetAlerts} type="button">
              Dispatch alerts
            </button>
            <Link className="button" to="/expenses">
              Review spend
            </Link>
          </>
        }
      />

      <section className="card-grid">
        <StatCard title="Active budgets" value={String(activeBudgets.length)} caption="Currently on guard" />
        <StatCard title="Alerts" value={String(budgetAlerts.length)} caption="Threshold signals" tone={overThreshold.length ? 'warning' : 'neutral'} />
        <StatCard title="At risk" value={String(overThreshold.length)} caption="Needs attention" tone={overThreshold.length ? 'bad' : 'good'} />
        <StatCard title="Coverage" value={String(expenseCategories.length)} caption="Budget-linked categories" />
      </section>

      <section className="budgets-grid page-grid--split">
        <div className="stack-lg">
          <article className="surface-card">
            <SectionHeader title="Progress cards" description="Each budget gets a premium compact status card." />
            <div className="flow-grid">
              {budgets.length === 0 ? (
                <p className="muted">No budgets created yet.</p>
              ) : (
                budgets.map((budget: any) => {
                  const used = budget.limitAmount > 0 ? (budget.spentAmount / budget.limitAmount) * 100 : 0
                  const safe = Math.min(100, Math.max(0, used))

                  return (
                    <article className="budget-card" key={budget.budgetId}>
                      <div className="entity-card__header">
                        <div className="entity-card__body">
                          <Link className="entity-card__title" to={`/budgets/${budget.budgetId}`}>
                            {budget.name}
                          </Link>
                          <p className="entity-card__meta">
                            {formatMoney(budget.spentAmount, primaryCurrency)} /{' '}
                            {formatMoney(budget.limitAmount, primaryCurrency)}
                          </p>
                        </div>
                        <span className="badge">{Math.round(used)}%</span>
                      </div>
                      <div className="budget-card__progress">
                        <div
                          className={used >= budget.alertThreshold ? 'progress-bar progress-alert' : 'progress-bar'}
                          style={{ width: `${safe}%` }}
                        />
                      </div>
                      <div className="entity-card__actions">
                        <button onClick={() => editBudget(budget)} type="button">
                          Edit
                        </button>
                        <button
                          className="button button-danger"
                          onClick={() => void removeBudget(budget.budgetId)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </article>

          <article className="surface-card">
            <SectionHeader title="Timeline notes" description="Simple narrative around budget pressure." />
            <div className="flow-grid">
              {budgets.slice(0, 4).map((budget: any) => (
                <div className="flow-item" key={`timeline-${budget.budgetId}`}>
                  <div>
                    <strong>{budget.period}</strong>
                    <p>{budget.active ? 'Active budget window' : 'Inactive window'}</p>
                  </div>
                  <span>{budget.alertThreshold}%</span>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="stack-lg">
          <article className="surface-card">
            <SectionHeader title="Utilization rings" description="A compact visual for overall pressure." />
            <div className="ring-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgets.slice(0, 3).map((budget: any) => ({
                      name: budget.name,
                      value: budget.limitAmount > 0 ? (budget.spentAmount / budget.limitAmount) * 100 : 0,
                    }))}
                    dataKey="value"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={6}
                  >
                    {utilizationPalette.map((color) => (
                      <Cell fill={color} key={color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip currency={primaryCurrency} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>

          {overThreshold.length > 0 ? (
            <article className="banner banner--warning">
              <SectionHeader title="Threshold warnings" description="Elegant alerts for nearing overspend." />
              <div className="flow-grid">
              {overThreshold.map((alert: any) => (
                  <article className="flow-item" key={alert.budgetId}>
                    <div>
                      <Link className="entity-card__title" to={`/budgets/${alert.budgetId}`}>
                        Budget #{alert.budgetId}
                      </Link>
                      <p>{alert.thresholdReached ? 'Reached threshold' : 'Monitoring'}</p>
                    </div>
                    <span>{alert.percentageUsed.toFixed(1)}%</span>
                  </article>
                ))}
              </div>
            </article>
          ) : (
            <article className="banner">
              <SectionHeader title="No active warnings" description="Spending is inside the current guardrails." />
            </article>
          )}
        </div>
      </section>
    </section>
  )
}
