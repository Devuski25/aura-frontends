import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Check,
  ClipboardCheck,
  FileAudio,
  Mic,
  ShieldCheck,
  Stethoscope,
  type LucideIcon,
} from "lucide-react"
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion"
import WebdesHero from "@website/assets/webdes.png"

/* Pipeline flow map */
function FlowNode({ icon: Icon, title, sub }: { icon: LucideIcon; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-aura-border-soft bg-aura-bg-card p-4 text-center shadow-aura-sm">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-aura-accent-light to-aura-accent-dark shadow-aura-sm"
      >
        <Icon className="h-5 w-5 text-white" />
      </span>
      <p className="m-0 text-sm font-bold leading-snug text-aura-text">{title}</p>
      <p className="m-0 text-xs text-aura-muted">{sub}</p>
    </div>
  )
}

function FlowArrow() {
  return (
    <div aria-hidden="true" className="flex items-center justify-center">
      <ArrowDown className="h-5 w-5 shrink-0 text-aura-accent-dark sm:hidden" />
      <ArrowRight className="hidden h-5 w-5 shrink-0 text-aura-accent-dark sm:block" />
    </div>
  )
}

const STEPS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: ClipboardCheck, title: "Give consent", desc: "Nothing records until explicit, informed consent is given." },
  { icon: Mic, title: "Record or upload", desc: "Cough into your device microphone, or upload an existing WAV file." },
  { icon: Stethoscope, title: "Get guidance", desc: "A clinician reviews the result and the suggested next step with you." },
]

const CLINIC_FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Mic, title: "Browser Microphone", desc: "Record cough audio directly in the portal — no extra hardware needed." },
  { icon: FileAudio, title: "WAV Upload", desc: "Analyze an existing recording from any device." },
  { icon: Stethoscope, title: "Doctor / Nurse Portal", desc: "Review the spectrogram, confidence score, and a suggested next step for every session." },
]

const FAQS = [
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
    a: "Four classes: Healthy, COPD, Pneumonia, and Tuberculosis, using the two-tier gated pipeline described above.",
  },
]

export function Home() {
  const reduceMotion = useReducedMotion()

  return (
    <div>
      {/* Hero */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="m-0 max-w-[20ch] text-4xl font-bold leading-tight tracking-tighter text-aura-text md:text-[2.35rem]">
              AI-assisted respiratory screening.
            </h1>
            <p className="mt-4 max-w-[52ch] text-base text-aura-muted md:text-lg">
              AURA-Dx — the Acoustic Unit for Respiratory Analysis — analyzes the sound of a cough through a two-tier gated AI
              pipeline: a focused check for tuberculosis first, then a second model screening for COPD, Pneumonia, or a healthy
              result.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-aura-forest px-6 py-3 text-sm font-semibold text-white shadow-md transition-[background-color,box-shadow,transform] duration-150 hover:bg-green-700 hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-accent-dark focus-visible:ring-offset-2"
              >
                Login to System
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="overflow-visible">
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src={WebdesHero}
                alt="AURA-Dx hero"
                className="block w-full object-contain saturate-[0.95] contrast-[0.98] [mask-image:linear-gradient(to_right,black_80%,transparent)] [-webkit-mask-image:linear-gradient(to_right,black_80%,transparent)]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="bg-aura-bg-alt py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="m-0 text-[1.55rem] font-bold tracking-tighter text-aura-text">How the System Works</h2>
          <p className="mt-1 text-aura-muted">One audio clip moves through two gated stages before it becomes a screening result.</p>

          {/* Flow diagram */}
          <div className="mt-8 grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1.15fr_auto_1.15fr_auto_1fr]">
            <FlowNode icon={Mic} title="Audio Clip" sub="Cough recording" />
            <FlowArrow />
            <FlowNode icon={ShieldCheck} title="Tier 1 · TB Gatekeeper" sub="Focused tuberculosis screen" />
            <FlowArrow />
            <FlowNode icon={Stethoscope} title="Tier 2 · Respiratory Classifier" sub="COPD · Pneumonia · Healthy" />
            <FlowArrow />
            <FlowNode icon={Activity} title="Screening Result" sub="Confidence score + suggested next step" />
          </div>

          {/* Gate outcomes */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden="true" />
              <p className="m-0 text-sm text-gray-900">
                <strong className="font-semibold">TB detected</strong> — the pipeline stops at Tier 1 and alerts the clinician
                immediately.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-700" aria-hidden="true" />
              <p className="m-0 text-sm text-gray-900">
                <strong className="font-semibold">TB-negative</strong> — audio proceeds to Tier 2 for respiratory classification.
              </p>
            </div>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="mt-7 grid gap-5 md:grid-cols-2">
            <motion.div variants={staggerItem} className="rounded-2xl border border-aura-border-soft bg-aura-bg-card p-7 shadow-aura-md transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-aura-accent-light to-aura-accent-dark shadow-aura-sm">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <span className="inline-block rounded-full bg-aura-accent-dark px-2.5 py-0.5 text-[0.72rem] font-bold tracking-wider text-white">TIER 1</span>
              <h3 className="mt-3 text-lg font-bold text-aura-text">TB Gatekeeper</h3>
              <p className="text-sm text-aura-muted">A focused check for tuberculosis. A positive result halts the pipeline and returns an alert immediately.</p>
            </motion.div>
            <motion.div variants={staggerItem} className="rounded-2xl border border-aura-border-soft bg-aura-bg-card p-7 shadow-aura-md transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-aura-accent-light to-aura-accent-dark shadow-aura-sm">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="inline-block rounded-full bg-aura-accent-dark px-2.5 py-0.5 text-[0.72rem] font-bold tracking-wider text-white">TIER 2</span>
              <h3 className="mt-3 text-lg font-bold text-aura-text">Respiratory Classifier</h3>
              <p className="text-sm text-aura-muted">If TB is ruled out, screens for COPD or Pneumonia, or confirms a healthy result.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="m-0 text-[1.55rem] font-bold tracking-tighter text-aura-text">Getting Screened Is Simple</h2>
          <p className="mt-1 text-aura-muted">Three steps, under a minute of your time.</p>
          <motion.ol variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="mt-9 grid list-none gap-5 p-0 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.li key={step.title} variants={staggerItem} className="relative rounded-2xl border border-aura-border-soft bg-aura-bg-card p-6 pt-8 shadow-aura-md">
                <span
                  aria-hidden="true"
                  className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-aura-forest text-sm font-bold text-white shadow-aura-sm tabular-nums"
                >
                  {i + 1}
                </span>
                <span aria-hidden="true" className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-aura-mint-soft text-aura-forest">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="text-base font-bold text-aura-text">{step.title}</h3>
                <p className="mt-1 text-sm text-aura-muted">{step.desc}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* Built for Clinic */}
      <section className="bg-aura-bg-alt py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-9 md:grid-cols-[1fr_1.05fr]">
            <div>
              <h2 className="m-0 text-[1.55rem] font-bold tracking-tighter text-aura-text">Built for the Clinic</h2>
              <p className="text-aura-muted">
                No special hardware needed — AURA-Dx runs in any modern browser. Clinicians capture a cough sample and get
                structured, reviewable results in seconds.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {CLINIC_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 rounded-xl border border-aura-border-soft bg-aura-bg-card p-5 shadow-aura-md transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-aura-mint-soft text-aura-forest">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-aura-text">{feature.title}</h3>
                    <p className="mt-0.5 text-sm text-aura-muted">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <h2 className="mt-16 text-[1.55rem] font-bold tracking-tighter text-aura-text">Frequently Asked Questions</h2>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="mt-2 flex flex-col gap-3">
            {FAQS.map((faq) => (
              <motion.div key={faq.q} variants={staggerItem}>
                <details className="group rounded-2xl border border-aura-border-soft bg-aura-bg-card shadow-aura-md transition-shadow hover:shadow-aura-lg">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-5.5 py-4 text-sm font-semibold text-aura-text [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <span className="ml-4 text-lg font-semibold text-aura-accent transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <div className="grid transition-[grid-template-rows] duration-300 ease-out [grid-template-rows:0fr] group-open:[grid-template-rows:1fr]">
                    <p className="m-0 overflow-hidden px-5.5 pb-5 pr-6 text-sm text-aura-muted">{faq.a}</p>
                  </div>
                </details>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Consent notice */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-2xl border border-aura-border bg-gradient-to-br from-aura-bg-alt to-aura-surface-alt p-7 shadow-aura-md">
            <h3 className="text-lg font-bold text-aura-text">Consent-First, and Compliant with Philippine Law</h3>
            <p className="text-sm text-aura-muted">No audio is captured without explicit, informed consent. AURA-Dx follows the Data Privacy Act of 2012 (R.A. 10173) and the Cybercrime Prevention Act of 2012 (R.A. 10175).</p>
            <Link to="/legal" className="mt-1 inline-block font-bold text-aura-accent-dark no-underline hover:text-aura-accent">
              Read the full Legal &amp; Privacy page &rarr;
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
