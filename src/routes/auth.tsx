import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/capaciti-logo.webp";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Log in — Capaciti Success Hub" },
      { name: "description", content: "Log in to the Capaciti Success Hub." },
      { property: "og:title", content: "Log in — Capaciti Success Hub" },
      { property: "og:description", content: "Log in to the Capaciti Success Hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter both your email and password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setError(
        error.message.toLowerCase().includes("invalid")
          ? "That email or password doesn't look right. Please try again."
          : "We couldn't log you in right now. Please try again.",
      );
      return;
    }
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-soft">
        <img src={logo} alt="CAPACITI" className="mx-auto h-8 w-auto" />
        <h1 className="mt-6 text-center font-display text-xl font-semibold text-foreground">Capaciti Success Hub</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">Log in to continue</p>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border bg-background p-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">Password</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border bg-background p-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
          </div>
          {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
