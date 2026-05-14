import type React from 'react'

type SectionHeaderProps = {
  title: string
  description?: string
  actions?: React.ReactNode
}

export default function SectionHeader({
  title,
  description,
  actions,
}: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="section-actions">{actions}</div> : null}
    </div>
  )
}
