import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock, Flame, Gauge, Sparkles } from "lucide-react";
import { NAV } from "@/components/AppShell";
import { WorkspaceHeader, Panel } from "@/components/workspace";
import { DISCLAIMER } from "@/lib/ai-sim";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ember — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Ember is an AI workplace productivity assistant: draft emails, summarise meetings, plan tasks, and research decisions in one calm workspace.",
      },
      { property: "og:title", content: "Ember — AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Five AI workspaces for focused work: email drafting, meeting summaries, task planning, research briefs and chat.",
      },
    ],
  }),
  component: Overview,
});

const stats = [
  { label: "Focus hours protected", value: "5.5", unit: "today", icon: Gauge },
  { label: "Drafts composed", value: "12", unit: "this week", icon: Sparkles },
  { label: "Minutes saved", value: "184", unit: "est.", icon: Clock },
];

const agenda = [
  { time: "09:00", title: "Deep work — Q3 pricing memo", tag: "P1" },
  { time: "11:00", title: "Design review with the platform team", tag: "Meeting" },
  { time: "13:30", title: "Draft client update, then batch replies", tag: "P2" },
  { time: "16:00", title: "Shallow work window — inbox + approvals", tag: "P3" },
];

function Overview() {
  const workspaces = NAV.filter((n) => n.to !== "/");

  return (
    <div className="mx-auto max-w-6xl">
      <WorkspaceHeader
        kicker="Wednesday · Overview"
        title="Good day. Here's the shortest path through it."
        description="Ember turns messy input into professional, structured output — emails, minutes, plans and research briefs — with the prompt template kept visible so you always know how the answer was shaped."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card rounded-xl px-5 py-5">
              <Icon className="size-4 text-ember" strokeWidth={1.75} />
              <p className="mt-4 font-display text-3xl leading-none">{s.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {s.label} <span className="text-muted-foreground/60">· {s.unit}</span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Workspaces">
          <div className="grid gap-3 sm:grid-cols-2">
            {workspaces.map((w) => {
              const Icon = w.icon;
              return (
                <Link
                  key={w.to}
                  to={w.to}
                  className="group rounded-lg border border-border bg-surface-raised/40 px-4 py-4 transition-colors hover:border-ember/45"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Icon className="size-4 text-ember" strokeWidth={1.75} />
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:text-ember" />
                  </div>
                  <p className="mt-3 font-display text-base">{w.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{w.hint}</p>
                </Link>
              );
            })}
          </div>
        </Panel>

        <Panel title="Suggested shape of the day">
          <ol className="space-y-3">
            {agenda.map((a) => (
              <li key={a.time} className="flex items-start gap-3">
                <span className="mt-0.5 font-mono text-xs text-ember">{a.time}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm leading-snug">{a.title}</span>
                  <span className="mt-1 inline-block rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {a.tag}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            <Flame className="mt-0.5 size-3.5 shrink-0 text-ember" />
            <span>
              Prototype mode: every result is generated locally from your input, no credentials
              needed. {DISCLAIMER}.
            </span>
          </p>
        </Panel>
      </div>
    </div>
  );
}
