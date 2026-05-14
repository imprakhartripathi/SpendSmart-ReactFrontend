type TooltipProps = {
  active?: boolean
  payload?: Array<{
    name?: string
    dataKey?: string
    value?: number | string
    color?: string
    fill?: string
  }>
  label?: number | string
  currency?: string
}

export default function ChartTooltip({
  active,
  payload,
  label,
  currency = 'USD',
}: TooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{String(label)}</div>
      <div className="chart-tooltip__rows">
        {payload.map((entry) => {
          const value =
            typeof entry.value === 'number'
              ? new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency,
                  maximumFractionDigits: 2,
                }).format(entry.value)
              : String(entry.value ?? '0')

          return (
            <div className="chart-tooltip__row" key={entry.name || entry.dataKey}>
              <div className="chart-tooltip__key">
                <span
                  className="chart-tooltip__swatch"
                  style={{ background: entry.color || entry.fill || 'var(--color-primary)' }}
                />
                <span>{entry.name || entry.dataKey}</span>
              </div>
              <strong>{value}</strong>
            </div>
          )
        })}
      </div>
    </div>
  )
}
