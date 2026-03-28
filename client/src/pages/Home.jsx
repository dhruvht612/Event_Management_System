import { HeroSection } from '../components/landing/HeroSection.jsx'
import { TrustSection } from '../components/landing/TrustSection.jsx'
import { LandingFooter } from '../components/landing/LandingFooter.jsx'
import { landingContainer } from '../lib/landingLayout.js'

export function Home() {
  return (
    <div className="relative min-h-dvh overflow-hidden text-zinc-100">
      {/* Base: deep navy → black */}
      <div className="pointer-events-none absolute inset-0 bg-[#020617]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0f1f] via-[#020617] to-[#010409]" />

      {/* Soft radial glows */}
      <div className="pointer-events-none absolute -left-[15%] top-[6%] h-[min(110vw,640px)] w-[min(110vw,640px)] rounded-full bg-violet-600/[0.14] blur-[120px]" />
      <div className="pointer-events-none absolute -right-[8%] top-0 h-[min(90vw,480px)] w-[min(90vw,480px)] rounded-full bg-indigo-500/[0.12] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[6%] left-1/2 h-[min(40vh,320px)] w-[min(96%,56rem)] max-w-7xl -translate-x-1/2 rounded-full bg-violet-900/[0.08] blur-[100px]" />

      {/* Subtle mesh grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_22%,#000_25%,transparent_78%)]"
        aria-hidden
      />

      {/* Ultra-light noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_78%_62%_at_50%_32%,rgba(2,6,23,0)_0%,rgba(1,4,12,0.5)_52%,rgba(0,0,0,0.72)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-dvh flex-col">
        {/* Hero: ~90–100vh minus nav; content vertically centered */}
        <div
          className={`${landingContainer} flex min-h-[88svh] flex-1 flex-col justify-center py-8 sm:min-h-[calc(100svh-5rem)] sm:py-10 md:py-12 lg:min-h-[calc(100svh-4.5rem)]`}
        >
          <HeroSection />
        </div>

        {/* Transition into lower sections */}
        <div
          className="pointer-events-none h-24 shrink-0 bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617] sm:h-28"
          aria-hidden
        />

        <div className={landingContainer}>
          <TrustSection />
        </div>

        <div className={landingContainer}>
          <LandingFooter />
        </div>
      </div>
    </div>
  )
}
