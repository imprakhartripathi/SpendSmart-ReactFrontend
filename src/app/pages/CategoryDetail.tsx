import { Link, useParams } from 'react-router-dom'
import HeroHeader from '@/app/components/HeroHeader'
import SectionHeader from '@/app/components/SectionHeader'

export default function CategoryDetail({ data }: { data: any }) {
  const { id } = useParams()
  const { categories, formatMoney, primaryCurrency } = data

  const category = categories.find((entry: any) => String(entry.categoryId) === String(id))

  if (!category) {
    return (
      <section className="stack-lg">
        <article className="surface-card">
          <h2>Category not found</h2>
          <Link className="button button-secondary" to="/categories">
            Back to categories
          </Link>
        </article>
      </section>
    )
  }

  return (
    <section className="stack-lg">
      <HeroHeader
        kicker="Category detail"
        title={category.name}
        description="A visual detail page for a single category card."
        actions={
          <Link className="button button-secondary" to="/categories">
            Back to categories
          </Link>
        }
      />

      <section className="detail-grid page-grid--split">
        <article className="surface-card">
          <SectionHeader title="Metadata" description="Visual identity and budget linkage." />
          <div className="flow-grid">
            <div className="flow-item">
              <div>
                <strong>Type</strong>
                <p>{category.type}</p>
              </div>
              <span className="badge">{category.icon}</span>
            </div>
            <div className="flow-item">
              <div>
                <strong>Color</strong>
                <p>{category.colorCode}</p>
              </div>
              <span className="badge">{category.defaultCategory ? 'Default' : 'Custom'}</span>
            </div>
            <div className="flow-item">
              <div>
                <strong>Budget limit</strong>
                <p>{category.budgetLimit ? formatMoney(category.budgetLimit, primaryCurrency) : 'No limit set'}</p>
              </div>
              <span className="badge">Category</span>
            </div>
          </div>
        </article>

        <article className="surface-card">
          <SectionHeader title="Usage" description="Category-specific spend and income history can expand here later." />
          <p className="muted">This route is bookmarkable and ready for future nested workflows.</p>
        </article>
      </section>
    </section>
  )
}
