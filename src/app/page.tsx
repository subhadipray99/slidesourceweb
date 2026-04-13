import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-pattern">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <span className="text-lg font-bold tracking-tight">SlideSource</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="btn-secondary !py-2.5 !px-5 !text-sm !rounded-xl"
          >
            Log In
          </Link>
          <Link
            href="/login"
            className="btn-primary !py-2.5 !px-5 !text-sm !rounded-xl"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <div
          className="opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards] mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm text-sm text-[#8A8F98]"
        >
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-[pulse-glow_2s_ease-in-out_infinite]" />
          Now available on Android
        </div>

        {/* Heading */}
        <h1
          className="opacity-0 animate-[fade-in-up_0.6s_ease-out_0.15s_forwards] text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] tracking-tight mb-6"
        >
          The Teleprompter,{" "}
          <span className="gradient-text">Perfected.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="opacity-0 animate-[fade-in-up_0.6s_ease-out_0.3s_forwards] text-lg md:text-xl text-[#8A8F98] max-w-2xl mb-10 leading-relaxed"
        >
          Record professional-quality videos with smooth scrolling scripts,
          mirror mode, camera overlay, and precise speed controls — all in one
          elegant app.
        </p>

        {/* CTAs */}
        <div
          className="opacity-0 animate-[fade-in-up_0.6s_ease-out_0.45s_forwards] flex flex-col sm:flex-row gap-4"
        >
          <Link href="/login" className="btn-primary !px-8 !py-4 !text-base !rounded-2xl">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Get Started Free
          </Link>
          <a
            href="#features"
            className="btn-secondary !px-8 !py-4 !text-base !rounded-2xl"
          >
            Explore Features
          </a>
        </div>
      </main>

      {/* Features */}
      <section
        id="features"
        className="relative z-10 w-full max-w-6xl mx-auto px-6 mt-32 mb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="glass-card p-8 opacity-0 animate-[fade-in-up_0.6s_ease-out_0.6s_forwards]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C63FF]/20 to-[#6C63FF]/5 flex items-center justify-center mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Smooth Scrolling</h3>
            <p className="text-[#8A8F98] text-sm leading-relaxed">
              Buttery-smooth auto-scroll with precise speed controls. Adjust on
              the fly while recording.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-8 opacity-0 animate-[fade-in-up_0.6s_ease-out_0.75s_forwards]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00D4AA]/20 to-[#00D4AA]/5 flex items-center justify-center mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Camera Overlay</h3>
            <p className="text-[#8A8F98] text-sm leading-relaxed">
              See your script directly on the camera feed. Never lose eye
              contact with your audience.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-8 opacity-0 animate-[fade-in-up_0.6s_ease-out_0.9s_forwards]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C63FF]/20 to-[#00D4AA]/10 flex items-center justify-center mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B83FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Mirror Mode</h3>
            <p className="text-[#8A8F98] text-sm leading-relaxed">
              Flip your text for use with a physical teleprompter glass —
              professional studio setup made simple.
            </p>
          </div>
        </div>
      </section>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-0 animate-[fade-in-up_0.6s_ease-out_1s_forwards]">
        <span className="text-xs text-[#5A5F6B] tracking-widest uppercase">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-[#6C63FF] animate-[bounce-subtle_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
