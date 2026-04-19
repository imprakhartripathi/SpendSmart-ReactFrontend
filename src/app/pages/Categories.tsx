import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import HeroHeader from '@/app/components/HeroHeader'
import SectionHeader from '@/app/components/SectionHeader'
import StatCard from '@/app/components/StatCard'

export default function CategoriesPage({ data }: { data: any }) {
  const {
    categories,
    editCategory,
    removeCategory,
    setCategoryForm,
    setEditingCategoryId,
    defaultCategoryForm,
    working,
    categoryForm,
    saveCategory,
    initDefaultCategories,
    editingCategoryId,
    primaryCurrency,
    expenses,
    formatMoney,
  } = data

  const [activeFilter, setActiveFilter] = useState<'all' | 'expense' | 'income' | 'budget-linked'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const normalizedQuery = searchTerm.trim().toLowerCase()

  const filteredCategories = useMemo(
    () =>
      categories.filter((category: any) => {
        const matchesQuery =
          !normalizedQuery ||
          category.name.toLowerCase().includes(normalizedQuery) ||
          String(category.icon || '').toLowerCase().includes(normalizedQuery)

        const matchesType =
          activeFilter === 'all' ||
          (activeFilter === 'expense' && category.type === 'EXPENSE') ||
          (activeFilter === 'income' && category.type === 'INCOME') ||
          (activeFilter === 'budget-linked' && Boolean(category.budgetLimit))

        return matchesQuery && matchesType
      }),
    [categories, activeFilter, normalizedQuery],
  )

  const expenseCategories = filteredCategories.filter((category: any) => category.type === 'EXPENSE')
  const incomeCategories = filteredCategories.filter((category: any) => category.type === 'INCOME')
  const spendByCategory = new Map<number, number>()

  for (const expense of expenses || []) {
    const categoryId = Number(expense.categoryId)
    spendByCategory.set(categoryId, (spendByCategory.get(categoryId) || 0) + (expense.amount || 0))
  }

  return (
    <section className="page-stack">
      <HeroHeader
        kicker="Categories"
        title="Make categorization visual instead of tabular."
        description="Tiles, chips, and budget-linked metadata keep category management compact and readable."
        actions={
          <>
            <button className="button button-secondary" disabled={working} onClick={initDefaultCategories} type="button">
              Seed defaults
            </button>
            <Link className="button" to="/budgets">
              View budgets
            </Link>
          </>
        }
      />

      <section className="card-grid">
        <StatCard title="Expense categories" value={String(expenseCategories.length)} caption="Buckets for spending" />
        <StatCard title="Income categories" value={String(incomeCategories.length)} caption="Sources for inflow" />
        <StatCard title="Budget-linked" value={String(categories.filter((category: any) => category.budgetLimit).length)} caption="Have thresholds" />
        <StatCard title="Custom set" value={String(categories.filter((category: any) => !category.defaultCategory).length)} caption="User-defined" />
      </section>

      <section className="dashboard-grid">
        <div className="col-span-8 page-stack">
          <article className="surface-card quick-action-card">
            <SectionHeader title={editingCategoryId ? 'Edit category' : 'Create category'} description="Modal-style editor card with color and icon controls." />
            <form className="stack form-stack" onSubmit={saveCategory}>
              <label>
                Name
                <input required value={categoryForm.name} onChange={(event) => setCategoryForm((prev: any) => ({ ...prev, name: event.target.value }))} />
              </label>
              <label>
                Type
                <select
                  value={categoryForm.type}
                  onChange={(event) => setCategoryForm((prev: any) => ({ ...prev, type: event.target.value }))}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </label>
              <label>
                Icon
                <input
                  className="category-icon-input"
                  value={categoryForm.icon}
                  onChange={(event) => setCategoryForm((prev: any) => ({ ...prev, icon: event.target.value }))}
                />
              </label>
              <div className="category-form__hint">
                <span className="filter-chip is-active">{categoryForm.icon || 'Icon'}</span>
                <p>Unicode emoji or text icons are supported. Keep one glyph per category for consistent cards.</p>
              </div>
              <label>
                Color
                <input
                  type="color"
                  value={categoryForm.colorCode}
                  onChange={(event) => setCategoryForm((prev: any) => ({ ...prev, colorCode: event.target.value }))}
                />
              </label>
              <div className="button-row">
                <button className="button button-round" disabled={working} type="submit">
                  {working ? 'Saving...' : editingCategoryId ? 'Update category' : 'Create category'}
                </button>
                {editingCategoryId ? (
                  <button
                    className="button button-secondary"
                    onClick={() => {
                      setEditingCategoryId(null)
                      setCategoryForm(defaultCategoryForm)
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
            <SectionHeader title="Expense categories" description="Compact cards with spend, budgets, and progress at a glance." />
            <div className="card-grid card-grid--2">
              {expenseCategories.length === 0 ? (
                <p className="muted">No expense categories.</p>
              ) : (
                expenseCategories.map((category: any) => {
                  const spent = spendByCategory.get(category.categoryId) || 0
                  const used = category.budgetLimit ? (spent / category.budgetLimit) * 100 : 0

                  return (
                    <article
                      className="surface-card entity-card category-card"
                      key={category.categoryId}
                      style={{ borderLeft: `4px solid ${category.colorCode || 'var(--color-primary)'}` }}
                    >
                      <div className="entity-card__header">
                        <div className="entity-card__body">
                          <Link className="entity-card__title" to={`/categories/${category.categoryId}`}>
                            <span
                              className="pill category-icon-pill"
                              style={{ background: category.colorCode || 'rgba(24,194,156,0.08)', color: '#0f172a' }}
                            >
                              {category.icon}
                            </span>
                            {category.name}
                          </Link>
                          <p className="entity-card__meta">{category.defaultCategory ? 'Default category' : 'Custom category'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong>{formatMoney(spent, primaryCurrency)}</strong>
                          <p className="entity-card__meta">Monthly spend</p>
                        </div>
                      </div>

                      <div className="stack">
                        <div className="entity-card__header" style={{ alignItems: 'center' }}>
                          <p className="entity-card__meta">Budget</p>
                          <span className="badge">{category.budgetLimit ? formatMoney(category.budgetLimit, primaryCurrency) : '—'}</span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${Math.min(100, used)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="entity-card__actions">
                        <button onClick={() => editCategory(category)} type="button">
                          Edit
                        </button>
                        <button className="button button-danger" onClick={() => void removeCategory(category.categoryId)} type="button">
                          Delete
                        </button>
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </article>
        </div>

        <div className="col-span-4 rail-stack rail-stack--sticky">
          <article className="surface-card">
            <SectionHeader title="Filters" description="Quick category scoping by type and usage." />
            <div className="chip-row">
              {[
                { id: 'all', label: 'All' },
                { id: 'expense', label: 'Expense' },
                { id: 'income', label: 'Income' },
                { id: 'budget-linked', label: 'Budget-linked' },
              ].map((filter) => (
                <button
                  className={`filter-chip${activeFilter === filter.id ? ' is-active' : ''}`}
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as typeof activeFilter)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <label style={{ marginTop: 'var(--space-3)' }}>
              Search
              <input placeholder="Search categories" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
            </label>
          </article>

          <article className="surface-card">
            <SectionHeader title="Income categories" description="Revenue buckets and source labels." />
            <div className="flow-grid">
              {incomeCategories.length === 0 ? (
                <p className="muted">No income categories.</p>
              ) : (
                incomeCategories.map((category: any) => (
                  <article className="flow-item" key={category.categoryId} style={{ borderLeft: `4px solid ${category.colorCode || 'var(--color-primary)'}` }}>
                    <div>
                      <Link className="entity-card__title" to={`/categories/${category.categoryId}`}>
                        {category.icon} {category.name}
                      </Link>
                      <p>{category.defaultCategory ? 'Default' : 'Custom'}</p>
                    </div>
                    <span className="badge">{category.budgetLimit ? `${category.budgetLimit}` : '—'}</span>
                  </article>
                ))
              )}
            </div>
          </article>

          <article className="surface-card">
            <SectionHeader title="Grouped summary" description="Quick scan of current form state." />
            <div className="chip-row">
              <span className="filter-chip is-active">{categoryForm.type}</span>
              <span className="filter-chip">{categoryForm.icon || 'Icon'}</span>
              <span className="filter-chip">{primaryCurrency}</span>
            </div>
          </article>

          <section className="card-grid card-grid--2">
            <StatCard title="Total categories" value={String(categories.length)} caption="Inventory size" />
            <StatCard title="Budget-linked" value={String(categories.filter((category: any) => category.budgetLimit).length)} caption="Threshold aware" />
            <StatCard title="Expense spend" value={formatMoney(expenseCategories.reduce((sum: number, category: any) => sum + (spendByCategory.get(category.categoryId) || 0), 0), primaryCurrency)} caption="Across buckets" />
            <StatCard title="Custom" value={String(categories.filter((category: any) => !category.defaultCategory).length)} caption="User-defined" />
          </section>
        </div>
      </section>
    </section>
  )
}
