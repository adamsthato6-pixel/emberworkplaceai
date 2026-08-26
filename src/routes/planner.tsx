import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  WorkspaceHeader,
  Panel,
  Field,
  ChipGroup,
  PresetRow,
  GenerateButton,
  OutputSkeleton,
  EmptyOutput,
  DocView,
} from "@/components/workspace";
import {
  planTasks,
  withLatency,
  type GeneratedDoc,
  type PlannedTask,
  type PlannerInput,
} from "@/lib/ai-sim";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Ember" },
      {
        name: "description",
        content:
          "Turn a brain dump into a prioritised schedule using impact ÷ effort triage, capacity limits and peak-energy scheduling.",
      },
      { property: "og:title", content: "AI Task Planner — Ember" },
      {
        property: "og:description",
        content: "Ranked tasks, time blocks and an explicit deferred list that fits your capacity.",
      },
    ],
  }),
  component: PlannerPage,
});

const HORIZONS = ["Today", "This week", "This sprint"] as const;
const ENERGY = ["Morning", "Afternoon"] as const;

const PRESETS = [
  {
    key: "Busy Wednesday",
    value: `Finish the Q3 pricing memo - deadline today
Reply to the client about the revised scope
Design the onboarding email sequence
Fix the failing migration script (blocker)
Book the venue for the offsite
Review two pull requests`,
  },
  {
    key: "Launch week",
    value: `Write launch announcement
Ship the pricing page copy - urgent
Migrate legacy accounts
Prepare support macros
Schedule the retro`,
  },
];

const priorityStyle: Record<PlannedTask["priority"], string> = {
  P1: "border-ember/50 text-ember-soft bg-ember/10",
  P2: "border-sage/40 text-sage bg-sage/10",
  P3: "border-border text-muted-foreground",
};

function Schedule({ tasks }: { tasks: PlannedTask[] }) {
  if (!tasks.length) return null;
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-[auto_1fr_auto] gap-3 border-b border-border bg-surface-raised/60 px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>Slot</span>
        <span>Task</span>
        <span>Impact ÷ effort</span>
      </div>
      {tasks.map((t) => (
        <div
          key={t.title}
          className="grid grid-cols-[auto_1fr_auto] items-start gap-3 border-b border-border px-4 py-3 last:border-0"
        >
          <span className="font-mono text-xs text-ember">
            {t.slot}
            <span className="block text-[10px] text-muted-foreground">{t.minutes}m</span>
          </span>
          <span className="min-w-0">
            <span className="block text-sm leading-snug">{t.title}</span>
            <span
              className={cn(
                "mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[10px] tracking-[0.1em]",
                priorityStyle[t.priority],
              )}
            >
              {t.priority}
            </span>
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {t.impact}÷{t.effort} = {t.score}
          </span>
        </div>
      ))}
    </div>
  );
}

function PlannerPage() {
  const [input, setInput] = useState<PlannerInput>({
    braindump: "",
    horizon: "Today",
    capacityHours: 6,
    energyPeak: "Morning",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ doc: GeneratedDoc; tasks: PlannedTask[] } | null>(null);

  const set = <K extends keyof PlannerInput>(k: K, v: PlannerInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const run = async () => {
    setLoading(true);
    const r = await withLatency(() => planTasks(input), 1500);
    setResult(r);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <WorkspaceHeader
        kicker="Workspace 03"
        title="AI Task Planner"
        description="Dump everything on your mind, one task per line. Ember ranks by impact divided by effort, puts the heaviest thinking in your peak window, caps blocks at ninety minutes, and defers out loud whatever will not fit."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <Panel title="Brain dump">
          <div className="space-y-5">
            <Field label="Tasks" hint="one per line, editable">
              <Textarea
                value={input.braindump}
                onChange={(e) => set("braindump", e.target.value)}
                rows={10}
                placeholder={"Finish the pricing memo - deadline today\nReply to the client\n…"}
                className="resize-y bg-background/60 font-mono text-xs leading-relaxed"
              />
            </Field>

            <PresetRow
              presets={PRESETS.map((p) => ({ label: p.key }))}
              onPick={(label) => {
                const p = PRESETS.find((x) => x.key === label);
                if (p) set("braindump", p.value);
              }}
            />

            <Field label="Horizon">
              <ChipGroup
                options={HORIZONS}
                value={input.horizon}
                onChange={(v) => set("horizon", v as PlannerInput["horizon"])}
              />
            </Field>

            <Field label="Energy peak">
              <ChipGroup
                options={ENERGY}
                value={input.energyPeak}
                onChange={(v) => set("energyPeak", v as PlannerInput["energyPeak"])}
              />
            </Field>

            <Field label="Focus capacity" hint={`${input.capacityHours}h`}>
              <Slider
                value={[input.capacityHours]}
                min={1}
                max={10}
                step={0.5}
                onValueChange={([v]) => set("capacityHours", v ?? input.capacityHours)}
                className="mt-3"
              />
            </Field>

            <GenerateButton
              loading={loading}
              disabled={!input.braindump.trim()}
              onClick={run}
              label="Build my plan"
            />
          </div>
        </Panel>

        <Panel title="Prioritised schedule">
          {loading ? (
            <OutputSkeleton />
          ) : result ? (
            <DocView doc={result.doc} extra={<Schedule tasks={result.tasks} />} />
          ) : (
            <EmptyOutput>
              List your tasks or load a preset. You'll get a ranked schedule with time blocks, a
              deferred list and one focus recommendation.
            </EmptyOutput>
          )}
        </Panel>
      </div>
    </div>
  );
}
