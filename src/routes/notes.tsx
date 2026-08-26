import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  WorkspaceHeader,
  Panel,
  Field,
  PresetRow,
  GenerateButton,
  OutputSkeleton,
  EmptyOutput,
  DocView,
} from "@/components/workspace";
import { summarizeNotes, withLatency, type GeneratedDoc, type NotesInput } from "@/lib/ai-sim";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Ember" },
      {
        name: "description",
        content:
          "Turn a raw transcript into executive summary, key points, decisions, action items with owners and deadlines, risks and open questions.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Ember" },
      {
        property: "og:description",
        content: "Auditable minutes: decisions separated from discussion, actions with owners.",
      },
    ],
  }),
  component: NotesPage,
});

const SAMPLE = `Ruth opened by saying the pilot with Northwind is live and the first two teams are onboarded.
Adam flagged that the migration script still fails on legacy attachments, roughly 4% of records.
We agreed to ship the pilot without attachment support and revisit next sprint.
Priya asked who signs off before the client sees the report - nobody had an answer.
Deadline pressure: the steering group reviews progress at the end of next week.
Adam will prepare a fix estimate. Ruth will confirm the client comms plan.`;

const PRESETS = [
  { key: "Client pilot review", value: SAMPLE },
  {
    key: "Sprint retro",
    value: `The team agreed velocity dipped because of unplanned support work.
Sam suggested capping support rotation at one person per sprint.
We decided to trial the cap for two sprints and measure carryover.
Open question: how do we handle escalations during the trial?
Risk: the cap could delay the billing fix that the client expects this month.`,
  },
  {
    key: "Vendor negotiation",
    value: `The vendor offered a 12% discount for a two-year commitment.
Legal will review the liability cap before we go ahead.
We agreed not to sign anything before the security review completes.
Finance needs the numbers by Thursday to include them in the forecast.`,
  },
];

function NotesPage() {
  const [input, setInput] = useState<NotesInput>({
    transcript: "",
    meetingName: "",
    attendees: "",
  });
  const [loading, setLoading] = useState(false);
  const [doc, setDoc] = useState<GeneratedDoc | null>(null);

  const set = <K extends keyof NotesInput>(k: K, v: NotesInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const run = async () => {
    setLoading(true);
    const result = await withLatency(() => summarizeNotes(input), 1600);
    setDoc(result);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <WorkspaceHeader
        kicker="Workspace 02"
        title="Meeting Notes Summarizer"
        description="Paste notes or a rough transcript. Ember separates what was decided from what was merely discussed, attaches an owner and a date to every action, and parks uncertainty under open questions instead of smoothing it over."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <Panel title="Transcript">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Meeting">
                <Input
                  value={input.meetingName}
                  onChange={(e) => set("meetingName", e.target.value)}
                  placeholder="Northwind pilot review"
                  className="bg-background/60"
                />
              </Field>
              <Field label="Attendees" hint="comma separated">
                <Input
                  value={input.attendees}
                  onChange={(e) => set("attendees", e.target.value)}
                  placeholder="Ruth, Adam, Priya"
                  className="bg-background/60"
                />
              </Field>
            </div>

            <Field label="Notes or transcript" hint="Editable">
              <Textarea
                value={input.transcript}
                onChange={(e) => set("transcript", e.target.value)}
                rows={12}
                placeholder="Paste the raw notes here…"
                className="resize-y bg-background/60 font-mono text-xs leading-relaxed"
              />
            </Field>

            <PresetRow
              presets={PRESETS.map((p) => ({ label: p.key }))}
              onPick={(label) => {
                const p = PRESETS.find((x) => x.key === label);
                if (!p) return;
                setInput({
                  transcript: p.value,
                  meetingName: p.key,
                  attendees: label === "Client pilot review" ? "Ruth, Adam, Priya" : "Sam, Ruth",
                });
              }}
            />

            <GenerateButton
              loading={loading}
              disabled={!input.transcript.trim()}
              onClick={run}
              label="Summarise meeting"
            />
          </div>
        </Panel>

        <Panel title="Minutes">
          {loading ? (
            <OutputSkeleton />
          ) : doc ? (
            <DocView doc={doc} />
          ) : (
            <EmptyOutput>
              Paste a transcript or load a preset to see key points, decisions, dated action items,
              risks and open questions.
            </EmptyOutput>
          )}
        </Panel>
      </div>
    </div>
  );
}
