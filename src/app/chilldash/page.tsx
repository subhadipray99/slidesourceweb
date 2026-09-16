import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Chill Dash — A little delivery, a little adventure",
  description:
    "Chill Dash is a cozy delivery-boy simulator about good routes, small adventures, and getting things delivered.",
};

const garageScreenshot =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/screen_v1028_garage-OPl12aT1DSdJhCHDDU2mKkXAPhVXgO.png";
const deliveryScreenshot =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/screen_v1028_garage_real-hzSUy2Zsxl3rVujQsuo9tkbZvqEiYO.png";

export default function ChilldashPage() {
  return (
    <main className={styles.page}>
      <div className={styles.sun} aria-hidden="true" />
      <nav className={styles.nav} aria-label="Main navigation">
        <a className={styles.brand} href="#top" aria-label="Chill Dash home">
          <span className={styles.brandMark}>CD</span>
          <span>chill dash<span className={styles.brandDot}>.</span></span>
        </a>
        <a className={styles.navLink} href="#waitlist">Join the ride <span aria-hidden="true">↗</span></a>
      </nav>

      <section id="top" className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span className={styles.pulse} /> coming soon · mobile game</p>
          <h1 className={styles.heroTitle}>Good things,<br /><em className={styles.accent}>delivered.</em></h1>
          <p className={styles.intro}>
            A cozy delivery adventure where every order takes you somewhere new. Hop on, take the scenic route, and make someone&apos;s day.
          </p>
          <a className={styles.primaryButton} href="#waitlist">Get early access <span aria-hidden="true">→</span></a>
          <p className={styles.note}>No spam. Just a little sunshine when we launch.</p>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.sticker}>A LITTLE<br />ADVENTURE</div>
          <div className={styles.phoneFrame}>
            <img src={garageScreenshot} alt="Chill Dash map screen showing the player garage and neighborhood" />
          </div>
          <div className={styles.routeCard}><span>●</span> Sunnyvale <strong>→</strong> home sweet garage</div>
        </div>
      </section>

      <section className={styles.marquee} aria-label="Game highlights">
        <span>deliver with heart</span><b>✦</b><span>take the long way</span><b>✦</b><span>good things, delivered</span><b>✦</b>
      </section>

      <section className={styles.story}>
        <div>
          <p className={styles.eyebrow}>Your neighborhood, your pace</p>
          <h2 className={styles.sectionTitle}>Every street has<br /><em className={styles.accent}>a story.</em></h2>
        </div>
        <p className={styles.storyText}>Pick up coffee for a neighbor, find a shortcut through the park, or simply cruise around with nowhere else to be. Chill Dash is a soft little world built for slow mornings and small wins.</p>
      </section>

      <section className={styles.screens} aria-label="Chill Dash gameplay previews">
        <figure className={`${styles.screenCard} ${styles.screenCardTall}`}>
          <img src={deliveryScreenshot} alt="Chill Dash delivery screen with a coffee order and accept delivery button" />
          <figcaption className={styles.caption}><span className={styles.captionNumber}>01</span> Pick up something good</figcaption>
        </figure>
        <figure className={`${styles.screenCard} ${styles.screenCardShort}`}>
          <img src={garageScreenshot} alt="Chill Dash overhead neighborhood map with roads and delivery locations" />
          <figcaption className={styles.caption}><span className={styles.captionNumber}>02</span> Find your own way</figcaption>
        </figure>
      </section>

      <section id="waitlist" className={styles.waitlist}>
        <div className={styles.waitlistIntro}>
          <p className={styles.eyebrow}>The door is almost open</p>
          <h2 className={styles.sectionTitle}>Be first<br />on the <em className={styles.accent}>route.</em></h2>
          <p>Sign up for launch news, behind-the-scenes peeks, and a little bonus for your first delivery.</p>
        </div>
        <div className={styles.formShell}>
          <iframe
            title="Chill Dash waitlist form"
            src="https://docs.google.com/forms/d/e/1FAIpQLSdIlfYnLiuEDTKomDtZO43TnclkCbOCv6Ye2UJvXPpDH21zBA/viewform?embedded=true"
            width="640"
            height="2483"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
          >
            Loading…
          </iframe>
        </div>
      </section>

      <footer className={styles.footer}>
        <a className={styles.brand} href="#top"><span className={styles.brandMark}>CD</span><span>chill dash<span className={styles.brandDot}>.</span></span></a>
        <p>made for sunny side streets · © 2026</p>
      </footer>
    </main>
  );
}
