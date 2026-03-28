import { adminGlass } from '../../components/admin/adminUi.js'

export function AdminSettings() {
  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-sm text-zinc-500">
        Platform settings are partially implemented. Use environment variables and server config for production
        branding, email, and payments.
      </p>
      {[
        { title: 'Branding', body: 'Logo, colors, and email templates — configure via deployment / future CMS.' },
        { title: 'Email notifications', body: 'SMTP and templates in server services — see server/.env.' },
        { title: 'Payments', body: 'Stripe keys and webhook — Payments routes.' },
        { title: 'Moderation', body: 'Auto-flag thresholds — extend message pipeline.' },
      ].map((s) => (
        <div key={s.title} className={`${adminGlass} p-6`}>
          <h3 className="font-semibold text-white">{s.title}</h3>
          <p className="mt-2 text-sm text-zinc-400">{s.body}</p>
        </div>
      ))}
    </div>
  )
}
