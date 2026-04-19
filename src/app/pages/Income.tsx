import { Link } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartCard from '@/app/components/ChartCard'
import ChartTooltip from '@/app/components/ChartTooltip'
import HeroHeader from '@/app/components/HeroHeader'
import InsightCard from '@/app/components/InsightCard'
import SectionHeader from '@/app/components/SectionHeader'
import StatCard from '@/app/components/StatCard'

export default function IncomePage({ data }: { data: any }) {
  const {
    sessionUserId,
    incomes,
    incomeForm,
    setIncomeForm,
    saveIncome,
    editIncome,
    removeIncome,
    incomeCategories,
    incomeKeyword,
    setIncomeKeyword,
    fetchIncomes,
    editingIncomeId,
    setEditingIncomeId,
    defaultIncomeForm,
    working,
    primaryCurrency,
    incomeVsExpenseTrend,
    formatMoney,
    categoryNameMap,
  } = data

  const incomeTotal = incomes.reduce((sum: number, income: any) => sum + (income.amount || 0), 0)
  const recurringCount = incomes.filter((income: any) => income.recurring).length

  return (
    <section className="page-stack">
      <HeroHeader
        kicker="Income"
        title="Keep revenue signals just as polished as spending."
        description="Salary, side income, and recurring inflows sit in a compact workspace with a stable right rail."
        actions={
          <>
            <Link className="button button-secondary" to="/overview">
              Back to overview
            </Link>
            <button
              className="button"
              onClick={() => {
                setEditingIncomeId(null)
                setIncomeForm(defaultIncomeForm)
              }}
              type="button"
            >
              Reset form
            </button>
          </>
        }
      />

      <section className="card-grid">
        <StatCard title="Total income" value={formatMoney(incomeTotal, primaryCurrency)} tone="good" caption="Current filtered set" />
        <StatCard title="Sources" value={String(new Set(incomes.map((i: any) => i.source)).size)} caption="Distinct channels" />
        <StatCard title="Recurring" value={String(recurringCount)} caption="Steady inflows" />
        <StatCard title="Average ticket" value={incomes.length ? formatMoney(incomeTotal / incomes.length, primaryCurrency) : '$0'} caption="Per transaction" />
      </section>

      <section className="dashboard-grid">
        <div className="col-span-8 page-stack">
          <ChartCard size="tall" title="Salary vs side income trend" description="Unified revenue rhythm across the trailing window.">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incomeVsExpenseTrend} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                <CartesianGrid stroke="#edf2f7" vertical={false} />
                <XAxis dataKey="period" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip currency={primaryCurrency} />} />
                <Line dataKey="income" dot={false} stroke="#18c29c" strokeLinecap="round" strokeWidth={3} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <article className="surface-card">
            <SectionHeader title="Recurring income insights" description="How much of inflow is predictable." />
            <div className="flow-grid">
              <InsightCard
                title="Predictable income"
                value={formatMoney(
                  incomes.filter((income: any) => income.recurring).reduce((sum: number, income: any) => sum + income.amount, 0),
                  primaryCurrency,
                )}
                description="Recurrence-backed inflows."
                tone="good"
              />
              <InsightCard
                title="Other income"
                value={formatMoney(
                  incomes.filter((income: any) => !income.recurring).reduce((sum: number, income: any) => sum + income.amount, 0),
                  primaryCurrency,
                )}
                description="Non-recurring inflows."
                tone="neutral"
              />
            </div>
          </article>

          <article className="surface-card">
            <SectionHeader title="Income source mix" description="Grouped sources by card-style chips." />
            <div className="chip-row">
              {incomeCategories.length === 0 ? (
                <p className="muted">No income categories.</p>
              ) : (
                incomeCategories.map((category: any) => (
                  <span className="filter-chip is-active" key={category.categoryId}>
                    {category.icon} {category.name}
                  </span>
                ))
              )}
            </div>
          </article>
        </div>

        <div className="col-span-4 rail-stack rail-stack--sticky">
          <article className="surface-card quick-action-card">
            <SectionHeader title={editingIncomeId ? 'Edit income' : 'Quick add income'} description="Streamlined entry for salary, freelance, and recurring inflows." />
            <form className="stack form-stack" onSubmit={saveIncome}>
              <label>
                Title
                <input
                  required
                  value={incomeForm.title}
                  onChange={(event) => setIncomeForm((prev: any) => ({ ...prev, title: event.target.value }))}
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
                  onChange={(event) => setIncomeForm((prev: any) => ({ ...prev, amount: event.target.value }))}
                />
              </label>
              <label>
                Category
                <select
                  required
                  value={incomeForm.categoryId}
                  onChange={(event) => setIncomeForm((prev: any) => ({ ...prev, categoryId: event.target.value }))}
                >
                  <option value="">Select</option>
                  {incomeCategories.map((category: any) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Source
                <select
                  value={incomeForm.source}
                  onChange={(event) => setIncomeForm((prev: any) => ({ ...prev, source: event.target.value }))}
                >
                  {['SALARY', 'FREELANCE', 'BUSINESS', 'INVESTMENT', 'GIFT', 'OTHER'].map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Date
                <input
                  required
                  type="date"
                  value={incomeForm.date}
                  onChange={(event) => setIncomeForm((prev: any) => ({ ...prev, date: event.target.value }))}
                />
              </label>
              <label className="toggle-field">
                <span>Recurring</span>
                <input
                  checked={incomeForm.recurring}
                  onChange={(event) =>
                    setIncomeForm((prev: any) => ({
                      ...prev,
                      recurring: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
              </label>
              {incomeForm.recurring ? (
                <label>
                  Recurrence period
                  <select
                    value={incomeForm.recurrencePeriod}
                    onChange={(event) =>
                      setIncomeForm((prev: any) => ({
                        ...prev,
                        recurrencePeriod: event.target.value,
                      }))
                    }
                  >
                    {['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'].map((period) => (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label>
                Notes
                <textarea
                  rows={3}
                  value={incomeForm.notes}
                  onChange={(event) => setIncomeForm((prev: any) => ({ ...prev, notes: event.target.value }))}
                />
              </label>
              <div className="button-row">
                <button className="button button-round" disabled={working} type="submit">
                  {working ? 'Saving...' : editingIncomeId ? 'Update income' : 'Add income'}
                </button>
                {editingIncomeId ? (
                  <button
                    className="button button-secondary"
                    onClick={() => {
                      setEditingIncomeId(null)
                      setIncomeForm(defaultIncomeForm)
                    }}
                    type="button"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </article>

          <article className="surface-card">
            <SectionHeader title="Search income" description="Search stays in the same stack as the quick-add flow." />
            <div className="stack">
              <input
                placeholder="Search title or notes"
                value={incomeKeyword}
                onChange={(event) => setIncomeKeyword(event.target.value)}
              />
              <button className="button button-secondary" disabled={working} onClick={() => void fetchIncomes(sessionUserId)} type="button">
                Search
              </button>
            </div>
          </article>

          <article className="surface-card">
            <SectionHeader title="Recent income" description="Search and edit in one compact list." />
            <div className="list-grid">
              {incomes.length === 0 ? (
                <p className="muted">No income entries yet.</p>
              ) : (
                incomes.slice(0, 10).map((income: any) => (
                  <article className="entity-card list-row" key={income.incomeId}>
                    <div className="entity-card__header">
                      <div className="entity-card__body">
                        <Link className="entity-card__title" to={`/income/${income.incomeId}`}>
                          {income.title}
                        </Link>
                        <p className="entity-card__meta">
                          {income.date} · {categoryNameMap.get(income.categoryId) || `Category ${income.categoryId}`}
                        </p>
                      </div>
                      <span className="badge">{formatMoney(income.amount, primaryCurrency)}</span>
                    </div>
                    <div className="entity-card__actions">
                      <button onClick={() => editIncome(income)} type="button">
                        Edit
                      </button>
                      <button className="button button-danger" onClick={() => void removeIncome(income.incomeId)} type="button">
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </article>
        </div>
      </section>
    </section>
  )
}
