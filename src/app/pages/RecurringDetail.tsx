import { Link, useParams } from 'react-router-dom'
import HeroHeader from '@/app/components/HeroHeader'
import SectionHeader from '@/app/components/SectionHeader'

export default function RecurringDetail({ data }: { data: any }) {
  const { id } = useParams()
  const { recurringRules, formatMoney, primaryCurrency, editRecurring } = data

  const rule = recurringRules.find((entry: any) => String(entry.recurringId) === String(id))

  if (!rule) {
    return (
      <section className="stack-lg">
        <article className="surface-card">
          <h2>Recurring rule not found</h2>
          <Link className="button button-secondary" to="/recurring">
            Back to recurring
          </Link>
        </article>
      </section>
    )
  }

  return (
    <section className="stack-lg">
      <HeroHeader
        kicker="Recurring detail"
        title={rule.title}
        description="A routed detail view for subscriptions and scheduled rules."
        actions={
          <>
            <button className="button button-secondary" onClick={() => editRecurring(rule)} type="button">
              Edit rule
            </button>
            <Link className="button button-secondary" to="/recurring">
              Back to recurring
            </Link>
          </>
        }
      />

      <section className="detail-grid page-grid--split">
        <article className="surface-card">
          <SectionHeader title="Schedule" description="Cadence and lifecycle fields." />
          <div className="flow-grid">
            <div className="flow-item">
              <div>
                <strong>Amount</strong>
                <p>{formatMoney(rule.amount, primaryCurrency)}</p>
              </div>
              <span className="badge">{rule.type}</span>
            </div>
            <div className="flow-item">
              <div>
                <strong>Frequency</strong>
                <p>{rule.frequency}</p>
              </div>
              <span className="badge">{rule.active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flow-item">
              <div>
                <strong>Next due</strong>
                <p>{rule.nextDueDate}</p>
              </div>
              <span className="badge">{rule.paymentMethod}</span>
            </div>
          </div>
        </article>

        <article className="surface-card">
          <SectionHeader title="Lifecycle" description="Dates and supporting description." />
          <div className="flow-grid">
            <div className="flow-item">
              <div>
                <strong>Start</strong>
                <p>{rule.startDate}</p>
              </div>
              <span className="badge">Start</span>
            </div>
            <div className="flow-item">
              <div>
                <strong>End</strong>
                <p>{rule.endDate || 'Open-ended'}</p>
              </div>
              <span className="badge">End</span>
            </div>
          </div>
          <p style={{ marginTop: '1rem' }}>{rule.description || 'No description added.'}</p>
        </article>
      </section>
    </section>
  )
}
