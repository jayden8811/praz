"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import {
  Check,
  Globe,
  Loader2,
  Mail,
  MessageSquareText,
  Pause,
  Phone,
  PhoneIncoming,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

type ChapterId = "icp" | "phone" | "done" | "build" | "calls";

const chapters: { id: ChapterId; label: string; who: "You" | "Praz"; ms: number }[] = [
  { id: "icp", label: "Describe buyer", who: "You", ms: 7200 },
  { id: "phone", label: "Add number", who: "You", ms: 4600 },
  { id: "done", label: "Hand it off", who: "You", ms: 2600 },
  { id: "build", label: "Build & launch", who: "Praz", ms: 6800 },
  { id: "calls", label: "Buyers call", who: "Praz", ms: 7000 },
];

const starts = chapters.reduce<number[]>(
  (acc, c, i) => [...acc, i === 0 ? 0 : acc[i - 1] + chapters[i - 1].ms],
  []
);
const TOTAL = starts[starts.length - 1] + chapters[chapters.length - 1].ms;

const ICP_TEXT =
  "CFOs and VPs of Finance at US B2B SaaS companies doing $10M–$50M ARR, 50–250 employees, raised a Series B or later.";
const PHONE_TEXT = "(415) 555-0142";

const ICP_CHIPS = ["CFO · VP Finance", "United States", "B2B SaaS", "$10M–$50M ARR", "50–250 staff", "Series B+"];

const typed = (text: string, lt: number, start: number, cps: number) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor(((lt - start) / 1000) * cps))));

const fmtTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/* ------------------------------------------------------------------ */
/* Player                                                              */
/* ------------------------------------------------------------------ */

export function DemoPlayer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "-20% 0px -20% 0px" });
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!playing || !inView) {
      last.current = null;
      return;
    }
    let raf = 0;
    const tick = (now: number) => {
      if (last.current != null) {
        const dt = now - last.current;
        setT((prev) => (prev + dt) % TOTAL);
      }
      last.current = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, inView]);

  const idx = Math.max(0, starts.findLastIndex((s) => t >= s));
  const chapter = chapters[idx];
  const lt = t - starts[idx];

  const jump = useCallback((i: number) => {
    setT(starts[i] + 1);
    setPlaying(true);
  }, []);

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-4xl">
      {/* glow */}
      <div className="pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 rounded-[2rem] bg-[radial-gradient(closest-side,rgba(250,204,21,0.08),transparent)] blur-2xl" />

      <div className="glass overflow-hidden rounded-xl">
        {/* window chrome */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-3.5 py-2.5">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-white/10" />
            <span className="size-2.5 rounded-full bg-white/10" />
            <span className="size-2.5 rounded-full bg-white/10" />
          </div>
          <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3" /> app.praz.io/onboarding
          </div>
          <div className="w-10" />
        </div>

        <div className="grid min-h-[380px] grid-cols-1 md:grid-cols-[190px_1fr]">
          {/* sidebar */}
          <aside className="hidden flex-col gap-1 border-r border-white/[0.06] p-3 md:flex">
            <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              Process
            </p>
            {chapters.map((c, i) => {
              const state = i < idx ? "done" : i === idx ? "active" : "todo";
              return (
                <button
                  key={c.id}
                  onClick={() => jump(i)}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors cursor-pointer",
                    state === "active" ? "text-white" : "text-muted-foreground hover:text-white/80"
                  )}
                >
                  {state === "active" && (
                    <motion.span
                      layoutId="demo-active"
                      className="absolute inset-0 rounded-md bg-white/[0.06]"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative flex size-4 items-center justify-center rounded-full border text-[9px] transition-colors",
                      state === "done" && "border-yellow-300/40 bg-yellow-300/15 text-yellow-200",
                      state === "active" && "border-white/40 text-white",
                      state === "todo" && "border-white/15"
                    )}
                  >
                    {state === "done" ? <Check className="size-2.5" /> : i + 1}
                  </span>
                  <span className="relative flex-1">{c.label}</span>
                  <span
                    className={cn(
                      "relative rounded px-1 py-px text-[9px] font-medium",
                      c.who === "You" ? "bg-yellow-300/10 text-yellow-200/90" : "bg-white/[0.06] text-white/60"
                    )}
                  >
                    {c.who}
                  </span>
                </button>
              );
            })}
            <div className="mt-auto rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5 text-[11px] leading-relaxed text-muted-foreground">
              <span className="text-white">Your part:</span> two inputs.
              <br />
              <span className="text-white">Ours:</span> everything else.
            </div>
          </aside>

          {/* stage */}
          <div className="relative overflow-hidden p-5 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                {chapter.id === "icp" && <IcpScene lt={lt} />}
                {chapter.id === "phone" && <PhoneScene lt={lt} />}
                {chapter.id === "done" && <DoneScene />}
                {chapter.id === "build" && <BuildScene lt={lt} />}
                {chapter.id === "calls" && <CallsScene lt={lt} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* player controls */}
        <div className="flex items-center gap-3 border-t border-white/[0.06] bg-black/20 px-3.5 py-2.5">
          <button
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause" : "Play"}
            className="flex size-7 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <span className="w-16 text-[11px] tabular-nums text-muted-foreground">
            {fmtTime(t)} / {fmtTime(TOTAL)}
          </span>
          <div className="flex flex-1 gap-1">
            {chapters.map((c, i) => {
              const p = i < idx ? 1 : i > idx ? 0 : lt / c.ms;
              return (
                <button
                  key={c.id}
                  onClick={() => jump(i)}
                  aria-label={`Jump to ${c.label}`}
                  className="group relative h-4 cursor-pointer"
                  style={{ flex: c.ms }}
                >
                  <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/10 transition-all group-hover:h-[5px]">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-yellow-300/80"
                      style={{ width: `${p * 100}%` }}
                    />
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => jump(0)}
            aria-label="Restart"
            className="flex size-7 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

function SceneHeader({ step, who, title, sub }: { step: number; who: string; title: string; sub: string }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-yellow-200/80">
        Step {step} · {who}
      </p>
      <h3 className="mt-1.5 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Caret() {
  return <span className="caret ml-px inline-block h-[1.05em] w-px translate-y-[2px] bg-yellow-200" />;
}

function IcpScene({ lt }: { lt: number }) {
  const text = typed(ICP_TEXT, lt, 500, 30);
  const doneTyping = text.length === ICP_TEXT.length;
  const typedAt = 500 + (ICP_TEXT.length / 30) * 1000;

  return (
    <div>
      <SceneHeader step={1} who="You" title="Who do you sell to?" sub="Plain English. No filters, no spreadsheets." />
      <div className="glass-inset rounded-lg p-3.5">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MessageSquareText className="size-3" /> Ideal customer
        </div>
        <p className="min-h-[3.75rem] text-sm leading-relaxed text-white">
          {text}
          {!doneTyping && <Caret />}
        </p>
      </div>

      <div className="mt-4 flex min-h-[3.5rem] flex-wrap content-start items-start gap-1.5">
        {doneTyping &&
          ICP_CHIPS.map((c, i) => (
            <motion.span
              key={c}
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.09, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-1 rounded-full border border-yellow-300/20 bg-yellow-300/[0.07] px-2 py-0.5 text-[11px] text-yellow-100"
            >
              <Check className="size-2.5" /> {c}
            </motion.span>
          ))}
      </div>
      {lt > typedAt + 600 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground"
        >
          <Sparkles className="size-3 text-yellow-200" /> Understood. ~4,800 matching decision-makers.
        </motion.p>
      )}
    </div>
  );
}

function PhoneScene({ lt }: { lt: number }) {
  const text = typed(PHONE_TEXT, lt, 400, 12);
  const doneTyping = text.length === PHONE_TEXT.length;
  const pressed = lt > 2900;
  const sent = lt > 3600;

  return (
    <div>
      <SceneHeader step={2} who="You" title="Where should buyers reach you?" sub="Interested prospects get routed straight to this number." />
      <div className="glass-inset flex items-center gap-2 rounded-lg p-1.5">
        <span className="flex items-center gap-1.5 rounded-md bg-white/[0.05] px-2.5 py-1.5 text-xs text-white/80">
          <Globe className="size-3" /> US +1
        </span>
        <span className="flex-1 px-1 text-sm tabular-nums text-white">
          {text || <span className="text-muted-foreground/60">(000) 000-0000</span>}
          {!doneTyping && <Caret />}
        </span>
        <motion.span
          animate={{ scale: pressed && !sent ? 0.95 : 1 }}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-300",
            sent ? "bg-yellow-300/15 text-yellow-100" : doneTyping ? "bg-white text-zinc-950" : "bg-white/10 text-white/40"
          )}
        >
          {sent ? (
            <>
              <Check className="size-3" /> Saved
            </>
          ) : pressed ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <>
              Hand it off <Send className="size-3" />
            </>
          )}
        </motion.span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-[11px]">
        {["Live calls", "SMS alerts", "Calendar booking"].map((x, i) => (
          <motion.div
            key={x}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="glass-inset rounded-md px-2.5 py-2 text-muted-foreground"
          >
            <span className="text-white">{x}</span>
            <br />
            routed to you
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DoneScene() {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
      <motion.svg viewBox="0 0 52 52" className="size-14">
        <motion.circle
          cx="26"
          cy="26"
          r="24"
          fill="rgba(250,204,21,0.08)"
          stroke="rgba(250,204,21,0.5)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <motion.path
          d="M16 27l7 7 13-15"
          fill="none"
          stroke="#fef08a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.45, duration: 0.45, ease: "easeOut" }}
        />
      </motion.svg>
      <motion.h3
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-5 text-xl font-semibold tracking-tight"
      >
        That&apos;s it. <span className="hl" data-on="true">Your part is done.</span>
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-1.5 text-xs text-muted-foreground"
      >
        Average onboarding time: under 5 minutes.
      </motion.p>
    </div>
  );
}

const BUILD_STEPS = [
  { icon: Users, label: "Decision-makers sourced", meta: "4,812 contacts" },
  { icon: ShieldCheck, label: "Emails triple-verified", meta: "99.1% valid" },
  { icon: Globe, label: "Domains & inboxes configured", meta: "12 domains · 36 inboxes" },
  { icon: Mail, label: "Inboxes warmed", meta: "SPF · DKIM · DMARC" },
  { icon: Sparkles, label: "Copy written by our team", meta: "3-step sequence" },
  { icon: Send, label: "Campaign live", meta: "1,000 / day" },
];

function BuildScene({ lt }: { lt: number }) {
  const per = 950;
  return (
    <div>
      <SceneHeader step={3} who="Praz" title="We build and launch everything." sub="Managed by a real operator. Not a dashboard you babysit." />
      <ul className="space-y-1.5">
        {BUILD_STEPS.map((s, i) => {
          const start = 300 + i * per;
          if (lt < start) return null;
          const done = lt > start + per * 0.75;
          const Icon = s.icon;
          return (
            <motion.li
              key={s.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="glass-inset relative flex items-center gap-3 overflow-hidden rounded-md px-3 py-2"
            >
              {!done && <span className="shimmer absolute inset-0" />}
              <Icon className="size-3.5 text-white/50" />
              <span className="flex-1 text-[13px]">{s.label}</span>
              <span className="text-[11px] tabular-nums text-muted-foreground">{s.meta}</span>
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full transition-colors duration-300",
                  done ? "bg-yellow-300/20 text-yellow-200" : "text-white/40"
                )}
              >
                {done ? <Check className="size-2.5" /> : <Loader2 className="size-3 animate-spin" />}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

const REPLIES = [
  { name: "Dana R.", role: "CFO · Lumen Health", msg: "Timing is good. Can you call me Thursday?" },
  { name: "Marcus T.", role: "VP Finance · Arcline", msg: "Interested. What does onboarding look like?" },
  { name: "Priya S.", role: "CFO · Northwind", msg: "Send over a time, happy to chat." },
];

function CallsScene({ lt }: { lt: number }) {
  const ringing = lt > 3200;
  return (
    <div>
      <SceneHeader step={4} who="Praz" title="Interested buyers go straight to you." sub="We qualify every reply and route the hot ones to your phone." />
      <div className="grid gap-3 md:grid-cols-[1fr_200px]">
        <div className="space-y-1.5">
          {REPLIES.map((r, i) => {
            if (lt < 300 + i * 900) return null;
            return (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="glass-inset rounded-md px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/10 text-[9px] font-medium">
                    {r.name[0]}
                  </span>
                  <span className="text-xs font-medium">{r.name}</span>
                  <span className="text-[10px] text-muted-foreground">{r.role}</span>
                  <span className="ml-auto rounded bg-yellow-300/10 px-1.5 py-px text-[9px] font-medium text-yellow-200">
                    Qualified
                  </span>
                </div>
                <p className="mt-1 pl-7 text-xs text-white/70">“{r.msg}”</p>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {ringing && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="glass flex flex-col items-center rounded-xl px-4 py-5 text-center"
            >
              <div className="relative flex size-11 items-center justify-center">
                {[0, 1].map((k) => (
                  <motion.span
                    key={k}
                    className="absolute inset-0 rounded-full border border-yellow-300/40"
                    animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: k * 0.8, ease: "easeOut" }}
                  />
                ))}
                <motion.span
                  animate={{ rotate: [0, -12, 12, -12, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.6 }}
                  className="flex size-11 items-center justify-center rounded-full bg-yellow-300 text-zinc-950"
                >
                  <PhoneIncoming className="size-4.5" />
                </motion.span>
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Incoming call</p>
              <p className="mt-0.5 text-sm font-medium">Dana R. · CFO</p>
              <p className="text-[11px] text-muted-foreground">Lumen Health · $40k ACV</p>
              <div className="mt-3 flex items-center gap-1 rounded-full bg-white/[0.05] px-2 py-1 text-[10px] text-white/70">
                <Phone className="size-2.5" /> +1 {PHONE_TEXT}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
