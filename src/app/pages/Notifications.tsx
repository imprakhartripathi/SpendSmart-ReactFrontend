import HeroHeader from '@/app/components/HeroHeader'
import SectionHeader from '@/app/components/SectionHeader'
import StatCard from '@/app/components/StatCard'

export default function NotificationsPage({ data }: { data: any }) {
  const {
    notifications,
    markNotificationRead,
    acknowledgeNotification,
    deleteNotification,
    markAllRead,
    working,
  } = data

  const unread = notifications.filter((notification: any) => !notification.read).length

  return (
    <section className="stack-lg">
      <HeroHeader
        kicker="Notifications"
        title="A calmer notification center, designed like an alert console."
        description="Critical items rise to the top while informational notes stay visually restrained."
        actions={
          <button className="button button-secondary" disabled={working} onClick={markAllRead} type="button">
            Mark all read
          </button>
        }
      />

      <section className="card-grid">
        <StatCard title="Total" value={String(notifications.length)} caption="All messages" />
        <StatCard title="Unread" value={String(unread)} caption="Needs attention" tone={unread ? 'warning' : 'good'} />
        <StatCard title="Critical" value={String(notifications.filter((n: any) => n.severity === 'CRITICAL').length)} caption="Highest priority" tone="bad" />
        <StatCard title="Acknowledged" value={String(notifications.filter((n: any) => n.acknowledged).length)} caption="Handled items" />
      </section>

      <article className="surface-card">
        <SectionHeader title="Notification feed" description="Balanced density for fast scanning and action." />
        <div className="list-grid">
          {notifications.length === 0 ? (
            <p className="muted">You're all caught up.</p>
          ) : (
            notifications.map((notification: any) => (
              <article
                className={`notification-card severity-${notification.severity.toLowerCase()}`}
                key={notification.notificationId}
              >
                <div className="row-bottom" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <strong>{notification.title}</strong>
                    <p className="muted">{notification.type}</p>
                  </div>
                  <span className="badge">{notification.severity}</span>
                </div>
                <p>{notification.message}</p>
                <small className="muted">{new Date(notification.createdAt).toLocaleString()}</small>
                <div className="button-row">
                  {!notification.read ? (
                    <button onClick={() => void markNotificationRead(notification.notificationId)} type="button">
                      Mark read
                    </button>
                  ) : null}
                  {!notification.acknowledged ? (
                    <button
                      className="button button-secondary"
                      onClick={() => void acknowledgeNotification(notification.notificationId)}
                      type="button"
                    >
                      Acknowledge
                    </button>
                  ) : null}
                  <button
                    className="button button-danger"
                    onClick={() => void deleteNotification(notification.notificationId)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </article>
    </section>
  )
}
