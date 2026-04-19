import { Link } from 'react-router-dom'
import InsightCard from '@/app/components/InsightCard'

export default function SignupPage({ data }: { data: any }) {
  const {
    registerFullName,
    setRegisterFullName,
    registerEmail,
    setRegisterEmail,
    registerPassword,
    setRegisterPassword,
    onRegister,
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
            <h1>Create your workspace.</h1>
            <p>
              Start with the essentials, then enter your finance defaults later
              without slowing down signup.
            </p>
          </div>

          {/* <div className="auth-proof auth-proof--soft">
            <strong>Quick setup</strong>
            <p>Name, email, and password are all you need to get started.</p>
          </div>

          <div className="auth-proof auth-proof--soft">
            <strong>OAuth ready</strong>
            <p>Prefer Google or GitHub? You can jump in with either one.</p>
          </div> */}

          <InsightCard
            title="Quick setup"
            description="Name, email, and password are all you need to get started."
            tone="neutral"
          />

          <InsightCard
            title="OAuth ready"
            description="Prefer Google or GitHub? You can jump in with either one."
            tone="neutral"
          />

          <InsightCard
            title="Finance defaults later"
            description="Set currency and budget preferences after signup so the first step stays effortless."
            tone="neutral"
          />
        </aside>

        <section className="auth-forms">
          <article className="surface-card auth-panel auth-panel--accent">
            <div className="auth-tabs auth-tabs--single">
              <Link className="auth-tab" to="/login">
                Login
              </Link>
              <span className="auth-tab is-active">Create account</span>
            </div>

            <form className="stack" onSubmit={onRegister}>
              <div className="section-header">
                <div>
                  <h3>Create account</h3>
                  <p>Set up your access in under a minute.</p>
                </div>
              </div>

              <label>
                Full name
                <input
                  autoComplete="name"
                  required
                  value={registerFullName}
                  onChange={(event) => setRegisterFullName(event.target.value)}
                />
              </label>
              <label>
                Email
                <input
                  autoComplete="email"
                  required
                  type="email"
                  value={registerEmail}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                />
              </label>
              <label>
                Password
                <input
                  autoComplete="new-password"
                  required
                  type="password"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                />
              </label>

              <div
                className="auth-proof"
                style={{
                  background: "rgba(24, 194, 156, 0.08)",
                  borderColor: "rgba(24, 194, 156, 0.14)",
                }}
              >
                <strong>Defaults later</strong>
                <p>
                  We’ll apply currency, timezone, and goal settings after signup
                  so this stays fast.
                </p>
              </div>

              <div className="button-row button-row--stack">
                <button disabled={working} type="submit">
                  {working ? "Working..." : "Get started"}
                </button>
                <button
                  className="button button-secondary"
                  disabled={working}
                  onClick={() => void startOAuthLogin("google")}
                  type="button"
                >
                  Sign up with Google
                </button>
                <button
                  className="button button-secondary"
                  disabled={working}
                  onClick={() => void startOAuthLogin("github")}
                  type="button"
                >
                  Sign up with GitHub
                </button>
              </div>
            </form>
          </article>
        </section>
      </section>
    </main>
  );
}
