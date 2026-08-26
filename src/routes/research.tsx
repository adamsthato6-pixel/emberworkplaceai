import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
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
import { research, withLatency, type GeneratedDoc, type ResearchInput } from "@/lib/ai-sim";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Ember" },
      {
        name: "description",
        content:
          "Ask a decision question and get a thesis, key insights, the evidence still needed, a counter-view and next actions.",
      },
      { property: "og:title", content: "AI Research Assistant — Ember" },
      {
        property: "og:description",
        content: "Research briefs that separate evidence from inference, with a built-in counter-view.",
      },
    ],
  }),
  component: ResearchPage,
});

const DEPTHS = ["Brief", "Standard", "Deep dive"] as const;
const LENSES = ["Market", "Technical", "Competitive", "Operational"] as const;

const PRESETS = [
  "Should we build our own document parser or license one?",
  "What is driving churn among mid-market accounts?",
  "How do competitors price usage-based add-ons?",
  "Is our onboarding the bottleneck for time-to-value?",
];

function ResearchPage() {
  const [input, setInput] = useState<ResearchInput>({
    question: "",
    depth: "Standard",
    lens: "Market",
  });
  const [loading, setLoading] = useState(false);
  const [doc, setDoc] = useState<GeneratedDoc | null>(null);

  const set = <K extends keyof ResearchInput>(k: K, v: ResearchInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const run = async () => {
    setLoading(true);
    const r = await withLatency(() => research(input), 1700);
    setDoc(r);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <WorkspaceHeader
        kicker="Workspace 04"
        title="AI Research Assistant"
        description="Ask the question you actually need answered. Ember returns a thesis, the insights that follow from it, the evidence you still owe yourself, and the strongest case against — because a brief without a counter-view is just encouragement."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <Panel title="Question">
          <div className="space-y-5">
            <Field label="What do you need to decide?" hint="Editable">
              <Textarea
                value={input.question}
                onChange={(e) => set("question", e.target.value)}
                rows={5}
                placeholder="e.g. Should we build our own document parser or license one?"
                className="resize-y bg-background/60"
              />
            </Field>

            <PresetRow
              presets={PRESETS.map((p) => ({ label: p }))}
              onPick={(label) => set("question", label)}
            />

            <Field label="Lens">
              <ChipGroup
                options={LENSES}
                value={input.lens}
                onChange={(v) => set("lens", v as ResearchInput["lens"])}
              />
            </Field>

            <Field label="Depth">
              <ChipGroup
                options={DEPTHS}
                value={input.depth}
                onChange={(v) => set("depth", v as ResearchInput["depth"])}
              />
            </Field>

            <GenerateButton
              loading={loading}
              disabled={!input.question.trim()}
              onClick={run}
              label="Build research brief"
            />
          </div>
        </Panel>

        <Panel title="Research brief">
          {loading ? (
            <OutputSkeleton />
          ) : doc ? (
            <DocView doc={doc} />
          ) : (
            <EmptyOutput>
              Ask a question or pick a preset to get a structured brief with insights, evidence
              gaps, a counter-view and next actions.
            </EmptyOutput>
          )}
        </Panel>
      </div>
    </div>
  );
}
