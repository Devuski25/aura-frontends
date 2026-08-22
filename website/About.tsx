import { motion } from "framer-motion"
import { AlertTriangle, Check, ChevronDown, HeartPulse, Mic, Waves, Wind, type LucideIcon } from "lucide-react"
import { cardHover, fadeUp, staggerContainer, staggerItem } from "@/lib/motion"

const CONDITIONS: { icon: LucideIcon; name: string; chip: string; desc: string }[] = [
  { icon: HeartPulse, name: "Healthy", chip: "bg-green-100 text-green-700", desc: "Clear acoustic patterns — no signs of respiratory abnormality." },
  { icon: Wind, name: "COPD", chip: "bg-amber-100 text-amber-800", desc: "Indicators such as wheezing and prolonged expiration patterns." },
  { icon: Waves, name: "Pneumonia", chip: "bg-orange-100 text-orange-800", desc: "Patterns consistent with lung inflammation or infection." },
  { icon: AlertTriangle, name: "Tuberculosis", chip: "bg-red-100 text-red-700", desc: "Acoustic markers flagged immediately by the Tier 1 gatekeeper." },
]

export function About() {
  return (
    <div>
      {/* Hero */}
      <section className="flex items-center justify-center bg-gradient-to-b from-aura-bg-alt to-aura-bg px-6 py-18 text-center">
        <div className="mx-auto max-w-[720px]">
          <h1 className="text-[clamp(2rem,4vw,2.6rem)] font-bold leading-tight tracking-tight text-aura-text">
            About the System
          </h1>
          <p className="mx-auto mt-4 max-w-[58ch] text-lg leading-relaxed text-aura-muted">
            Coughing is not random noise. Its acoustic shape carries information about the airway that produced it. AURA-Dx — the Acoustic Unit for Respiratory Analysis — is built to read that signature.
          </p>
        </div>
      </section>

      {/* What We Screen For */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-[1.55rem] font-bold tracking-tighter text-aura-text">What We Screen For</h2>
          <p className="mt-1 text-aura-muted">
            Four respiratory classes in one pass — screening support, not a medical diagnosis. Tap a class to see its markers.
          </p>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CONDITIONS.map((condition) => (
              <motion.div key={condition.name} variants={staggerItem} className="transition-transform duration-300 hover:-translate-y-1">
                <details className="group h-full rounded-2xl border border-aura-border-soft bg-aura-bg-card shadow-aura-md transition-shadow duration-300 hover:shadow-lg">
                  <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-6 text-base font-bold text-aura-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aura-accent-dark [&::-webkit-details-marker]:hidden">
                    <span aria-hidden="true" className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${condition.chip}`}>
                      <condition.icon className="h-5 w-5" />
                    </span>
                    {condition.name}
                    <ChevronDown
                      aria-hidden="true"
                      className="ml-auto h-4 w-4 shrink-0 text-aura-muted transition-transform duration-300 group-open:rotate-180"
                    />
                  </summary>
                  <div className="grid transition-[grid-template-rows] duration-300 ease-out [grid-template-rows:0fr] group-open:[grid-template-rows:1fr]">
                    <p className="m-0 overflow-hidden px-6 pb-6 text-sm text-aura-muted">{condition.desc}</p>
                  </div>
                </details>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Two-tier pipeline */}
      <section className="bg-aura-bg-alt px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-[1.55rem] font-bold tracking-tighter text-aura-text">Two-Tier Gated Classification Pipeline</h2>
          <p className="text-aura-muted">Rather than one model guessing across every condition at once, screening runs through two purpose-built stages in sequence.</p>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="mt-7 grid gap-5 md:grid-cols-2">
            <motion.div variants={staggerItem} whileHover={cardHover.whileHover} whileTap={cardHover.whileTap} className="rounded-2xl border border-aura-border-soft bg-aura-bg-card p-7 shadow-aura-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-aura-accent-light to-aura-accent-dark shadow-aura-sm">
                <Check className="h-6 w-6 text-white" />
              </div>
              <span className="inline-block rounded-full bg-aura-accent-dark px-2.5 py-0.5 text-[0.72rem] font-bold tracking-wider text-white">TIER 1</span>
              <h3 className="mt-3 text-lg font-bold text-aura-text">TB Gatekeeper</h3>
              <p className="text-sm text-aura-muted">A focused binary check on a short 0.34s window of the cough, screening specifically for tuberculosis. A positive result halts the pipeline and returns a TB alert immediately.</p>
            </motion.div>
            <motion.div variants={staggerItem} whileHover={cardHover.whileHover} whileTap={cardHover.whileTap} className="rounded-2xl border border-aura-border-soft bg-aura-bg-card p-7 shadow-aura-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-aura-accent-light to-aura-accent-dark shadow-aura-sm">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <span className="inline-block rounded-full bg-aura-accent-dark px-2.5 py-0.5 text-[0.72rem] font-bold tracking-wider text-white">TIER 2</span>
              <h3 className="mt-3 text-lg font-bold text-aura-text">Respiratory Classifier</h3>
              <p className="text-sm text-aura-muted">If TB is ruled out, a second model analyzes a wider 2.0s window to classify the cough as COPD, Healthy, or Pneumonia.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Signal Processing */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-[1.55rem] font-bold tracking-tighter text-aura-text">Signal Processing</h2>
              <p className="text-aura-muted">Raw audio is standardized to 16 kHz mono, passed through a low-pass filter to reduce high-frequency noise, then converted into a Log-Mel Spectrogram — the same representation used for both tiers, sliced to a different time window for each.</p>
            </div>
            <motion.table variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full border-separate overflow-hidden rounded-2xl border border-aura-border-soft bg-aura-bg-card shadow-aura-md">
              <thead>
                <tr>
                  <th className="bg-aura-bg-alt px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-aura-text">Step</th>
                  <th className="bg-aura-bg-alt px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-aura-text">Detail</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Resampling", "16,000 Hz, mono"],
                  ["Low-pass filter", "5th-order Butterworth, 3,000 Hz cutoff"],
                  ["Spectrogram", "64 Mel bins, resized for ResNet18"],
                  ["Tier 1 window", "0.34 s, peak-centered"],
                  ["Tier 2 window", "2.0 s, peak-centered"],
                ].map(([step, detail]) => (
                  <tr key={step} className="group">
                    <td className="border-b border-aura-border-soft px-5 py-3.5 text-sm font-medium text-aura-text">{step}</td>
                    <td className="border-b border-aura-border-soft px-5 py-3.5 text-sm text-aura-muted group-last:border-b-0">{detail}</td>
                  </tr>
                ))}
              </tbody>
            </motion.table>
          </div>
        </div>
      </section>

    </div>
  )
}
