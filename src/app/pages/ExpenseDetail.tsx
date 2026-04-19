import { Link, useParams } from 'react-router-dom'
import HeroHeader from '@/app/components/HeroHeader'
import SectionHeader from '@/app/components/SectionHeader'

export default function ExpenseDetail({ data }: { data: any }) {
  const { id } = useParams()
  const { expenses, categoryNameMap, formatMoney, primaryCurrency } = data

  const expense = expenses.find((entry: any) => String(entry.expenseId) === String(id))

  if (!expense) {
    return (
      <section className="stack-lg">
        <article className="surface-card">
          <h2>Expense not found</h2>
          <p className="muted">The requested expense could not be located.</p>
          <Link className="button button-secondary" to="/expenses">
            Back to expenses
          </Link>
        </article>
      </section>
    )
  }

  return (
    <section className="stack-lg">
      <HeroHeader
        kicker="Expense detail"
        title={expense.title}
        description="A clean bookmarkable detail view for a single transaction."
        actions={
          <Link className="button button-secondary" to="/expenses">
            Back to expenses
          </Link>
        }
      />

      <section className="detail-grid page-grid--split">
        <article className="surface-card">
          <SectionHeader title="Transaction summary" description="Transaction metadata and receipt context." />
          <div className="flow-grid">
            <div className="flow-item">
              <div>
                <strong>Amount</strong>
                <p>{formatMoney(expense.amount, primaryCurrency)}</p>
              </div>
              <span className="badge">{expense.paymentMethod}</span>
            </div>
            <div className="flow-item">
              <div>
                <strong>Category</strong>
                <p>{categoryNameMap.get(expense.categoryId) || expense.categoryId}</p>
              </div>
              <span className="badge">{expense.date}</span>
            </div>
            <div className="flow-item">
              <div>
                <strong>Recurring</strong>
                <p>{expense.recurring ? 'Yes' : 'No'}</p>
              </div>
              <span className="badge">{expense.type}</span>
            </div>
          </div>
        </article>

        <article className="surface-card">
          <SectionHeader title="Receipt and notes" description="Supporting context in one premium card." />
          <div className="stack">
            {expense.receiptUrl ? (
              <a className="button button-secondary" href={expense.receiptUrl} rel="noreferrer" target="_blank">
                Open receipt
              </a>
            ) : (
              <p className="muted">No receipt URL is attached to this transaction.</p>
            )}
            {expense.notes ? <p>{expense.notes}</p> : <p className="muted">No notes added.</p>}
          </div>
        </article>
      </section>
    </section>
  )
}
