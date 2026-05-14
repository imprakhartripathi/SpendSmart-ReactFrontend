import type React from 'react'

type HeroHeaderProps = {
  kicker: string
  title: string
  description: string
  actions?: React.ReactNode
  meta?: React.ReactNode
}

export default function HeroHeader({
  kicker,
  title,
  description,
  actions,
  meta,
}: HeroHeaderProps) {
  return (
    <section className="hero hero-compact">
      <div className="hero-copy">
        <p className="eyebrow">{kicker}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="hero-meta">
        {meta}
        {actions ? <div className="hero-actions">{actions}</div> : null}
      </div>
    </section>
  )
}
