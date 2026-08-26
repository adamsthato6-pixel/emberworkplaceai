import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Mail,
  NotebookPen,
  ListChecks,
  Telescope,
  MessagesSquare,
  LayoutGrid,
  Menu,
  X,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DISCLAIMER } from "@/lib/ai-sim";

export const NAV = [
  { to: "/", label: "Overview", icon: LayoutGrid, hint: "Your day at a glance" },
  { to: "/email", label: "Email Generator", icon: Mail, hint: "Tone + audience control" },
  { to: "/notes", label: "Notes Summarizer", icon: NotebookPen, hint: "Points, actions, dates" },
  { to: "/planner", label: "Task Planner", icon: ListChecks, hint: "Impact ÷ effort triage" },
  { to: "/research", label: "Research Assistant", icon: Telescope, hint: "Insights + evidence" },
  { to: "/chat", label: "Ember Chat", icon: MessagesSquare, hint: "Ask anything, briefly" },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = path === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-ember transition-opacity",
                active ? "opacity-100" : "opacity-0",
              )}
            />
            <Icon className={cn("size-4 shrink-0", active && "text-ember")} strokeWidth={1.75} />
            <span className="flex flex-col leading-tight">
              <span className="font-medium">{item.label}</span>
              <span className="text-[11px] text-muted-foreground/70">{item.hint}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-md bg-ember/15 ring-1 ring-ember/30">
        <Flame className="size-4 text-ember" strokeWidth={2} />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-base font-semibold tracking-tight">Ember</span>
        <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Workplace AI
        </span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="ember-grain min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1500px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-5 py-6 lg:flex">
          <Brand />
          <div className="ember-rule mt-6 w-16" />
          <div className="mt-6 flex-1 overflow-y-auto">
            <p className="mb-3 px-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/70">
              Workspaces
            </p>
            <NavList />
          </div>
          <p className="mt-6 border-t border-sidebar-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
            Prototype mode — outputs are simulated locally.
            <span className="mt-1 block text-ember-soft/80">{DISCLAIMER}</span>
          </p>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
            <Brand />
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="rounded-md border border-border p-2 text-foreground"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </header>

          {open && (
            <div className="border-b border-border bg-sidebar px-4 py-4 lg:hidden">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          )}

          <main className="px-4 pb-16 pt-6 sm:px-8 lg:pt-10">{children}</main>

          <footer className="border-t border-border px-4 py-6 text-xs text-muted-foreground sm:px-8">
            {DISCLAIMER}
          </footer>
        </div>
      </div>
    </div>
  );
}
