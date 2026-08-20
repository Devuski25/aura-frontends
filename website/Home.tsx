import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Check, Mic } from "lucide-react"
import { cardHover, fadeUp, staggerContainer, staggerItem } from "@/lib/motion"
import WebdesHero from "@website/assets/webdes.png"

export function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="px-10 py-0">
        <div className="mx-auto grid max-w-[1040px] items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="m-0 max-w-[20ch] text-4xl font-bold leading-tight tracking-tighter text-aura-text md:text-[2.35rem]">
              AI-assisted respiratory screening.
            </h1>
            <p className="mt-4 max-w-[52ch] text-base text-aura-muted md:text-lg">
              AURA-Dx — the Acoustic Unit for Respiratory Analysis — analyzes the sound of a cough through a two-tier gated AI
              pipeline: a focused check for tuberculosis first, then a second model screening for COPD, Pneumonia, or a healthy
              result.
            </p>
          </div>
          <div className="overflow-visible">
            <img
              src={WebdesHero}
              alt="AURA-Dx hero"
              className="block w-full rounded-2xl object-contain saturate-[0.95] contrast-[0.98]"
            />
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="bg-aura-bg-alt py-8">
        <div className="mx-auto max-w-[1040px] px-6">
          <h2 className="m-0 text-[1.55rem] font-bold tracking-tighter text-aura-text">How the System Works</h2>
          <p className="mt-1 text-aura-muted">One audio clip moves through two gated stages before it becomes a screening result.</p>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="mt-7 grid gap-5 md:grid-cols-2">
            <motion.div variants={staggerItem} whileHover={cardHover.whileHover} whileTap={cardHover.whileTap} className="rounded-2xl border border-aura-border-soft bg-aura-bg-card p-7 shadow-aura-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-aura-accent-light to-aura-accent-dark shadow-aura-sm">
                <Check className="h-6 w-6 text-white" />
              </div>
              <span className="inline-block rounded-full bg-aura-accent-dark px-2.5 py-0.5 text-[0.72rem] font-bold tracking-wider text-white">TIER 1</span>
              <h3 className="mt-3 text-lg font-bold text-aura-text">TB Gatekeeper</h3>
              <p className="text-sm text-aura-muted">A focused check for tuberculosis. A positive result halts the pipeline and returns an alert immediately.</p>
            </motion.div>
            <motion.div variants={staggerItem} whileHover={cardHover.whileHover} whileTap={cardHover.whileTap} className="rounded-2xl border border-aura-border-soft bg-aura-bg-card p-7 shadow-aura-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-aura-accent-light to-aura-accent-dark shadow-aura-sm">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <span className="inline-block rounded-full bg-aura-accent-dark px-2.5 py-0.5 text-[0.72rem] font-bold tracking-wider text-white">TIER 2</span>
              <h3 className="mt-3 text-lg font-bold text-aura-text">Respiratory Classifier</h3>
              <p className="text-sm text-aura-muted">If TB is ruled out, screens for COPD or Pneumonia, or confirms a healthy result.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Built for Clinic */}
      <section className="py-8">
        <div className="mx-auto max-w-[1040px] px-6">
          <div className="grid gap-9 md:grid-cols-2">
            <div>
              <h2 className="text-[1.55rem] font-bold tracking-tighter text-aura-text">Built for the Clinic</h2>
              <p className="text-aura-muted">The primary capture device is an ESP32-S3 with an INMP441 microphone over MQTT. If the device is unavailable, screening also works from a browser microphone recording or an uploaded WAV file.</p>
            </div>
            <div className="rounded-2xl border border-aura-border-soft bg-aura-bg-card p-7 shadow-aura-md">
              <h3 className="text-lg font-bold text-aura-text">Doctor / Nurse Portal</h3>
              <p className="text-sm text-aura-muted">Clinicians can review the spectrogram, confidence score, and a suggested next step for every screening session.</p>
            </div>
          </div>

          {/* FAQ */}
          <h2 className="mt-12 text-[1.55rem] font-bold tracking-tighter text-aura-text">Frequently Asked Questions</h2>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="mt-2 flex flex-col gap-3">
            {[
              {
                q: "Is a AURA-Dx result a medical diagnosis?",
                a: "No. AURA-Dx is a screening-support tool, not a certified diagnostic device. A result is a suggested next step, not a diagnosis, and should not replace evaluation by a licensed physician.",
              },
              {
                q: "What happens to my recording and results?",
                a: "Nothing is captured without your explicit consent. Once consent is given, your recording and result are stored so you or a clinician can review them later. You can request export or deletion at any time from the Legal & Privacy page.",
              },
              {
                q: "Who can see my screening history?",
                a: "Only you and logged-in clinicians can review screening results. The full Screening Dashboard, which lists results across patients, is restricted to approved doctor/nurse accounts.",
              },
              {
                q: "What conditions does AURA-Dx screen for?",
                a: "Four classes: Healthy, COPD, Pneumonia, and Tuberculosis, using the two-tier gated pipeline described on the About System page.",
              },
            ].map((faq) => (
              <motion.div key={faq.q} variants={staggerItem}>
                <details
                  className="group rounded-2xl border border-aura-border-soft bg-aura-bg-card shadow-aura-md transition-shadow hover:shadow-aura-lg"
                >
                <summary className="flex cursor-pointer list-none items-center justify-between px-5.5 py-4 text-sm font-semibold text-aura-text [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="ml-4 text-lg font-semibold text-aura-accent transition-transform group-open:rotate-180">+</span>
                </summary>
                <p className="m-0 px-5.5 pb-5 pr-6 text-sm text-aura-muted">{faq.a}</p>
              </details>
            </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Consent notice */}
      <section className="bg-aura-bg-alt py-8">
        <div className="mx-auto max-w-[1040px] px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-2xl border border-aura-border bg-gradient-to-br from-aura-bg-alt to-aura-surface-alt p-7 shadow-aura-md">
            <h3 className="text-lg font-bold text-aura-text">Consent-First, and Compliant with Philippine Law</h3>
            <p className="text-sm text-aura-muted">No audio is captured without explicit, informed consent. AURA-Dx follows the Data Privacy Act of 2012 (R.A. 10173) and the Cybercrime Prevention Act of 2012 (R.A. 10175).</p>
            <Link to="/legal" className="mt-1 inline-block font-bold text-aura-accent-dark no-underline hover:text-aura-accent">
              Read the full Legal & Privacy page &rarr;
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}