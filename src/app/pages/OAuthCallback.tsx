import { Link } from 'react-router-dom'

export default function OAuthCallback({ data }: { data: any }) {
  const { flash } = data

  return (
    <main className="app-auth-shell">
      {flash ? <p className={`flash flash-${flash.kind}`}>{flash.text}</p> : null}

      <section className="auth-layout auth-layout--callback">
        <article className="surface-card auth-panel auth-panel--accent callback-panel">
          <p className="eyebrow">SpendSmart</p>
          <h1>Completing your sign-in.</h1>
          <p>Hang tight while we finish connecting your account.</p>
          <div className="callback-loader" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <Link className="button button-secondary button-round" to="/">
            Return home
          </Link>
        </article>
      </section>
    </main>
  )
}
