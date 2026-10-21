import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Mail, FileText, ListChecks, Sparkles, ShieldAlert, LogOut, Copy, Loader2 } from "lucide-react";
import logo from "@/assets/capaciti-logo.webp";
import { runAi } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Capaciti Success Hub — AI Training Dashboard" },
      { name: "description", content: "AI tools for Capaciti students: email generator, meeting notes summarizer and task planner." },
      { property: "og:title", content: "Capaciti Success Hub" },
      { property: "og:description", content: "Your AI-powered companion for the 1-Week AI Training Program." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Tool = "email" | "notes" | "tasks";

const TOOLS: { id: Tool; label: string; icon: typeof Mail; desc: string; placeholder: string; cta: string }[] = [
  { id: "email", label: "Smart Email Generator", icon: Mail, desc: "Draft polished, professional emails in seconds.", placeholder: "e.g. Email my facilitator asking for an extension on Day 3's prompt engineering assignment due to load shedding.", cta: "Generate email" },
  { id: "notes", label: "Meeting Notes Summarizer", icon: FileText, desc: "Extract key points and action items from your notes.", placeholder: "Paste your raw meeting or session notes here…", cta: "Summarize notes" },
  { id: "tasks", label: "AI Task Planner", icon: ListChecks, desc: "Organize daily study tasks and deadlines.", placeholder: "e.g. Day 2 of 5. Need to finish ML basics module, build a chatbot demo by Friday, study 3 hours a day.", cta: "Build my plan" },
];

const WEEK = ["AI Foundations", "Prompt Engineering", "Generative AI Tools", "Responsible AI", "Capstone Demo"];

function Index() {
  const [active, setActive] = useState<Tool>("email");
  const [inputs, setInputs] = useState<Record<Tool, string>>({ email: "", notes: "", tasks: "" });
  const [outputs, setOutputs] = useState<Record<Tool, string>>({ email: "", notes: "", tasks: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  const tool = TOOLS.find((t) => t.id === active)!;

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const r = await runAi({ data: { tool: active, input: inputs[active] } });
      if (r.error) setError(r.error);
      else setOutputs((o) => ({ ...o, [active]: r.text }));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <img src={logo} alt="CAPACITI" className="h-8 w-auto" />
          <div className="border-l pl-3">
            <h1 className="font-display text-lg font-bold leading-tight text-foreground">Capaciti Success Hub</h1>
            <p className="text-xs text-muted-foreground">1-Week AI Training Program</p>
          </div>
          <button onClick={signOut} className="ml-auto inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-8 rounded-2xl bg-hero p-6 text-primary-foreground shadow-soft md:p-8">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Welcome back, learner 👋</h2>
          <p className="mt-2 max-w-xl opacity-90">Three AI assistants to help you communicate, capture and plan your way through the week.</p>
          <div className="mt-6 grid grid-cols-5 gap-2">
            {WEEK.map((w, i) => (
              <div key={w} className="rounded-lg bg-primary-foreground/10 p-2 text-center">
                <div className="text-xs opacity-75">Day {i + 1}</div>
                <div className="hidden text-xs font-medium sm:block">{w}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActive(t.id); setError(null); }}
                className={`flex min-w-[200px] items-start gap-3 rounded-xl border p-4 text-left transition-colors lg:min-w-0 ${active === t.id ? "border-primary bg-accent" : "bg-card hover:bg-muted"}`}
              >
                <t.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.desc}</div>
                </div>
              </button>
            ))}
          </nav>

          <section className="rounded-2xl border bg-card p-5 shadow-soft md:p-6">
            <h3 className="font-display text-xl font-semibold text-foreground">{tool.label}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{tool.desc}</p>
            <textarea
              value={inputs[active]}
              onChange={(e) => setInputs((s) => ({ ...s, [active]: e.target.value }))}
              placeholder={tool.placeholder}
              rows={active === "notes" ? 9 : 5}
              className="w-full rounded-lg border bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={submit}
              disabled={loading || inputs[active].trim().length < 3}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Working…" : tool.cta}
            </button>
            {error && <p className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            {outputs[active] && (
              <div className="mt-6 rounded-xl border bg-muted p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI result</span>
                  <button onClick={() => navigator.clipboard.writeText(outputs[active])} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{outputs[active]}</pre>
              </div>
            )}
          </section>
        </div>

        <aside className="mt-8 flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-foreground">
          <ShieldAlert className="h-5 w-5 shrink-0 text-warning" />
          <p>
            <strong>Responsible AI disclaimer:</strong> Content is generated by AI and may be inaccurate or incomplete. Always review, fact-check and edit before sending or relying on it. Do not enter personal, confidential or sensitive information. Use these tools to support — not replace — your own learning, judgement and academic integrity.
          </p>
        </aside>
      </main>
    </div>
  );
}
