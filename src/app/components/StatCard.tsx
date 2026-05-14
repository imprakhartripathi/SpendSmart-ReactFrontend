import type React from 'react'

type StatCardProps = {
  title: string
  value: React.ReactNode
  tone?: 'good' | 'bad' | 'neutral' | 'warning'
  caption?: string
}

export default function StatCard({
  title,
  value,
  tone = 'neutral',
  caption,
}: StatCardProps) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      {caption ? <p>{caption}</p> : null}
    </article>
  )
}
