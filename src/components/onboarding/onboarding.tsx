"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Globe, Inbox, Loader2, Lock, Pencil, Phone } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { AnimatedNumber } from "@/components/animated-number";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { formatVolume, pricing, site, volumes } from "@/lib/site";
import { destination, destinationValid, emptySetup, goalLabel, goals, saveSetup, type Goal, type Setup } from "@/lib/setup";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const DRAFT_KEY = "praz:onboarding-draft";
const MIN_DEAL = 10000;

const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

type StepId = "business" | "targeting" | "offer" | "sender" | "goal" | "plan" | "review" | "payment";

const steps: { id: StepId; title: string; sub: string }[] = [
  { id: "business", title: "Tell us about your business", sub: "So we can position you correctly." },
  { id: "targeting", title: "Who should we reach?", sub: "Plain English is fine. We turn it into a verified lead list." },
  { id: "offer", title: "What do you offer them?", sub: "This becomes the core of your email copy." },
  { id: "sender", title: "Who are emails sent from?", sub: "We set up the domains and inboxes for you." },
  { id: "goal", title: "What happens when someone's interested?", sub: "Pick where we send interested buyers." },
  { id: "plan", title: "Choose your volume", sub: "You can change this anytime from your dashboard." },
  { id: "review", title: "Review your setup", sub: "Check everything before your operator starts building." },
  { id: "payment", title: "Start your subscription", sub: "Secure checkout by Stripe. Cancel anytime." },
];

function isValid(id: StepId, s: Setup) {
  switch (id) {
    case "business":
      return !!s.company.trim() && !!s.website.trim() && !!s.offer.trim() && s.dealSize > 0;
    case "targeting":
      return s.icp.trim().length >= 10;
    case "offer":
      return !!s.problem.trim() && !!s.cta.trim();
    case "sender":
      return !!s.senderName.trim() && !!s.address.trim();
    case "goal":
      return destinationValid(s);
    default:
      return true;
  }
}

export function Onboarding() {
  const [setup, setSetup] = useState<Setup>(emptySetup);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        setSetup({ ...emptySetup, ...draft.setup });
        setStep(Math.min(draft.step ?? 0, steps.length - 1));
      }
    } catch {
      // no saved draft
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ setup, step }));
    } catch {
      // storage unavailable
    }
  }, [setup, step]);

  const set = <K extends keyof Setup>(key: K, value: Setup[K]) => setSetup((s) => ({ ...s, [key]: value }));
  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const current = steps[step];
  const valid = isValid(current.id, setup);

  const finish = () => {
    saveSetup(setup);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setDone(true);
  };

  return (
    <div className="relative flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-4 py-3 md:px-5">
        <span className="text-[13px] font-medium text-white/90">Onboarding</span>
        {!done && (
          <span className="text-[12px] tabular-nums text-muted-foreground">
            Step {step + 1} of {steps.length}
          </span>
        )}
      </header>

      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col px-4 pb-16 pt-10 md:pt-14">
        <div className="flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease }}>
            <LogoMark className="size-12 text-white" />
          </motion.div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={done ? "done" : current.id}
              initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.4, ease }}
            >
              <h1 className="mt-5 text-balance text-[22px] font-medium tracking-[-0.02em]">
                {done ? "You're all set." : current.title}
              </h1>
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                {done ? "Your operator will reach out within one business day." : current.sub}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {!done && (
          <div className="mt-6 flex gap-1" aria-hidden>
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => i < step && go(i)}
                className={cn("h-1 flex-1 overflow-hidden rounded-full bg-white/10", i < step && "cursor-pointer")}
                tabIndex={-1}
              >
                <motion.span
                  className="block h-full rounded-full bg-yellow-300/80"
                  initial={false}
                  animate={{ width: i <= step ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease }}
                />
              </button>
            ))}
          </div>
        )}

        <div className="mt-6">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={done ? "done" : current.id}
              custom={dir}
              initial={{ opacity: 0, x: 16 * dir, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -16 * dir, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease }}
            >
              {done ? (
                <Done setup={setup} />
              ) : (
                <div className="glass space-y-4 rounded-xl p-5">
                  {current.id === "business" && <BusinessStep setup={setup} set={set} />}
                  {current.id === "targeting" && <TargetingStep setup={setup} set={set} />}
                  {current.id === "offer" && <OfferStep setup={setup} set={set} />}
                  {current.id === "sender" && <SenderStep setup={setup} set={set} />}
                  {current.id === "goal" && <GoalStep setup={setup} set={set} />}
                  {current.id === "plan" && <PlanStep setup={setup} set={set} />}
                  {current.id === "review" && <ReviewStep setup={setup} edit={go} />}
                  {current.id === "payment" && <PaymentStep setup={setup} onPaid={finish} />}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {!done && (
          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              onClick={() => go(step - 1)}
              disabled={step === 0}
              className="flex h-9 items-center gap-1.5 rounded-md px-3 text-[12px] text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white disabled:pointer-events-none disabled:opacity-0 cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> Back
            </button>
            {current.id !== "payment" && (
              <button
                onClick={() => go(step + 1)}
                disabled={!valid}
                className="group flex h-9 items-center gap-1.5 rounded-md bg-white px-4 text-[12px] font-medium text-zinc-950 transition-all hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40 cursor-pointer"
              >
                {current.id === "review" ? "Continue to payment" : "Continue"}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

type StepProps = { setup: Setup; set: <K extends keyof Setup>(key: K, value: Setup[K]) => void };

function Field({
  id,
  label,
  optional,
  hint,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {optional && <span className="text-muted-foreground/60">· optional</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  optional,
  hint,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
  hint?: string;
  type?: string;
}) {
  return (
    <Field id={id} label={label} optional={optional} hint={hint}>
      <Input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="h-9 text-[13px]" />
    </Field>
  );
}

function AreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  optional,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
  hint?: string;
}) {
  return (
    <Field id={id} label={label} optional={optional} hint={hint}>
      <Textarea id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

function BusinessStep({ setup, set }: StepProps) {
  return (
    <>
      <TextField id="company" label="Company name" value={setup.company} onChange={(v) => set("company", v)} placeholder="Northwind Capital" />
      <TextField id="website" label="Website" value={setup.website} onChange={(v) => set("website", v)} placeholder="northwind.com" />
      <AreaField
        id="offer"
        label="What do you sell, in one sentence?"
        value={setup.offer}
        onChange={(v) => set("offer", v)}
        placeholder="Fractional CFO services for venture-backed SaaS companies."
      />
      <Field id="deal" label="Average deal size or client LTV">
        <div className="flex items-center gap-3">
          <Slider
            value={[Math.min(Math.max(setup.dealSize, 5000), 500000)]}
            min={5000}
            max={500000}
            step={5000}
            onValueChange={([v]) => set("dealSize", v)}
            className="flex-1"
          />
          <div className="flex items-center gap-1">
            <span className="text-[12px] text-muted-foreground">$</span>
            <Input
              id="deal"
              type="number"
              value={setup.dealSize}
              onChange={(e) => set("dealSize", Number(e.target.value) || 0)}
              className="h-8 w-24 text-right text-[13px]"
            />
          </div>
        </div>
        <AnimatePresence>
          {setup.dealSize > 0 && setup.dealSize < MIN_DEAL && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden text-[11px] text-yellow-100/90"
            >
              Praz is built for deal sizes of $10k and up. You can continue, and we&apos;ll review whether it&apos;s a fit before launch.
            </motion.p>
          )}
        </AnimatePresence>
      </Field>
    </>
  );
}

function TargetingStep({ setup, set }: StepProps) {
  return (
    <>
      <AreaField
        id="icp"
        label="Describe your ideal customer"
        value={setup.icp}
        onChange={(v) => set("icp", v)}
        placeholder="Decision makers of Finance at US B2B SaaS companies doing $10M–$50M ARR that raised a Series B or later."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="titles" label="Job titles" optional value={setup.titles} onChange={(v) => set("titles", v)} placeholder="CFO, VP Finance" />
        <TextField id="industries" label="Industries" optional value={setup.industries} onChange={(v) => set("industries", v)} placeholder="B2B SaaS, Fintech" />
        <TextField id="size" label="Company size" optional value={setup.companySize} onChange={(v) => set("companySize", v)} placeholder="50–250 employees" />
        <TextField id="locations" label="Locations" optional value={setup.locations} onChange={(v) => set("locations", v)} placeholder="United States" />
      </div>
    </>
  );
}

function OfferStep({ setup, set }: StepProps) {
  return (
    <>
      <AreaField
        id="problem"
        label="What problem do you solve for them?"
        value={setup.problem}
        onChange={(v) => set("problem", v)}
        placeholder="Finance teams that can't keep up with board reporting after a Series B."
      />
      <AreaField
        id="proof"
        label="Proof: results, case studies or notable clients"
        optional
        value={setup.proof}
        onChange={(v) => set("proof", v)}
        placeholder="Helped 40+ SaaS companies close their books in 5 days instead of 20."
      />
      <TextField
        id="cta"
        label="What do you offer prospects?"
        value={setup.cta}
        onChange={(v) => set("cta", v)}
        placeholder="A free 20-minute finance stack review"
        hint="A low-friction first step converts best: an audit, a teardown, a short call."
      />
    </>
  );
}

function SenderStep({ setup, set }: StepProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="senderName" label="Sender name" value={setup.senderName} onChange={(v) => set("senderName", v)} placeholder="Jordan Lee" />
        <TextField id="senderTitle" label="Sender title" optional value={setup.senderTitle} onChange={(v) => set("senderTitle", v)} placeholder="Partner" />
      </div>
      <TextField
        id="domainStyle"
        label="Domain preferences"
        optional
        value={setup.domainStyle}
        onChange={(v) => set("domainStyle", v)}
        placeholder="getnorthwind.com, northwindhq.com"
        hint="We register separate sending domains so your main domain stays protected. Included in your plan."
      />
      <TextField
        id="address"
        label="Business address"
        value={setup.address}
        onChange={(v) => set("address", v)}
        placeholder="500 Howard St, San Francisco, CA 94105"
        hint="Required in every email footer for CAN-SPAM compliance."
      />
    </>
  );
}

const goalIcons: Record<Goal, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  book: CalendarDays,
  website: Globe,
  inbox: Inbox,
};

export function GoalPicker({ value, onChange }: { value: Goal; onChange: (g: Goal) => void }) {
  return (
    <div role="radiogroup" aria-label="Goal" className="grid gap-2">
      {goals.map((g) => {
        const Icon = goalIcons[g.value];
        const active = value === g.value;
        return (
          <button
            key={g.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(g.value)}
            className={cn(
              "glass-inset flex items-start gap-3 rounded-lg px-3.5 py-3 text-left transition-all duration-300 cursor-pointer",
              active ? "border-yellow-300/40 bg-yellow-300/[0.06]" : "hover:border-white/15 hover:bg-white/[0.04]"
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md transition-colors",
                active ? "bg-yellow-300/20 text-yellow-100" : "bg-white/[0.06] text-white/70"
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <span className="flex-1">
              <span className="block text-[13px] font-medium">{g.title}</span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">{g.example}</span>
            </span>
            <span
              className={cn(
                "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                active ? "border-yellow-300/60 bg-yellow-300 text-zinc-950" : "border-white/20"
              )}
            >
              {active && <Check className="size-2.5" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function GoalDetails({ setup, set }: StepProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={setup.goal}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.25 }}
        className="space-y-4"
      >
        {setup.goal === "call" && (
          <>
            <TextField
              id="phone"
              type="tel"
              label="Phone number to send calls to"
              value={setup.phone}
              onChange={(v) => set("phone", v)}
              placeholder="+1 (415) 555-0142"
              hint="We give prospects a tracked number that forwards here, so every call shows up in your dashboard."
            />
            <TextField
              id="hours"
              label="When can you take calls?"
              optional
              value={setup.hours}
              onChange={(v) => set("hours", v)}
              placeholder="Mon–Fri, 9am–6pm PT"
            />
          </>
        )}
        {setup.goal === "book" && (
          <TextField
            id="calendar"
            label="Booking link"
            value={setup.calendar}
            onChange={(v) => set("calendar", v)}
            placeholder="calendly.com/you/intro"
            hint="Calendly, Cal.com, HubSpot or any scheduling link."
          />
        )}
        {setup.goal === "website" && (
          <TextField
            id="landingPage"
            label="Page to send buyers to"
            value={setup.landingPage}
            onChange={(v) => set("landingPage", v)}
            placeholder={setup.website ? `${setup.website}/demo` : "yoursite.com/demo"}
            hint="A pricing, demo or case study page works best. We add tracking so you can see visits in your analytics."
          />
        )}
        {setup.goal === "inbox" && (
          <TextField
            id="email"
            type="email"
            label="Email to forward replies to"
            value={setup.email}
            onChange={(v) => set("email", v)}
            placeholder="you@company.com"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function GoalStep({ setup, set }: StepProps) {
  return (
    <>
      <GoalPicker value={setup.goal} onChange={(g) => set("goal", g)} />
      <GoalDetails setup={setup} set={set} />
    </>
  );
}

export function VolumePicker({ value, onChange }: { value: Setup["dailyVolume"]; onChange: (v: Setup["dailyVolume"]) => void }) {
  const idx = volumes.indexOf(value);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[12px]">
        <span className="text-muted-foreground">Daily sending volume</span>
        <span className="font-medium tabular-nums">{value.toLocaleString("en-US")}/day</span>
      </div>
      <Slider value={[idx]} min={0} max={volumes.length - 1} step={1} onValueChange={([v]) => onChange(volumes[v])} />
      <div className="mt-1.5 flex justify-between">
        {volumes.map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={cn(
              "w-6 text-center text-[10px] tabular-nums transition-colors cursor-pointer",
              v === value ? "text-yellow-200" : "text-muted-foreground hover:text-white"
            )}
          >
            {formatVolume(v)}
          </button>
        ))}
      </div>
    </div>
  );
}

function PlanStep({ setup, set }: StepProps) {
  return (
    <>
      <div className="glass-inset rounded-lg p-4">
        <VolumePicker value={setup.dailyVolume} onChange={(v) => set("dailyVolume", v)} />
      </div>
      <div className="flex flex-col items-center py-1 text-center">
        <div className="flex items-baseline gap-1">
          <AnimatedNumber value={pricing[setup.dailyVolume]} format={usd} className="text-3xl font-semibold tracking-tight tabular-nums" />
          <span className="text-[12px] text-muted-foreground">/mo</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Everything included · No setup fees · Cancel anytime</p>
      </div>
      <Field id="approval" label="Before launch">
        <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
          {(
            [
              { v: "approve", t: "I'll approve the copy", d: "We send sequences for your sign-off first." },
              { v: "operator", t: "Let my operator run it", d: "Fastest. We launch as soon as it's ready." },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              role="radio"
              aria-checked={setup.approval === o.v}
              onClick={() => set("approval", o.v)}
              className={cn(
                "glass-inset rounded-lg px-3 py-2.5 text-left transition-all cursor-pointer",
                setup.approval === o.v ? "border-yellow-300/40 bg-yellow-300/[0.06]" : "hover:border-white/15"
              )}
            >
              <span className="block text-[12px] font-medium">{o.t}</span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">{o.d}</span>
            </button>
          ))}
        </div>
      </Field>
    </>
  );
}

function ReviewStep({ setup, edit }: { setup: Setup; edit: (step: number) => void }) {
  const groups: { step: number; title: string; rows: [string, string][] }[] = [
    { step: 0, title: "Business", rows: [["Company", setup.company], ["Website", setup.website], ["Deal size", usd(setup.dealSize)]] },
    { step: 1, title: "Targeting", rows: [["Ideal customer", setup.icp]] },
    { step: 2, title: "Offer", rows: [["Problem", setup.problem], ["Offer", setup.cta]] },
    { step: 3, title: "Sender", rows: [["From", [setup.senderName, setup.senderTitle].filter(Boolean).join(", ")], ["Address", setup.address]] },
    { step: 4, title: "Goal", rows: [["Goal", goalLabel[setup.goal]], ["Send to", destination(setup)]] },
    {
      step: 5,
      title: "Plan",
      rows: [
        ["Volume", `${setup.dailyVolume.toLocaleString("en-US")}/day`],
        ["Price", `${usd(pricing[setup.dailyVolume])}/mo`],
        ["Copy", setup.approval === "approve" ? "You approve first" : "Operator launches"],
      ],
    },
  ];
  return (
    <div className="divide-y divide-white/[0.06]">
      {groups.map((g) => (
        <div key={g.title} className="py-3 first:pt-0 last:pb-0">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[12px] font-medium">{g.title}</span>
            <button
              onClick={() => edit(g.step)}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer"
            >
              <Pencil className="size-3" /> Edit
            </button>
          </div>
          <dl className="space-y-1">
            {g.rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 text-[12px]">
                <dt className="shrink-0 text-muted-foreground">{k}</dt>
                <dd className="min-w-0 text-right text-white/90">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

function Done({ setup }: { setup: Setup }) {
  const next = [
    "We build your lead list and register your sending domains.",
    "Inboxes warm up while we write your sequences.",
    setup.approval === "approve" ? "You approve the copy, then we launch." : "Your operator launches as soon as it's ready.",
  ];
  return (
    <div className="glass rounded-xl p-5">
      <p className="text-[12px] font-medium">What happens next</p>
      <ol className="mt-3 space-y-2.5">
        {next.map((n, i) => (
          <motion.li
            key={n}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.1, ease }}
            className="flex gap-2.5 text-[12px] text-white/85"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-[10px] tabular-nums">
              {i + 1}
            </span>
            {n}
          </motion.li>
        ))}
      </ol>
      <a
        href={site.dashboardUrl}
        className="group mt-5 flex h-9 items-center justify-center gap-1.5 rounded-md bg-white text-[12px] font-medium text-zinc-950 transition-all hover:bg-white/90 active:scale-[0.98]"
      >
        Open my dashboard <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Payment                                                             */
/* ------------------------------------------------------------------ */

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
// Set only in the static design preview, which has no server to create a checkout.
const isPreview = process.env.NEXT_PUBLIC_PREVIEW === "1";

function PaymentStep({ setup, onPaid }: { setup: Setup; onPaid: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-muted-foreground">
          Done-for-you outbound · <span className="tabular-nums text-white">{setup.dailyVolume.toLocaleString("en-US")}/day</span>
        </span>
        <span className="tabular-nums">
          <span className="font-medium text-white">{usd(pricing[setup.dailyVolume])}</span>
          <span className="text-muted-foreground">/mo</span>
        </span>
      </div>
      {stripePromise ? (
        // Remount when the plan changes so a fresh session is created for the new price.
        <Checkout key={setup.dailyVolume} setup={setup} onPaid={onPaid} />
      ) : (
        <div className="glass-inset rounded-lg px-4 py-5 text-center">
          <Lock className="mx-auto size-4 text-white/50" />
          <p className="mt-2 text-[12px] text-white/85">Payment isn&apos;t connected here yet.</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Add your Stripe keys to the site&apos;s environment and the secure checkout appears in this spot.
          </p>
          {isPreview && (
            <button
              onClick={onPaid}
              className="mt-4 h-8 rounded-md border border-white/10 bg-white/[0.04] px-3 text-[12px] text-yellow-100 transition-colors hover:border-yellow-300/25 hover:bg-white/[0.07] cursor-pointer"
            >
              Skip payment (preview only)
            </button>
          )}
        </div>
      )}
    </>
  );
}

function Checkout({ setup, onPaid }: { setup: Setup; onPaid: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const sessionId = useRef<string | null>(null);
  // Stripe doesn't allow its callbacks to change after mounting, so read the latest values through refs.
  const setupRef = useRef(setup);
  setupRef.current = setup;
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(setupRef.current),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.clientSecret) {
      const message = data.error ?? "Couldn't start checkout. Please refresh and try again.";
      setError(message);
      throw new Error(message);
    }
    sessionId.current = data.sessionId;
    return data.clientSecret as string;
  }, []);

  // Stripe calls this when payment succeeds; confirm with the server before moving on.
  const onComplete = useCallback(async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/checkout?session_id=${encodeURIComponent(sessionId.current ?? "")}`);
      const data = await res.json();
      if (data.status === "complete") onPaidRef.current();
      else setError("We couldn't confirm your payment yet. Refresh in a moment, or message us if you were charged.");
    } catch {
      setError("We couldn't confirm your payment yet. Refresh in a moment, or message us if you were charged.");
    } finally {
      setVerifying(false);
    }
  }, []);

  const options = useMemo(() => ({ fetchClientSecret, onComplete }), [fetchClientSecret, onComplete]);

  return (
    <div className="space-y-3">
      {error && <p className="rounded-md bg-red-400/10 px-3 py-2 text-[12px] text-red-200">{error}</p>}
      <div className="relative min-h-[420px] overflow-hidden rounded-lg">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
        {verifying && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-zinc-950/70 text-[12px] backdrop-blur-sm">
            <Loader2 className="size-3.5 animate-spin" /> Confirming payment…
          </div>
        )}
      </div>
    </div>
  );
}
