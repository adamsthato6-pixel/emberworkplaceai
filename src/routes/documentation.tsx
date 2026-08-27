import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceHeader, Panel } from "@/components/workspace";
import {
  chatSystemPrompt,
  emailPrompt,
  notesPrompt,
  plannerPrompt,
  researchPrompt,
} from "@/lib/ai-sim";

export const Route = createFileRoute("/documentation")({
  head: () => ({
    meta: [
      { title: "Solution Documentation — Ember Workplace Assistant" },
      {
        name: "description",
        content:
          "Problem statement, solution overview, tools used, sample prompts and the challenges solved while building the Ember workplace productivity assistant.",
      },
      { property: "og:title", content: "Solution Documentation — Ember" },
      {
        property: "og:description",
        content: "The one-page write-up behind Ember: problem, solution, tools, prompts, trade-offs.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocumentationPage,
});

const TOOLS = [
  { k: "Interface", v: "React 19 + TanStack Start, Tailwind CSS v4, shadcn/ui primitives" },
  { k: "Build", v: "Vite 7, TypeScript, built and previewed on Lovable" },
  { k: "AI layer", v: "Local deterministic simulation engine — no API credentials required" },
  { k: "Prompt design", v: "Structured templates (system / task / constraints / output contract)" },
  { k: "Icons + type", v: "Lucide icons, Fraunces display and Inter text faces" },
];

const CHALLENGES = [
  {
    k: "Demonstrating AI without credentials",
    v: "Built a deterministic simulation engine with artificial latency so loading states, editable inputs and output structure behave exactly as they would against a live model.",
  },
  {
    k: "Making prompt quality visible",
    v: "Every workspace renders the prompt template it used, so a reviewer can assess the instruction and not only the answer.",
  },
  {
    k: "Vague summaries",
    v: "Output contracts force separation of decisions from discussion, and every action item carries an owner and a date.",
  },
  {
    k: "Over-trusting output",
    v: "The review disclaimer travels with copied output, and a dedicated Responsible AI page states limitations, bias and validation steps.",
  },
];

const SAMPLES = [
  {
    label: "Smart Email Generator",
    prompt: emailPrompt({
      intent: "Ask the client to approve the revised scope before Friday",
      tone: "Persuasive",
      audience: "Client",
      length: "Standard",
      senderName: "Thato Molefe",
      includeCta: true,
    }),
  },
  {
    label: "Meeting Notes Summarizer",
    prompt: notesPrompt({
      transcript: "",
      meetingName: "Northwind pilot review",
      attendees: "Ruth, Adam, Priya",
    }),
  },
  {
    label: "AI Task Planner",
    prompt: plannerPrompt({
      braindump: "",
      horizon: "This week",
      capacityHours: 6,
      energyPeak: "Morning",
    }),
  },
  {
    label: "AI Research Assistant",
    prompt: researchPrompt({
      question: "Should we build our own document parser or license one?",
      depth: "Standard",
      lens: "Technical",
      source: "",
    }),
  },
  { label: "Ember Chat", prompt: chatSystemPrompt },
];

function DocumentationPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <WorkspaceHeader
        kicker="Documentation"
        title="Solution write-up"
        description="The short version of what this is, why it exists, how it was built, and the prompt strategy behind each workspace."
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Panel title="Problem statement">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Professionals lose hours every week to the same four chores: drafting emails, turning
            meeting sprawl into something actionable, deciding what to do next, and getting up to
            speed on a topic. The work is repetitive, but it is not mindless — a bad summary or a
            plan with no owner costs more than the time it saved.
          </p>
        </Panel>

        <Panel title="Solution overview">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Ember is a single workplace assistant with five focused workspaces — Email Generator,
            Notes Summarizer, Task Planner, Research Assistant and Chat. Each one takes editable
            input and structured controls, runs a purpose-built prompt template, and returns a
            document with a fixed shape you can copy straight into your tools. Productivity gain
            comes from the shape of the output, not just its speed: dated asks, named owners,
            explicit deferrals and a stated counter-view.
          </p>
        </Panel>

        <Panel title="Tools used">
          <dl className="divide-y divide-border/70 text-sm">
            {TOOLS.map((t) => (
              <div key={t.k} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
                <dt className="font-medium sm:w-32 sm:shrink-0">{t.k}</dt>
                <dd className="text-muted-foreground">{t.v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="Challenges and solutions">
          <dl className="divide-y divide-border/70 text-sm">
            {CHALLENGES.map((c) => (
              <div key={c.k} className="py-3">
                <dt className="font-medium">{c.k}</dt>
                <dd className="mt-1 text-muted-foreground">{c.v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Sample prompts">
          <div className="space-y-4">
            {SAMPLES.map((s) => (
              <div key={s.label}>
                <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80">
                  {s.label}
                </p>
                <pre className="overflow-x-auto rounded-md border border-border bg-background/60 p-4 text-[12px] leading-relaxed text-muted-foreground">
                  {s.prompt}
                </pre>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
