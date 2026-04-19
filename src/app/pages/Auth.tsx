import { useState } from 'react'
import InsightCard from '@/app/components/InsightCard'
import StatCard from '@/app/components/StatCard'

type AuthMode = 'login' | 'signup'

export default function Auth({ data }: { data: any }) {
  const {
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    onLogin,
    startOAuthLogin,
    registerFullName,
    setRegisterFullName,
    registerEmail,
    setRegisterEmail,
    registerPassword,
    setRegisterPassword,
    onRegister,
    working,
    flash,
  } = data

  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <main className="app-auth-shell">
      {flash ? <p className={`flash flash-${flash.kind}`}>{flash.text}</p> : null}

      <section className="auth-layout">
        <aside className="hero auth-story">
          <div className="hero-copy">
            <p className="eyebrow">Premium fintech workspace</p>
            <h1>Money command center for adults.</h1>
            <p>
              SpendSmart surfaces the signal first with clear hierarchy, routed workspaces,
              and a calmer control surface for everyday finance decisions.
            </p>
          </div>

          <div className="auth-proofs">
            <div className="auth-proof">
              <strong>8 route workspace</strong>
              <p>Overview, spend, budgets, and profile stay separate and bookmarkable.</p>
            </div>
            <div className="auth-proof">
              <strong>Microservice-backed</strong>
              <p>Auth, analytics, income, budget, and notification services remain wired.</p>
            </div>
            <div className="auth-proof">
              <strong>Trust-first layout</strong>
              <p>Dense data, soft borders, and premium teal surfaces instead of noise.</p>
            </div>
          </div>

          <div className="row-2">
            <StatCard title="Net savings" value="$4,682" tone="good" caption="This month" />
            <StatCard title="Budget health" value="92%" tone="good" caption="Across active budgets" />
          </div>

          <div className="auth-note-grid">
            <InsightCard
              title="Signal"
              description="Balances, guardrails, and alerts are surfaced before decoration."
              tone="neutral"
            />
            <InsightCard
              title="Friction"
              description="Signup stays lightweight. Defaults are completed during onboarding step two."
              tone="neutral"
            />
          </div>
        </aside>

        <section className="auth-forms">
          <article className="surface-card auth-panel">
            <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
              <button
                aria-selected={mode === 'login'}
                className={`auth-tab${mode === 'login' ? ' is-active' : ''}`}
                onClick={() => setMode('login')}
                type="button"
              >
                Login
              </button>
              <button
                aria-selected={mode === 'signup'}
                className={`auth-tab${mode === 'signup' ? ' is-active' : ''}`}
                onClick={() => setMode('signup')}
                type="button"
              >
                Create account
              </button>
            </div>

            {mode === 'login' ? (
              <form className="stack" onSubmit={onLogin}>
                <div className="section-header">
                  <div>
                    <h3>Welcome back</h3>
                    <p>Continue into your routed dashboard.</p>
                  </div>
                </div>

                <label>
                  Email
                  <input
                    required
                    type="email"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                  />
                </label>
                <label>
                  Password
                  <input
                    required
                    type="password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                  />
                </label>

                <div className="row-3">
                  <button disabled={working} type="submit">
                    {working ? 'Working...' : 'Login'}
                  </button>
                  <button
                    className="button button-secondary"
                    disabled={working}
                    onClick={() => void startOAuthLogin('google')}
                    type="button"
                  >
                    Google
                  </button>
                  <button
                    className="button button-secondary"
                    disabled={working}
                    onClick={() => void startOAuthLogin('github')}
                    type="button"
                  >
                    GitHub
                  </button>
                </div>
              </form>
            ) : (
              <form className="stack" onSubmit={onRegister}>
                <div className="section-header">
                  <div>
                    <h3>Create account</h3>
                    <p>Step one stays quick. Defaults land in onboarding step two.</p>
                  </div>
                </div>

                <label>
                  Full name
                  <input
                    required
                    value={registerFullName}
                    onChange={(event) => setRegisterFullName(event.target.value)}
                  />
                </label>
                <label>
                  Email
                  <input
                    required
                    type="email"
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                  />
                </label>
                <label>
                  Password
                  <input
                    required
                    type="password"
                    value={registerPassword}
                    onChange={(event) => setRegisterPassword(event.target.value)}
                  />
                </label>

                <div className="auth-proof" style={{ background: 'rgba(24, 194, 156, 0.08)', borderColor: 'rgba(24, 194, 156, 0.14)' }}>
                  <strong>Step 2 onboarding</strong>
                  <p>
                    Currency, timezone, and monthly goal are applied as defaults after signup so
                    this screen stays fast and low-friction.
                  </p>
                </div>

                <div className="button-row">
                  <button disabled={working} type="submit">
                    {working ? 'Working...' : 'Create account'}
                  </button>
                </div>
              </form>
            )}
          </article>
        </section>
      </section>
    </main>
  )
}
