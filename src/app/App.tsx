import { config } from '@/config/config'

function App() {
  const runtimeDetails = [
    { label: 'Mode', value: config.app.mode },
    { label: 'API Base URL', value: config.api.baseUrl },
    { label: 'API Timeout', value: `${config.api.timeoutMs}ms` },
    {
      label: 'Devtools',
      value: config.features.enableDevtools ? 'Enabled' : 'Disabled',
    },
  ]

  return (
    <main className="app-shell">
      <section className="app-card">
        <p className="app-eyebrow">SpendSmart Frontend</p>
        <h1 className="app-title">{config.app.name}</h1>
        <p className="app-subtitle">
          Structured React + TypeScript setup with centralized env and config
          layers.
        </p>

        <div className="config-grid">
          {runtimeDetails.map((detail) => (
            <div className="config-row" key={detail.label}>
              <span className="config-label">{detail.label}</span>
              <code className="config-value">{detail.value}</code>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
