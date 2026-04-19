import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartCard from '@/app/components/ChartCard'
import ChartTooltip from '@/app/components/ChartTooltip'
import HeroHeader from '@/app/components/HeroHeader'
import SectionHeader from '@/app/components/SectionHeader'
import StatCard from '@/app/components/StatCard'

export default function Expenses({ data }: { data: any }) {
  const {
    sessionUserId,
    expenses,
    expenseForm,
    setExpenseForm,
    saveExpense,
    editExpense,
    removeExpense,
    expenseCategories,
    expenseKeyword,
    setExpenseKeyword,
    fetchExpenses,
    editingExpenseId,
    setEditingExpenseId,
    defaultExpenseForm,
    working,
    primaryCurrency,
    dailyTrend,
    topCategories,
    formatMoney,
    categoryNameMap,
  } = data

  const expenseTotal = expenses.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0)

  return (
    <section className="page-stack">
      <HeroHeader
        kicker="Expenses"
        title="Shape the spend surface with fewer distractions."
        description="Analytics stay on the left, while quick add and receipts stay in one calibrated rail."
        actions={
          <>
            <Link className="button button-secondary" to="/overview">
              Back to overview
            </Link>
            <button
              className="button"
              onClick={() => {
                setEditingExpenseId(null)
                setExpenseForm(defaultExpenseForm)
              }}
              type="button"
            >
              Reset form
            </button>
          </>
        }
      />

      <section className="card-grid">
        <StatCard title="Total spend" value={formatMoney(expenseTotal, primaryCurrency)} tone="bad" caption="Current filtered set" />
        <StatCard title="Transactions" value={String(expenses.length)} caption="Loaded items" />
        <StatCard title="Top category" value={topCategories[0]?.category || 'None'} caption="Largest spend bucket" />
        <StatCard title="Receipt coverage" value={`${expenses.filter((expense: any) => expense.receiptUrl).length}/${expenses.length}`} caption="Entries with proof" />
      </section>

      <section className="dashboard-grid">
        <div className="col-span-8 page-stack">
          <ChartCard size="tall" title="Monthly spend trend" description="Daily pressure across the selected month.">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                <CartesianGrid stroke="#edf2f7" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip currency={primaryCurrency} />} />
                <Line dataKey="expense" dot={false} stroke="#dc5a63" strokeLinecap="round" strokeWidth={3} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard size="compact" title="Top categories" description="Where the most money is currently going.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategories} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 12 }}>
                <CartesianGrid stroke="#edf2f7" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} width={140} tickMargin={8} />
                <Tooltip content={<ChartTooltip currency={primaryCurrency} />} />
                <Bar dataKey="amount" fill="#dc5a63" radius={[0, 12, 12, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <article className="surface-card">
            <SectionHeader title="Smart filters" description="Search remains lightweight and server-backed." />
            <div className="stack">
              <div className="chip-row">
                <span className="filter-chip is-active">All</span>
                <span className="filter-chip">With receipt</span>
                <span className="filter-chip">Recurring</span>
                <span className="filter-chip">High value</span>
              </div>
              <div className="stack">
                <input
                  placeholder="Search title or notes"
                  value={expenseKeyword}
                  onChange={(event) => setExpenseKeyword(event.target.value)}
                />
                <button
                  className="button button-secondary"
                  disabled={working}
                  onClick={() => void fetchExpenses(sessionUserId)}
                  type="button"
                >
                  Search
                </button>
              </div>
            </div>
          </article>

          <article className="surface-card">
            <SectionHeader title="Recent transactions" description="Inline edit and removal stay one click away." />
            <div className="list-grid">
              {expenses.length === 0 ? (
                <p className="muted">No transactions.</p>
              ) : (
                expenses.slice(0, 10).map((expense: any) => (
                  <article className="entity-card list-row" key={expense.expenseId}>
                    <div className="entity-card__header">
                      <div className="entity-card__body">
                        <Link className="entity-card__title" to={`/expenses/${expense.expenseId}`}>
                          {expense.title}
                        </Link>
                        <p className="entity-card__meta">
                          {expense.date} · {categoryNameMap.get(expense.categoryId) || `Category ${expense.categoryId}`}
                        </p>
                      </div>
                      <span className="badge">{formatMoney(expense.amount, primaryCurrency)}</span>
                    </div>
                    <div className="entity-card__actions">
                      <button onClick={() => editExpense(expense)} type="button">
                        Edit
                      </button>
                      <button className="button button-danger" onClick={() => void removeExpense(expense.expenseId)} type="button">
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </article>
        </div>

        <div className="col-span-4 rail-stack rail-stack--sticky">
          <article className="surface-card quick-action-card">
            <SectionHeader title={editingExpenseId ? 'Edit expense' : 'Quick add expense'} description="Compact form with receipt preview embedded directly below the field." />
            <form className="stack form-stack" onSubmit={saveExpense}>
              <label>
                Title
                <input
                  required
                  value={expenseForm.title}
                  onChange={(event) => setExpenseForm((prev: any) => ({ ...prev, title: event.target.value }))}
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
                  onChange={(event) => setExpenseForm((prev: any) => ({ ...prev, amount: event.target.value }))}
                />
              </label>
              <label>
                Category
                <select
                  required
                  value={expenseForm.categoryId}
                  onChange={(event) => setExpenseForm((prev: any) => ({ ...prev, categoryId: event.target.value }))}
                >
                  <option value="">Select</option>
                  {expenseCategories.map((category: any) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Payment method
                <select
                  value={expenseForm.paymentMethod}
                  onChange={(event) =>
                    setExpenseForm((prev: any) => ({
                      ...prev,
                      paymentMethod: event.target.value,
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
              <label>
                Date
                <input
                  required
                  type="date"
                  value={expenseForm.date}
                  onChange={(event) => setExpenseForm((prev: any) => ({ ...prev, date: event.target.value }))}
                />
              </label>
              <label className="toggle-field">
                <span>Recurring</span>
                <input
                  checked={expenseForm.recurring}
                  onChange={(event) =>
                    setExpenseForm((prev: any) => ({
                      ...prev,
                      recurring: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
              </label>
              <label>
                Receipt URL
                <input
                  placeholder="https://..."
                  value={expenseForm.receiptUrl}
                  onChange={(event) => setExpenseForm((prev: any) => ({ ...prev, receiptUrl: event.target.value }))}
                />
              </label>
              {expenseForm.receiptUrl ? (
                <div className="auth-proof" style={{ background: 'rgba(13, 59, 63, 0.04)', borderColor: 'rgba(13, 59, 63, 0.08)' }}>
                  <strong>Receipt attached</strong>
                  <p>Latest URL is ready to preview after save.</p>
                </div>
              ) : null}
              <label>
                Notes
                <textarea
                  rows={3}
                  value={expenseForm.notes}
                  onChange={(event) => setExpenseForm((prev: any) => ({ ...prev, notes: event.target.value }))}
                />
              </label>
              <div className="button-row">
                <button className="button button-round" disabled={working} type="submit">
                  {working ? 'Saving...' : editingExpenseId ? 'Update expense' : 'Add expense'}
                </button>
                {editingExpenseId ? (
                  <button
                    className="button button-secondary"
                    onClick={() => {
                      setEditingExpenseId(null)
                      setExpenseForm(defaultExpenseForm)
                    }}
                    type="button"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </article>
        </div>
      </section>
    </section>
  )
}
