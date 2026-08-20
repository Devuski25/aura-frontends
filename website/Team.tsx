import { motion } from "framer-motion"
import { staggerContainer, staggerItem } from "@/lib/motion"
import DesireeImg from "@website/assets/team/desiree-mejes.jpg"
import AhldousImg from "@website/assets/team/ahldous-argayoso.jpg"
import RheinImg from "@website/assets/team/rhein-cama.jpg"
import MichaelImg from "@website/assets/team/michael-nepomuceno.jpg"
import MarkImg from "@website/assets/team/mark-pesuelo.jpg"

const TEAM = [
  { name: "Desiree May Mejes", initials: "DM", img: DesireeImg, role: "Researcher" },
  { name: "Ahldous Meinard Argayoso", initials: "AA", img: AhldousImg, role: "Researcher" },
  { name: "Rhein David Cama", initials: "RC", img: RheinImg, role: "Researcher" },
  { name: "Michael Harvy Nepomuceno", initials: "MN", img: MichaelImg, role: "Researcher" },
  { name: "Mark Louie Pesuelo", initials: "MP", img: MarkImg, role: "Researcher" },
]

function TeamCard({ member, index: _index }: { member: typeof TEAM[number]; index: number }) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
      className="rounded-[18px] border border-aura-border-soft bg-aura-elevated/70 px-4 py-5.5 text-center shadow-aura-md hover:shadow-aura-lg"
    >
      <div className="relative mx-auto mb-3.5 h-28 w-28 overflow-hidden rounded-full border-[3px] border-aura-accent/25 bg-aura-bg-alt">
        <img
          src={member.img}
          alt={member.name}
          className="block h-full w-full scale-[1.01] object-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.style.display = "none"
            const fb = e.currentTarget.parentElement?.querySelector(".initials-fallback") as HTMLElement
            if (fb) fb.style.display = "grid"
          }}
          onLoad={(e) => {
            const fb = e.currentTarget.parentElement?.querySelector(".initials-fallback") as HTMLElement
            if (fb) fb.style.display = "none"
          }}
        />
        <div className="initials-fallback absolute inset-0 hidden items-center justify-center rounded-full bg-aura-accent-soft text-aura-accent-dark text-lg font-extrabold">
          {member.initials}
        </div>
      </div>
      <h3 className="m-0 text-base font-bold text-aura-text">{member.name}</h3>
      <div className="mt-1 text-[0.70rem] font-semibold text-aura-muted">{member.role}</div>
    </motion.div>
  )
}

export function Team() {
  return (
    <div>
      {/* Hero */}
      <section className="flex items-center justify-center bg-gradient-to-b from-aura-bg-alt to-aura-bg px-6 py-18 text-center">
        <div className="mx-auto max-w-[720px]">
          <h1 className="text-[clamp(2rem,4vw,2.6rem)] font-bold leading-tight tracking-tight text-aura-text">
            Our Team
          </h1>
          <p className="mx-auto mt-4 max-w-[58ch] text-lg leading-relaxed text-aura-muted">
            AURA-Dx is a BS Computer Engineering thesis project from the University of Rizal System — Morong Campus, built and defended by the team below.
          </p>
        </div>
      </section>

      {/* Team grid */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-[1040px]">
          <div className="mb-6 text-center">
            <h2 className="text-[clamp(1.6rem,2.5vw,2.2rem)] font-extrabold leading-tight tracking-[-0.01em] text-aura-text">
              Project Team
            </h2>
          </div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {TEAM.map((member, i) => (
              <TeamCard key={member.name} member={member} index={i} />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
