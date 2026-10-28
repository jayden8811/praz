"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowUpRight, Check, Clock, Globe, Loader2, Video } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { FormError, isEmail } from "@/components/auth/auth-forms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookingPreview, cal, createBooking, fetchSlots, nextDays, viewerTimeZone, type SlotsByDay } from "@/lib/booking";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const DAYS = 7;

const fmt = (iso: string, timeZone: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone, ...opts }).format(new Date(iso));

export function BookingFlow() {
  const [timeZone, setTimeZone] = useState("UTC");
  const [slots, setSlots] = useState<SlotsByDay | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [booked, setBooked] = useState<{ start: string; meetingUrl?: string } | null>(null);

  const days = useMemo(() => nextDays(DAYS, timeZone), [timeZone]);

  const load = async (tz: string) => {
    setLoadError(null);
    setSlots(null);
    try {
      const range = nextDays(DAYS, tz);
      const result = await fetchSlots(range[0].key, range[DAYS - 1].key, tz);
      setSlots(result);
      // Open on the first day that has times.
      setDay((d) => d ?? range.find((r) => (result[r.key] ?? []).length > 0)?.key ?? null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Couldn't load times.");
    }
  };

  useEffect(() => {
    const tz = viewerTimeZone();
    setTimeZone(tz);
    load(tz);
  }, []);

  const times = day && slots ? (slots[day] ?? []) : [];

  return (
    <div className="relative flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-4 py-3 md:px-5">
        <a href={site.homeUrl} className="text-[13px] font-medium text-white/90 hover:text-white">
          Praz
        </a>
      </header>

      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col px-4 pb-16 pt-10 md:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease }}
          className="flex flex-col items-center text-center"
        >
          <LogoMark className="size-12 text-white" />
          <h1 className="mt-5 text-[22px] font-medium tracking-[-0.02em]">{booked ? "You're booked." : "Book a call"}</h1>
          <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3" /> {cal.minutes} minutes
            </span>
            <span className="flex items-center gap-1">
              <Video className="size-3" /> Video call
            </span>
            <span className="flex items-center gap-1">
              <Globe className="size-3" /> {timeZone.replace(/_/g, " ")}
            </span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="glass mt-7 rounded-xl p-5"
        >
          {booked ? (
            <Confirmed booked={booked} timeZone={timeZone} />
          ) : time ? (
            <Details
              start={time}
              timeZone={timeZone}
              onBack={() => setTime(null)}
              onBooked={setBooked}
              onTaken={() => {
                setTime(null);
                load(timeZone);
              }}
            />
          ) : (
            <>
              <p className="text-[12px] font-medium">Pick a day</p>
              <div className="mt-3 grid grid-cols-7 gap-1 sm:gap-1.5">
                {days.map((d) => {
                  const count = slots ? (slots[d.key] ?? []).length : null;
                  const active = d.key === day;
                  const disabled = count === 0;
                  return (
                    <button
                      key={d.key}
                      disabled={disabled || count === null}
                      onClick={() => setDay(d.key)}
                      aria-pressed={active}
                      className={cn(
                        "glass-inset relative flex flex-col items-center rounded-lg px-0.5 py-2.5 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed",
                        active && "border-yellow-300/40 bg-yellow-300/[0.08]",
                        !active && !disabled && count !== null && "hover:border-white/15 hover:bg-white/[0.05]",
                        disabled && "opacity-35"
                      )}
                    >
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {fmt(d.date.toISOString(), timeZone, { weekday: "short" })}
                      </span>
                      <span className="mt-0.5 text-[17px] font-medium tabular-nums sm:text-[19px]">
                        {fmt(d.date.toISOString(), timeZone, { day: "numeric" })}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{fmt(d.date.toISOString(), timeZone, { month: "short" })}</span>
                      <span className={cn("mt-1.5 h-1 w-1 rounded-full", count ? "bg-yellow-300/80" : "bg-transparent")} />
                      {count === null && <span className="shimmer absolute inset-0 rounded-lg" />}
                    </button>
                  );
                })}
              </div>

              {loadError && (
                <div className="mt-4 space-y-2">
                  <FormError error={loadError} />
                  <button onClick={() => load(timeZone)} className="text-[12px] text-white/80 underline-offset-4 hover:text-white hover:underline cursor-pointer">
                    Try again
                  </button>
                </div>
              )}

              <AnimatePresence mode="wait">
                {day && slots && (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3, ease }}
                    className="mt-6"
                  >
                    <p className="text-[12px] font-medium">
                      {fmt(`${day}T12:00:00Z`, "UTC", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                    {times.length === 0 ? (
                      <p className="mt-3 text-[12px] text-muted-foreground">No open times this day. Try another.</p>
                    ) : (
                      <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                        {times.map((t, i) => (
                          <motion.button
                            key={t}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02, duration: 0.25 }}
                            onClick={() => setTime(t)}
                            className="glass-inset h-9 rounded-md text-[12px] tabular-nums transition-colors hover:border-yellow-300/30 hover:bg-yellow-300/[0.06] cursor-pointer"
                          >
                            {fmt(t, timeZone, { hour: "numeric", minute: "2-digit" })}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>

        {!booked && (
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            {bookingPreview ? "Preview: these are sample times. The live site shows your real Cal.com availability. " : "Trouble booking? "}
            <a href={cal.publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-white/70 hover:text-white">
              Open in Cal.com <ArrowUpRight className="size-3" />
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

function Details({
  start,
  timeZone,
  onBack,
  onBooked,
  onTaken,
}: {
  start: string;
  timeZone: string;
  onBack: () => void;
  onBooked: (b: { start: string; meetingUrl?: string }) => void;
  onTaken: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const when = `${fmt(start, timeZone, { weekday: "short", month: "short", day: "numeric" })} at ${fmt(start, timeZone, { hour: "numeric", minute: "2-digit" })}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await createBooking({ start, name: name.trim(), email: email.trim(), website, notes, timeZone });
    setBusy(false);
    if (res.ok) onBooked({ start: res.start, meetingUrl: res.meetingUrl });
    else if (/taken/i.test(res.error)) {
      setError(res.error);
      setTimeout(onTaken, 1500);
    } else setError(res.error);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-[12px] text-white/70 transition-colors hover:text-white cursor-pointer">
          <ArrowLeft className="size-3.5" /> Change time
        </button>
        <span className="rounded-md bg-yellow-300/15 px-2 py-0.5 text-[12px] tabular-nums text-yellow-100">{when}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="book-name">Name</Label>
          <Input id="book-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="book-email">Work email</Label>
          <Input id="book-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 text-[13px]" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="book-website">
          Company website <span className="text-muted-foreground/60">· optional</span>
        </Label>
        <Input id="book-website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="yourcompany.com" className="h-9 text-[13px]" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="book-notes">
          What should we cover? <span className="text-muted-foreground/60">· optional</span>
        </Label>
        <Textarea id="book-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Your average deal size, who you sell to, what you've tried." />
      </div>
      <FormError error={error} />
      <button
        type="submit"
        disabled={busy || !name.trim() || !isEmail(email)}
        className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-white text-[12px] font-medium text-zinc-950 transition-all hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40 cursor-pointer"
      >
        {busy ? <Loader2 className="size-3.5 animate-spin" /> : `Confirm ${when}`}
      </button>
    </form>
  );
}

function Confirmed({ booked, timeZone }: { booked: { start: string; meetingUrl?: string }; timeZone: string }) {
  return (
    <div className="flex flex-col items-center py-2 text-center">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex size-10 items-center justify-center rounded-full bg-yellow-300/15 text-yellow-100"
      >
        <Check className="size-5" />
      </motion.span>
      <p className="mt-4 text-[14px] font-medium">
        {fmt(booked.start, timeZone, { weekday: "long", month: "long", day: "numeric" })}
      </p>
      <p className="mt-0.5 text-[13px] tabular-nums text-white/80">
        {fmt(booked.start, timeZone, { hour: "numeric", minute: "2-digit" })} · {cal.minutes} minutes
      </p>
      <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-muted-foreground">
        {bookingPreview ? "Preview only: no booking was made." : "A calendar invite with the video link is on its way to your inbox."}
      </p>
      {booked.meetingUrl && /^https?:\/\//.test(booked.meetingUrl) && (
        <a href={booked.meetingUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[12px] text-white/80 hover:text-white">
          Join link <ArrowUpRight className="size-3" />
        </a>
      )}
      <a
        href={site.homeUrl}
        className="mt-5 inline-flex h-8 items-center rounded-md border border-white/10 bg-white/[0.04] px-3 text-[12px] text-white/80 transition-colors hover:bg-white/[0.07] hover:text-white"
      >
        Back to home
      </a>
    </div>
  );
}
