import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink } from 'lucide-react'

const product = [
  { label: 'Features', to: '/events' },
  { label: 'Event Management', to: '/events' },
  { label: 'Memberships', to: '/account' },
  { label: 'Analytics', to: '/dashboard' },
  { label: 'QR Check-in', to: '/events' },
]

const company = [
  { label: 'About', href: '#' },
  { label: 'Contact', href: 'mailto:hello@nexusevents.app' },
  { label: 'Careers', href: '#' },
  { label: 'Blog', href: '#' },
]

const resources = [
  { label: 'Help Center', href: '#' },
  { label: 'Documentation', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms', href: '#' },
]

const social = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'WhatsApp', href: 'https://wa.me' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
]

function FooterLink({ to, href, children }) {
  const className =
    'text-[0.9375rem] leading-relaxed text-zinc-400 transition duration-200 hover:text-violet-200/95'
  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={`inline-flex items-center gap-1 ${className}`}>
      {children}
      {href?.startsWith('http') && <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-45" />}
    </a>
  )
}

const colTitle = 'text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-zinc-500'

export function LandingFooter() {
  return (
    <div className="relative mt-10 w-full">
      {/* CTA — full width of parent (max-w-7xl), gradient edge-to-edge */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full"
      >
        <div className="relative w-full overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] shadow-[0_0_0_1px_rgba(139,92,246,0.1),0_24px_80px_-28px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-indigo-600/10" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-indigo-600/15 blur-3xl" />

          <div className="relative flex w-full flex-col items-center px-8 py-9 text-center sm:px-10 sm:py-10 md:px-12 lg:px-14 lg:py-11 xl:px-16">
            <h2 className="max-w-3xl font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-[2rem] lg:leading-snug">
              Ready to run your next event without the chaos?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 lg:text-[1.05rem]">
              Join organizers who use Nexus Events for registrations, memberships, and real-time communication.
            </p>
            <div className="mt-9 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/35"
              >
                Get started
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
              </Link>
              <a
                href="mailto:hello@nexusevents.app?subject=Book%20a%20demo"
                className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/[0.06] px-10 py-4 text-base font-semibold text-white transition duration-300 hover:border-violet-400/35 hover:bg-white/[0.1]"
              >
                Book demo
              </a>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main footer — full width, columns use grid for even spread */}
      <footer className="relative mt-20 w-full pb-14 pt-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 border-t border-white/[0.08] pt-16 sm:gap-x-8 md:grid-cols-3 lg:grid-cols-6 lg:gap-x-8 lg:gap-y-10 xl:gap-x-10">
          <div className="col-span-2 md:col-span-3 lg:col-span-2 lg:max-w-sm lg:pr-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-violet-500/25">
                N
              </span>
              <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-white">
                Nexus Events
              </span>
            </Link>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-zinc-400">
              Nexus Events helps student organizations and communities manage registrations, memberships,
              communication, and analytics in one place.
            </p>
          </div>

          <div className="min-w-0">
            <h3 className={colTitle}>Product</h3>
            <ul className="mt-5 flex flex-col gap-[0.65rem]">
              {product.map((item) => (
                <li key={item.label}>
                  <FooterLink to={item.to}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className={colTitle}>Company</h3>
            <ul className="mt-5 flex flex-col gap-[0.65rem]">
              {company.map((item) => (
                <li key={item.label}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className={colTitle}>Resources</h3>
            <ul className="mt-5 flex flex-col gap-[0.65rem]">
              {resources.map((item) => (
                <li key={item.label}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className={colTitle}>Social</h3>
            <ul className="mt-5 flex flex-col gap-[0.65rem]">
              {social.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[0.9375rem] text-zinc-400 transition duration-200 hover:text-violet-200/95"
                  >
                    {item.label}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        <div className="flex flex-col items-center justify-between gap-5 text-center text-sm text-zinc-500 sm:flex-row sm:text-left">
          <p>© 2026 Nexus Events</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <a href="#" className="transition hover:text-zinc-300">
              Privacy Policy
            </a>
            <a href="#" className="transition hover:text-zinc-300">
              Terms of Service
            </a>
            <span className="text-zinc-500">Built for student orgs and hackathons</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
