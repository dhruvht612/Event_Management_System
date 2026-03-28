import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-6xl font-bold text-[var(--color-muted)]">404</h1>
      <p className="mt-4 text-[var(--color-muted)]">This page doesn’t exist.</p>
      <Link to="/" className="mt-6">
        <Button>Go home</Button>
      </Link>
    </div>
  )
}
