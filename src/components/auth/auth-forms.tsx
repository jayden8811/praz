"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authConfigured, currentEmail, onPasswordRecovery, resendConfirmation, sendPasswordReset, signIn, updatePassword } from "@/lib/auth";
import { page, site } from "@/lib/site";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
export const isEmail = (v: string) => /\S+@\S+\.\S+/.test(v);
export const MIN_PASSWORD = 8;

function Shell({ title, sub, children, footer }: { title: string; sub: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-4 py-3 md:px-5">
        <a href={site.homeUrl} className="text-[13px] font-medium text-white/90 hover:text-white">
          Praz
        </a>
      </header>
      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col px-4 pb-16 pt-12 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease }}
          className="flex flex-col items-center text-center"
        >
          <LogoMark className="size-12 text-white" />
          <h1 className="mt-5 text-[22px] font-medium tracking-[-0.02em]">{title}</h1>
          <p className="mt-1.5 text-[12px] text-muted-foreground">{sub}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="glass mt-7 rounded-xl p-5"
        >
          {children}
        </motion.div>
        {footer && <p className="mt-4 text-center text-[12px] text-muted-foreground">{footer}</p>}
        {!authConfigured && (
          <p className="mt-6 text-center text-[11px] text-muted-foreground/70">
            Preview: accounts are kept in this browser only until sign-in is connected.
          </p>
        )}
      </div>
    </div>
  );
}

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="h-9 pr-9 text-[13px]"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
      >
        {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </button>
    </div>
  );
}

function Submit({ busy, disabled, children }: { busy: boolean; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className="group flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-white text-[12px] font-medium text-zinc-950 transition-all hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40 cursor-pointer"
    >
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : children}
    </button>
  );
}

export function FormError({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="rounded-md bg-red-400/10 px-3 py-2 text-[12px] text-red-200">{error}</p>;
}

const linkClass = "text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState<"idle" | "sending" | "sent">("idle");
  const unconfirmed = !!error && /confirm your email/i.test(error);

  const resend = async () => {
    setResent("sending");
    const res = await resendConfirmation(email.trim());
    if (res.ok) setResent("sent");
    else {
      setError(res.error);
      setResent("idle");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResent("idle");
    const res = await signIn(email.trim(), password);
    if (res.ok) window.location.href = site.dashboardUrl;
    else {
      setError(res.error);
      setBusy(false);
    }
  };

  return (
    <Shell
      title="Log in"
      sub="Welcome back. See your replies, calls and campaign."
      footer={
        <>
          New to Praz?{" "}
          <a href={site.onboardingUrl} className={linkClass}>
            Get started
          </a>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <a href={page("/forgot-password")} className="text-[11px] text-muted-foreground transition-colors hover:text-white">
              Forgot password?
            </a>
          </div>
          <PasswordInput id="login-password" value={password} onChange={setPassword} autoComplete="current-password" />
        </div>
        <FormError error={error} />
        {unconfirmed && (
          <p className="text-[12px] text-muted-foreground">
            {resent === "sent" ? (
              <>Sent. Check your inbox and spam folder for an email from Praz.</>
            ) : (
              <>
                Didn&apos;t get it?{" "}
                <button type="button" onClick={resend} disabled={resent === "sending"} className="text-white underline underline-offset-4 hover:text-yellow-100 cursor-pointer">
                  {resent === "sending" ? "Sending…" : "Resend confirmation email"}
                </button>
              </>
            )}
          </p>
        )}
        <Submit busy={busy} disabled={!isEmail(email) || !password}>
          Log in <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Submit>
      </form>
    </Shell>
  );
}

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await sendPasswordReset(email.trim());
    setBusy(false);
    if (res.ok) setSent(true);
    else setError(res.error);
  };

  return (
    <Shell
      title="Reset your password"
      sub="We'll email you a link to set a new one."
      footer={
        <a href={site.loginUrl} className={linkClass}>
          Back to log in
        </a>
      }
    >
      {sent ? (
        <div className="text-center">
          <MailCheck className="mx-auto size-5 text-yellow-200" />
          <p className="mt-3 text-[13px] text-white/90">Check your inbox</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            If there&apos;s an account for <span className="text-white">{email}</span>, a reset link is on its way. It can take a minute to arrive.
          </p>
          {!authConfigured && (
            <a
              href={`${page("/reset-password")}?email=${encodeURIComponent(email.trim())}`}
              className="mt-4 inline-flex h-8 items-center rounded-md border border-white/10 bg-white/[0.04] px-3 text-[12px] text-yellow-100 transition-colors hover:border-yellow-300/25 hover:bg-white/[0.07]"
            >
              Open the reset link (preview only)
            </a>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email">Email</Label>
            <Input id="forgot-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 text-[13px]" />
          </div>
          <FormError error={error} />
          <Submit busy={busy} disabled={!isEmail(email)}>
            Send reset link
          </Submit>
        </form>
      )}
    </Shell>
  );
}

export function ResetForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Supabase signs the user in from the link in their email; wait for that before allowing a change.
  const [ready, setReady] = useState<"checking" | "ready" | "expired">(authConfigured ? "checking" : "ready");
  const [previewEmail, setPreviewEmail] = useState<string | undefined>();

  useEffect(() => {
    if (!authConfigured) {
      setPreviewEmail(new URLSearchParams(window.location.search).get("email") ?? undefined);
      return;
    }
    const stop = onPasswordRecovery(() => setReady("ready"));
    const t = setTimeout(async () => {
      setReady((r) => (r === "ready" ? r : "checking"));
      const email = await currentEmail();
      setReady((r) => (r === "ready" ? r : email ? "ready" : "expired"));
    }, 1200);
    return () => {
      stop();
      clearTimeout(t);
    };
  }, []);

  const mismatch = confirm.length > 0 && confirm !== password;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await updatePassword(password, previewEmail);
    if (res.ok) window.location.href = site.dashboardUrl;
    else {
      setError(res.error);
      setBusy(false);
    }
  };

  return (
    <Shell title="Set a new password" sub="Choose something you haven't used here before.">
      {ready === "checking" && (
        <p className="flex items-center justify-center gap-2 text-[12px] text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Checking your link…
        </p>
      )}
      {ready === "expired" && (
        <div className="text-center">
          <p className="text-[13px] text-white/90">This link has expired</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Reset links work once and expire after an hour.</p>
          <a href={page("/forgot-password")} className={cn(linkClass, "mt-3 inline-block text-[12px]")}>
            Send a new link
          </a>
        </div>
      )}
      {ready === "ready" && (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <PasswordInput id="new-password" value={password} onChange={setPassword} autoComplete="new-password" placeholder={`At least ${MIN_PASSWORD} characters`} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <PasswordInput id="confirm-password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
            {mismatch && <p className="text-[11px] text-red-300">Passwords don&apos;t match.</p>}
          </div>
          <FormError error={error} />
          <Submit busy={busy} disabled={password.length < MIN_PASSWORD || confirm !== password}>
            Save new password
          </Submit>
        </form>
      )}
    </Shell>
  );
}
