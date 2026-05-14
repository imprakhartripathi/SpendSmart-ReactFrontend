import type React from 'react'

type ChartCardProps = {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  size?: 'compact' | 'default' | 'tall'
}

export default function ChartCard({
  title,
  description,
  action,
  children,
  size = 'default',
}: ChartCardProps) {
  return (
    <article className={`surface-card chart-card chart-card--${size}`}>
      <div className="section-header">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        {action ? <div className="section-actions">{action}</div> : null}
      </div>
      <div className="chart-box">{children}</div>
    </article>
  )
}
