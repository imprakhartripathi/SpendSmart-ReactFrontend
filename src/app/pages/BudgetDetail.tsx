import { Link, useParams } from 'react-router-dom'
import HeroHeader from '@/app/components/HeroHeader'
import SectionHeader from '@/app/components/SectionHeader'

export default function BudgetDetail({ data }: { data: any }) {
  const { id } = useParams()
  const { budgets, formatMoney, primaryCurrency, editBudget } = data

  const budget = budgets.find((entry: any) => String(entry.budgetId) === String(id))

  if (!budget) {
    return (
      <section className="stack-lg">
        <article className="surface-card">
          <h2>Budget not found</h2>
          <Link className="button button-secondary" to="/budgets">
            Back to budgets
          </Link>
        </article>
      </section>
    )
  }

  const used = budget.limitAmount > 0 ? (budget.spentAmount / budget.limitAmount) * 100 : 0

  return (
    <section className="stack-lg">
      <HeroHeader
        kicker="Budget detail"
        title={budget.name}
        description="Track budget pressure in a routed, bookmarkable detail view."
        actions={
          <>
            <button className="button button-secondary" onClick={() => editBudget(budget)} type="button">
              Edit budget
            </button>
            <Link className="button button-secondary" to="/budgets">
              Back to budgets
            </Link>
          </>
        }
      />

      <section className="detail-grid page-grid--split">
        <article className="surface-card">
          <SectionHeader title="Utilization" description="Spending ratio and active status." />
          <div className="flow-grid">
            <div className="flow-item">
              <div>
                <strong>Spent</strong>
                <p>{formatMoney(budget.spentAmount, primaryCurrency)}</p>
              </div>
              <span className="badge">{Math.round(used)}%</span>
            </div>
            <div className="flow-item">
              <div>
                <strong>Limit</strong>
                <p>{formatMoney(budget.limitAmount, primaryCurrency)}</p>
              </div>
              <span className="badge">{budget.period}</span>
            </div>
            <div className="flow-item">
              <div>
                <strong>Alert threshold</strong>
                <p>{budget.alertThreshold}%</p>
              </div>
              <span className="badge">{budget.active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          <div className="budget-card__progress" style={{ marginTop: '1rem' }}>
            <div
              className={used >= budget.alertThreshold ? 'progress-bar progress-alert' : 'progress-bar'}
              style={{ width: `${Math.min(100, used)}%` }}
            />
          </div>
        </article>

        <article className="surface-card">
          <SectionHeader title="Dates" description="Custom windows and period markers." />
          <div className="flow-grid">
            <div className="flow-item">
              <div>
                <strong>Start</strong>
                <p>{budget.startDate || 'N/A'}</p>
              </div>
              <span className="badge">Start</span>
            </div>
            <div className="flow-item">
              <div>
                <strong>End</strong>
                <p>{budget.endDate || 'N/A'}</p>
              </div>
              <span className="badge">End</span>
            </div>
          </div>
        </article>
      </section>
    </section>
  )
}
