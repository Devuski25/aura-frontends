/**
 * Ambient audio-waveform backdrop for the auth pages.
 *
 * Pure CSS/DOM animation (no images/video): a row of thin vertical bars
 * that gently rise and fall out of phase, evoking an acoustic respiratory
 * waveform. Rendered at very low opacity behind the auth card so the form
 * stays the focal point. Honors prefers-reduced-motion via CSS (see
 * `.aura-wave-bar` rules in index.css) — the bars freeze at full height.
 */

// Deterministic height factors (0–1) shaped like a calm waveform envelope.
const BAR_HEIGHTS = [
  0.35, 0.6, 0.45, 0.8, 0.55, 0.95, 0.4, 0.7, 0.5, 0.85,
  0.3, 0.65, 0.9, 0.42, 0.58, 0.75, 0.38, 0.88, 0.52, 0.68,
  0.33, 0.78, 0.47, 0.92, 0.62, 0.44, 0.72, 0.55,
]

const FOREST = "#0E3B36"
const MINT = "#1E9E73"

export function WaveformBackground() {
  const bars = [...BAR_HEIGHTS, ...BAR_HEIGHTS]
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-between overflow-hidden opacity-30"
    >
      {bars.map((factor, i) => (
        <span
          key={i}
          className="aura-wave-bar w-[3px] shrink-0 rounded-full"
          style={{
            height: `${Math.round(factor * 100)}%`,
            backgroundColor: i % 2 === 0 ? FOREST : MINT,
            animationDuration: `${4.5 + (i % 3)}s`,
            animationDelay: `${-((i * 0.53) % 7)}s`,
          }}
        />
      ))}
    </div>
  )
}
