import { Link } from 'react-router-dom'
import InsightCard from '@/app/components/InsightCard'
import StatCard from '@/app/components/StatCard'

const featureCards = [
  {
    title: 'Command-center overview',
    description: 'One screen for cash flow, budgets, recurring rules, and alerts without the admin clutter.',
  },
  {
    title: 'Fast capture flows',
    description: 'Expense, income, and recurring inputs stay compact, predictable, and easy to scan.',
  },
  {
    title: 'Decision-ready analytics',
    description: 'Trend cards, category breakdowns, and forecast signals stay easy to read at a glance.',
  },
  {
    title: 'Premium control surfaces',
    description: 'Soft borders, strong hierarchy, and calm spacing give the workspace a modern fintech feel.',
  },
]

export default function Landing() {
  return (
    <main className="app-auth-shell landing-shell">
      <section className="landing-hero surface-card">
        <div className="landing-hero__copy">
          <p className="eyebrow">SpendSmart</p>
          <h1>Know exactly where your money is going.</h1>
          <p>
            A premium finance workspace for tracking spending, budgets, income, and recurring
            commitments with clarity instead of clutter.
          </p>

          <div className="hero-actions">
            <Link className="button button-round" to="/signup">
              Get started
            </Link>
            <Link className="button button-secondary button-round" to="/login">
              Login
            </Link>
          </div>

          <div className="chip-row">
            <span className="filter-chip is-active">Real-time tracking</span>
            <span className="filter-chip">Budget guardrails</span>
            <span className="filter-chip">OAuth login</span>
          </div>
        </div>

        <div className="landing-hero__preview">
          <article className="landing-preview-card">
            <p className="eyebrow">This month</p>
            <strong>Healthy cash flow</strong>
            <div className="landing-preview-card__stats">
              <StatCard title="Net savings" value="$4,682" tone="good" caption="Up 12% vs last month" />
              <StatCard title="Budget health" value="92%" tone="good" caption="Across active budgets" />
            </div>
          </article>

          <article className="landing-preview-card landing-preview-card--dark">
            <p className="eyebrow">Revenue + spend</p>
            <strong>Built for quick decisions</strong>
            <p>Trend-led cards, polished filters, and clean detail pages keep the workspace focused.</p>
          </article>
        </div>
      </section>

      <section className="landing-proof-grid">
        {featureCards.map((card) => (
          <InsightCard key={card.title} title={card.title} description={card.description} tone="neutral" />
        ))}
      </section>

      <section className="landing-panel surface-card">
        <div className="section-header">
          <div>
            <h3>Built for the whole workflow</h3>
            <p>From fast capture to long-term review, SpendSmart keeps every step in one calm system.</p>
          </div>
          <div className="section-actions">
            <Link className="button button-secondary button-round" to="/login">
              Login
            </Link>
            <Link className="button button-round" to="/signup">
              Get started
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
