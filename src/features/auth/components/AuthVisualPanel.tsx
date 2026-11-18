import { Building2 } from "lucide-react";

const BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1707857858965-03a0f42dd053?w=1600&q=80";

/** Shared visual panel for Nestora's desktop authentication screens. */
export function AuthVisualPanel() {
  return (
    <aside className="split-visual" aria-hidden>
      <img src={BACKGROUND_IMAGE} alt="" />
      <div className="content">
        <div className="flex items-center gap-3 text-white/90">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/12 backdrop-blur">
            <Building2 size={18} />
          </div>
          <span className="font-display text-xl italic">Nestora</span>
        </div>

        <div className="max-w-md space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            Association Portal · v1
          </p>
          <h1 className="font-display text-5xl italic leading-[1.05] text-white">
            A quiet place<br />for the people<br />who make yours.
          </h1>
          <p className="max-w-sm text-[15px] leading-relaxed text-white/70">
            Nestora is the private space where your association&apos;s members
            stay in the loop — with dignity, warmth, and a little more
            elegance than a group chat.
          </p>
        </div>

        <div className="font-mono text-xs text-white/50">
          © {new Date().getFullYear()} · A Membership OS
        </div>
      </div>
      <div className="vertical-word">nestora.</div>
    </aside>
  );
}
