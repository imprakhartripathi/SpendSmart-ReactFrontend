import { Link, useParams } from 'react-router-dom'
import HeroHeader from '@/app/components/HeroHeader'
import SectionHeader from '@/app/components/SectionHeader'

export default function IncomeDetail({ data }: { data: any }) {
  const { id } = useParams()
  const { incomes, categoryNameMap, formatMoney, primaryCurrency } = data

  const income = incomes.find((entry: any) => String(entry.incomeId) === String(id))

  if (!income) {
    return (
      <section className="stack-lg">
        <article className="surface-card">
          <h2>Income not found</h2>
          <p className="muted">The requested income entry could not be located.</p>
          <Link className="button button-secondary" to="/income">
            Back to income
          </Link>
        </article>
      </section>
    )
  }

  return (
    <section className="stack-lg">
      <HeroHeader
        kicker="Income detail"
        title={income.title}
        description="Bookmarkable income drill-down with calm summary structure."
        actions={
          <Link className="button button-secondary" to="/income">
            Back to income
          </Link>
        }
      />

      <section className="detail-grid page-grid--split">
        <article className="surface-card">
          <SectionHeader title="Income summary" description="Revenue metadata and classification." />
          <div className="flow-grid">
            <div className="flow-item">
              <div>
                <strong>Amount</strong>
                <p>{formatMoney(income.amount, primaryCurrency)}</p>
              </div>
              <span className="badge">{income.source}</span>
            </div>
            <div className="flow-item">
              <div>
                <strong>Category</strong>
                <p>{categoryNameMap.get(income.categoryId) || income.categoryId}</p>
              </div>
              <span className="badge">{income.date}</span>
            </div>
            <div className="flow-item">
              <div>
                <strong>Recurring</strong>
                <p>{income.recurring ? `Yes · ${income.recurrencePeriod || 'MONTHLY'}` : 'No'}</p>
              </div>
              <span className="badge">Income</span>
            </div>
          </div>
        </article>

        <article className="surface-card">
          <SectionHeader title="Notes" description="Context for this income entry." />
          <p>{income.notes || 'No notes added.'}</p>
        </article>
      </section>
    </section>
  )
}
