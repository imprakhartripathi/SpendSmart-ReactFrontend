import { Link } from 'react-router-dom'
import InsightCard from '@/app/components/InsightCard'

export default function LoginPage({ data }: { data: any }) {
  const {
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    onLogin,
    startOAuthLogin,
    working,
    flash,
  } = data

  return (
    <main className="app-auth-shell">
      {flash ? (
        <p className={`flash flash-${flash.kind}`}>{flash.text}</p>
      ) : null}

      <section className="auth-layout auth-layout--split">
        <aside className="hero auth-story auth-story--compact">
          <div className="hero-copy">
            <p className="eyebrow">SpendSmart</p>
            <h1>Welcome back.</h1>
            <p>
              Sign in to pick up your finance workspace with the same clean
              hierarchy and control.
            </p>
          </div>

          {/* <div className="auth-proof auth-proof--soft">
            <strong>Fast access</strong>
            <p>
              One login and you’re back in your dashboard, budgets, and expense
              tracking.
            </p>
          </div>

          <div className="auth-proof auth-proof--soft">
            <strong>Trusted sign-in</strong>
            <p>
              Use email or OAuth from the same page without extra onboarding
              noise.
            </p>
          </div> */}

          <InsightCard
            title="Fast access"
            description="One login and you’re back in your dashboard, budgets, and expense
              tracking."
            tone="neutral"
          />

          <InsightCard
            title="Trusted sign-in"
            description="YUse email or OAuth from the same page without extra onboarding
              noise."
            tone="neutral"
          />

          <InsightCard
            title="Always organized"
            description="Your data stays routed into overview, expenses, income, budgets, and profile."
            tone="neutral"
          />
        </aside>

        <section className="auth-forms">
          <article className="surface-card auth-panel auth-panel--accent">
            <div className="auth-tabs auth-tabs--single">
              <span className="auth-tab is-active">Login</span>
              <Link className="auth-tab" to="/signup">
                Create account
              </Link>
            </div>

            <form className="stack" onSubmit={onLogin}>
              <div className="section-header">
                <div>
                  <h3>Sign in</h3>
                  <p>Use your email and password to continue.</p>
                </div>
              </div>

              <label>
                Email
                <input
                  autoComplete="email"
                  required
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                />
              </label>
              <label>
                Password
                <input
                  autoComplete="current-password"
                  required
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                />
              </label>

              <div className="button-row button-row--stack">
                <button disabled={working} type="submit">
                  {working ? "Working..." : "Login"}
                </button>
                <button
                  className="button button-secondary"
                  disabled={working}
                  onClick={() => void startOAuthLogin("google")}
                  type="button"
                >
                  Continue with Google
                </button>
                <button
                  className="button button-secondary"
                  disabled={working}
                  onClick={() => void startOAuthLogin("github")}
                  type="button"
                >
                  Continue with GitHub
                </button>
              </div>
            </form>
          </article>
        </section>
      </section>
    </main>
  );
}
