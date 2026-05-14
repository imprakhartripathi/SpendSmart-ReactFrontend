import type React from 'react'

type InsightCardProps = {
  title: string
  value?: string
  description?: string
  tone?: 'good' | 'bad' | 'neutral' | 'warning'
  action?: React.ReactNode
}

export default function InsightCard({
  title,
  value,
  description,
  tone = 'neutral',
  action,
}: InsightCardProps) {
  return (
    <article className={`insight-card tone-${tone}`}>
      <div className="insight-copy">
        <span>{title}</span>
        {value ? <strong>{value}</strong> : null}
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="insight-action">{action}</div> : null}
    </article>
  )
}
