import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-pattern">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FFD700] flex items-center justify-center text-black font-black text-xl">
            S
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">SlideSource</span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555555] hover:text-[#FFD700] transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/login"
            className="btn-primary !py-2 !px-6 !text-[10px] !rounded-lg"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto pt-20">
        {/* Badge */}
        <div
          className="opacity-0 animate-[fade-in-up_0.5s_ease-out_forwards] mb-10 inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#222222] bg-[#111111] text-[10px] font-bold uppercase tracking-[0.2em] text-[#555555]"
        >
          <span className="w-2 h-2 rounded-full bg-[#FFD700]" />
          Now available on Android
        </div>

        {/* Heading */}
        <h1
          className="opacity-0 animate-[fade-in-up_0.5s_ease-out_0.1s_forwards] text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tighter uppercase italic mb-8"
        >
          THE PROMPTER<br />
          <span className="text-[#FFD700]">PERFECTED.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="opacity-0 animate-[fade-in-up_0.5s_ease-out_0.2s_forwards] text-base md:text-lg text-[#888888] max-w-2xl mb-12 leading-relaxed font-medium"
        >
          Professional video recording with smooth scrolling,
          360° Rotation, camera overlay, and precise speed controls.
          The only teleprompter you will ever need.
        </p>

        {/* CTAs */}
        <div
          className="opacity-0 animate-[fade-in-up_0.5s_ease-out_0.3s_forwards] flex flex-col sm:flex-row gap-6"
        >
          <Link href="/login" className="btn-primary !px-10 !py-5 !text-sm !rounded-xl">
            GET STARTED FREE
          </Link>
          <a
            href="#features"
            className="btn-secondary !px-10 !py-5 !text-sm !rounded-xl uppercase font-black tracking-widest"
          >
            EXPLORE
          </a>
        </div>
      </main>

      {/* Features */}
      <section
        id="features"
        className="relative z-10 w-full max-w-6xl mx-auto px-6 mt-40 mb-32"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-card p-10 opacity-0 animate-[fade-in-up_0.5s_ease-out_0.4s_forwards] border-l-4 border-l-[#FFD700]">
            <h3 className="text-xl font-black uppercase mb-4 tracking-tight">Smooth Scrolling</h3>
            <p className="text-[#888888] text-sm leading-relaxed font-medium">
              Buttery-smooth auto-scroll with precise speed controls. Adjust on
              the fly while recording your takes.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-10 opacity-0 animate-[fade-in-up_0.5s_ease-out_0.5s_forwards] border-l-4 border-l-[#FFD700]">
            <h3 className="text-xl font-black uppercase mb-4 tracking-tight">Camera Overlay</h3>
            <p className="text-[#888888] text-sm leading-relaxed font-medium">
              See your script directly on the camera feed. Maintain perfect eye
              contact with your audience at all times.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-10 opacity-0 animate-[fade-in-up_0.5s_ease-out_0.6s_forwards] border-l-4 border-l-[#FFD700]">
            <h3 className="text-xl font-black uppercase mb-4 tracking-tight">360° Rotation</h3>
            <p className="text-[#888888] text-sm leading-relaxed font-medium">
              Flip your text for use with physical teleprompter glass.
              A professional studio setup simplified for mobile.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-12 border-t border-[#111111] text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#222222]">
          © 2026 SLIDESOURCE. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
}
