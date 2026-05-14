import HeroHeader from '@/app/components/HeroHeader'
import SectionHeader from '@/app/components/SectionHeader'

export default function ProfilePage({ data }: { data: any }) {
  const {
    profile,
    profileName,
    setProfileName,
    profileEmail,
    profileTimezone,
    setProfileTimezone,
    profileAvatar,
    setProfileAvatar,
    profileBio,
    setProfileBio,
    profileCurrency,
    setProfileCurrency,
    profileMonthlyBudget,
    setProfileMonthlyBudget,
    updateProfile,
    updateCurrency,
    updateMonthlyBudget,
    deactivateAccount,
    working,
  } = data

  return (
    <section className="page-stack">
      <HeroHeader
        kicker="Profile"
        title="Profile settings that feel like a premium account console."
        description="Identity, preferences, security, and danger-zone actions are grouped with stronger hierarchy."
      />

      <section className="dashboard-grid">
        <article className="surface-card col-span-8 page-stack profile-main">
          <div className="profile-identity">
            <div className="avatar avatar-teal profile-avatar">
              {profileAvatar ? (
                <img alt={profileName || profile?.fullName} src={profileAvatar} />
              ) : (
                <span>
                  {(profileName || profile?.fullName || 'SP')
                    .split(' ')
                    .map((part: string) => part[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </span>
              )}
            </div>
            <div className="profile-identity__copy">
              <p className="eyebrow">Account summary</p>
              <h3>{profileName || profile?.fullName}</h3>
              <p>{profile?.email}</p>
            </div>
          </div>

          <section className="profile-metric-grid">
            <article className="profile-metric-card">
              <span>Budget</span>
              <strong>{profileMonthlyBudget || '0'}</strong>
              <p>Monthly goal</p>
            </article>
            <article className="profile-metric-card">
              <span>Timezone</span>
              <strong>{profileTimezone}</strong>
              <p>Scheduling context</p>
            </article>
            <article className="profile-metric-card">
              <span>Currency</span>
              <strong>{profile?.currency || 'USD'}</strong>
              <p>Primary spend currency</p>
            </article>
            <article className={`profile-metric-card ${profile?.active ? 'tone-good' : 'tone-bad'}`}>
              <span>Status</span>
              <strong>{profile?.active ? 'Active' : 'Inactive'}</strong>
              <p>Account state</p>
            </article>
          </section>

          <SectionHeader title="Identity" description="Grouped fields for profile metadata and bio." />
          <form className="stack form-stack profile-form" onSubmit={updateProfile}>
            <label>
              Full name
              <input required value={profileName} onChange={(event) => setProfileName(event.target.value)} />
            </label>
            <label className="profile-account-email">
              <span>Account email</span>
              <input readOnly value={profileEmail} />
            </label>
            <label>
              Timezone
              <input value={profileTimezone} onChange={(event) => setProfileTimezone(event.target.value)} />
            </label>
            <label>
              Avatar URL
              <input value={profileAvatar} onChange={(event) => setProfileAvatar(event.target.value)} />
            </label>
            <label>
              Bio
              <textarea rows={3} value={profileBio} onChange={(event) => setProfileBio(event.target.value)} />
            </label>
            <div className="profile-form__actions">
              <button disabled={working} type="submit">
                {working ? 'Saving...' : 'Update profile'}
              </button>
            </div>
          </form>
        </article>

        <div className="col-span-4 rail-stack rail-stack--sticky">
          <article className="surface-card">
            <SectionHeader title="Preferences" description="Currency and monthly goal stay isolated." />
            <div className="stack form-stack">
              <label>
                Currency
                <select value={profileCurrency} onChange={(event) => setProfileCurrency(event.target.value)}>
                  {['USD', 'INR', 'EUR', 'GBP'].map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </label>
              <div className="button-row button-row--stack">
                <button disabled={working} onClick={updateCurrency} type="button">
                  Save currency
                </button>
              </div>
              <label>
                Monthly budget goal
                <input
                  min="0"
                  step="0.01"
                  type="number"
                  value={profileMonthlyBudget}
                  onChange={(event) => setProfileMonthlyBudget(event.target.value)}
                />
              </label>
              <div className="button-row button-row--stack">
                <button disabled={working} onClick={updateMonthlyBudget} type="button">
                  Save goal
                </button>
              </div>
            </div>
          </article>

          {/* <article className="surface-card">
            <SectionHeader title="Security" description="Auth-service managed security actions." />
            <div className="flow-grid">
              <div className="flow-item">
                <div>
                  <strong>Session protection</strong>
                  <p>JWT sessions and OAuth flows stay in the auth service.</p>
                </div>
                <button className="button button-secondary" disabled={working} type="button">
                  Manage
                </button>
              </div>
            </div>
          </article> */}

          <article className="danger-zone">
            <div>
              <strong>Danger zone</strong>
              <p>Deactivation blocks access while preserving audit history.</p>
            </div>
            <button className="button button-danger" disabled={working} onClick={deactivateAccount} type="button">
              Deactivate
            </button>
          </article>
        </div>
      </section>
    </section>
  )
}
