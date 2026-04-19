import { Link } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartCard from '@/app/components/ChartCard'
import ChartTooltip from '@/app/components/ChartTooltip'
import HeroHeader from '@/app/components/HeroHeader'
import SectionHeader from '@/app/components/SectionHeader'
import StatCard from '@/app/components/StatCard'

export default function RecurringPage({ data }: { data: any }) {
  const {
    recurringRules,
    upcomingRecurring,
    editRecurring,
    deactivateRecurring,
    removeRecurring,
    processRecurringNow,
    recurringForm,
    setRecurringForm,
    saveRecurring,
    editingRecurringId,
    setEditingRecurringId,
    defaultRecurringForm,
    working,
    expenseCategories,
    incomeCategories,
    formatMoney,
    primaryCurrency,
    categoryNameMap,
  } = data

  const totalForecast = upcomingRecurring.reduce((sum: number, rule: any) => sum + rule.amount, 0)

  return (
    <section className="page-stack">
      <HeroHeader
        kicker="Recurring"
        title="Recurring logic, transformed into a timeline workspace."
        description="Due soon cards, frequency pills, and a forecast chart make subscription and rule management feel executive-grade."
        actions={
          <>
            <button className="button button-secondary" disabled={working} onClick={processRecurringNow} type="button">
              Process due now
            </button>
            <Link className="button" to="/budgets">
              Link budgets
            </Link>
          </>
        }
      />

      <section className="card-grid">
        <StatCard title="Active rules" value={String(recurringRules.filter((rule: any) => rule.active).length)} caption="Enabled schedules" />
        <StatCard title="Upcoming" value={String(upcomingRecurring.length)} caption="Due this month" />
        <StatCard title="Forecast" value={formatMoney(totalForecast, primaryCurrency)} caption="Upcoming monthly total" />
        <StatCard title="Income rules" value={String(recurringRules.filter((rule: any) => rule.type === 'INCOME').length)} caption="Recurring inflows" />
      </section>

      <section className="dashboard-grid">
        <div className="col-span-8 page-stack">
          <ChartCard size="tall" title="Monthly recurring forecast" description="Simple cadence chart for upcoming commitments.">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={upcomingRecurring} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                <CartesianGrid stroke="#edf2f7" vertical={false} />
                <XAxis dataKey="nextDueDate" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip currency={primaryCurrency} />} />
                <Line dataKey="amount" dot={false} stroke="#0d3b3f" strokeLinecap="round" strokeWidth={3} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <article className="surface-card">
            <SectionHeader title="Recurring rules" description="Autopay-style cards with quick actions." />
            <div className="flow-grid">
              {recurringRules.length === 0 ? (
                <p className="muted">No recurring rules yet.</p>
              ) : (
                recurringRules.map((rule: any) => (
                  <article className="flow-item" key={rule.recurringId}>
                    <div>
                      <Link className="entity-card__title" to={`/recurring/${rule.recurringId}`}>
                        {rule.title}
                      </Link>
                      <p>
                        {rule.frequency} · {categoryNameMap.get(rule.categoryId) || `Category ${rule.categoryId}`}
                      </p>
                    </div>
                    <div className="entity-card__actions">
                      <span>{formatMoney(rule.amount, primaryCurrency)}</span>
                      <button onClick={() => editRecurring(rule)} type="button">
                        Edit
                      </button>
                      <button className="button button-secondary" onClick={() => void deactivateRecurring(rule.recurringId)} type="button">
                        Deactivate
                      </button>
                      <button className="button button-danger" onClick={() => void removeRecurring(rule.recurringId)} type="button">
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
            <SectionHeader title={editingRecurringId ? 'Edit recurring rule' : 'Add recurring rule'} description="Compact form with deliberate two-column groups." />
            <form className="stack form-stack" onSubmit={saveRecurring}>
              <label>
                Title
                <input required value={recurringForm.title} onChange={(event) => setRecurringForm((prev: any) => ({ ...prev, title: event.target.value }))} />
              </label>
              <label>
                Amount
                <input min="0" required step="0.01" type="number" value={recurringForm.amount} onChange={(event) => setRecurringForm((prev: any) => ({ ...prev, amount: event.target.value }))} />
              </label>
              <label>
                Type
                <select value={recurringForm.type} onChange={(event) => setRecurringForm((prev: any) => ({ ...prev, type: event.target.value }))}>
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </label>
              <label>
                Category
                <select required value={recurringForm.categoryId} onChange={(event) => setRecurringForm((prev: any) => ({ ...prev, categoryId: event.target.value }))}>
                  <option value="">Select</option>
                  {(recurringForm.type === 'EXPENSE' ? expenseCategories : incomeCategories).map((category: any) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Frequency
                <select value={recurringForm.frequency} onChange={(event) => setRecurringForm((prev: any) => ({ ...prev, frequency: event.target.value }))}>
                  {['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'].map((frequency) => (
                    <option key={frequency} value={frequency}>
                      {frequency}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Payment method
                <select value={recurringForm.paymentMethod} onChange={(event) => setRecurringForm((prev: any) => ({ ...prev, paymentMethod: event.target.value }))}>
                  {['CASH', 'CARD', 'UPI', 'BANK', 'WALLET'].map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Next due
                <input
                  type="date"
                  value={recurringForm.nextDueDate}
                  onChange={(event) => setRecurringForm((prev: any) => ({ ...prev, nextDueDate: event.target.value }))}
                />
              </label>
              <label>
                Start date
                <input
                  type="date"
                  value={recurringForm.startDate}
                  onChange={(event) => setRecurringForm((prev: any) => ({ ...prev, startDate: event.target.value }))}
                />
              </label>
              <label>
                End date
                <input
                  type="date"
                  value={recurringForm.endDate}
                  onChange={(event) => setRecurringForm((prev: any) => ({ ...prev, endDate: event.target.value }))}
                />
              </label>
              <label className="toggle-field">
                <span>Active rule</span>
                <input
                  checked={recurringForm.active}
                  onChange={(event) => setRecurringForm((prev: any) => ({ ...prev, active: event.target.checked }))}
                  type="checkbox"
                />
              </label>
              <label>
                Notes
                <textarea
                  rows={3}
                  value={recurringForm.description}
                  onChange={(event) => setRecurringForm((prev: any) => ({ ...prev, description: event.target.value }))}
                />
              </label>

              <div className="button-row">
                <button className="button button-round" disabled={working} type="submit">
                  {working ? 'Saving...' : editingRecurringId ? 'Update rule' : 'Create rule'}
                </button>
                {editingRecurringId ? (
                  <button
                    className="button button-secondary"
                    onClick={() => {
                      setEditingRecurringId(null)
                      setRecurringForm(defaultRecurringForm)
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
            <SectionHeader title="Due soon" description="Upcoming month commitments at a glance." />
            <div className="flow-grid">
              {upcomingRecurring.length === 0 ? (
                <p className="muted">No upcoming recurring transactions.</p>
              ) : (
                upcomingRecurring.slice(0, 6).map((rule: any) => (
                  <article className="flow-item" key={`upcoming-${rule.recurringId}`}>
                    <div>
                      <Link className="entity-card__title" to={`/recurring/${rule.recurringId}`}>
                        {rule.title}
                      </Link>
                      <p>
                        {rule.type} · {rule.frequency}
                      </p>
                    </div>
                    <span>{rule.nextDueDate}</span>
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
