import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  generateEmail,
  withLatency,
  type EmailAudience,
  type EmailInput,
  type EmailLength,
  type EmailTone,
  type GeneratedDoc,
} from "@/lib/ai-sim";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Ember" },
      {
        name: "description",
        content:
          "Draft workplace emails with tone, audience and length controls, plus editor notes and a visible prompt template.",
      },
      { property: "og:title", content: "Smart Email Generator — Ember" },
      {
        property: "og:description",
        content: "Turn a one-line intent into a polished email with tone and audience controls.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Informal", "Persuasive", "Warm", "Direct", "Apologetic"] as const;
const AUDIENCES = [
  "Manager",
  "Client",
  "Teammate",
  "Executive",
  "Candidate",
  "Vendor",
] as const;
const LENGTHS = ["Short", "Standard", "Detailed"] as const;

const PRESETS = [
  "Ask the client to approve the revised scope before Friday",
  "Tell the team the launch slips by one week and why",
  "Decline a vendor proposal politely but firmly",
  "Nudge an executive for a decision on hiring budget",
];

function EmailPage() {
  const [input, setInput] = useState<EmailInput>({
    intent: "",
    tone: "Direct",
    audience: "Client",
    length: "Standard",
    senderName: "Thato Molefe",
    includeCta: true,
  });
  const [loading, setLoading] = useState(false);
  const [doc, setDoc] = useState<GeneratedDoc | null>(null);

  const set = <K extends keyof EmailInput>(k: K, v: EmailInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const run = async () => {
    setLoading(true);
    const result = await withLatency(() => generateEmail(input), 1300);
    setDoc(result);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <WorkspaceHeader
        kicker="Workspace 01"
        title="Smart Email Generator"
        description="Describe the outcome you want. Ember shapes the message for the reader in front of you — subject line, body, sign-off and editor notes — and never leaves an open loop where a dated ask belongs."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <Panel title="Brief">
          <div className="space-y-5">
            <Field label="What should this email achieve?" hint="Editable at any time">
              <Textarea
                value={input.intent}
                onChange={(e) => set("intent", e.target.value)}
                rows={5}
                placeholder="e.g. Ask the client to approve the revised scope before Friday"
                className="resize-y bg-background/60"
              />
            </Field>

            <PresetRow
              presets={PRESETS.map((p) => ({ label: p }))}
              onPick={(label) => set("intent", label)}
            />

            <Field label="Tone">
              <ChipGroup
                options={TONES}
                value={input.tone}
                onChange={(v) => set("tone", v as EmailTone)}
              />
            </Field>

            <Field label="Audience">
              <ChipGroup
                options={AUDIENCES}
                value={input.audience}
                onChange={(v) => set("audience", v as EmailAudience)}
              />
            </Field>

            <Field label="Length">
              <ChipGroup
                options={LENGTHS}
                value={input.length}
                onChange={(v) => set("length", v as EmailLength)}
              />
            </Field>

            <Field label="Sign off as">
              <Input
                value={input.senderName}
                onChange={(e) => set("senderName", e.target.value)}
                className="bg-background/60"
              />
            </Field>

            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <span className="text-sm">
                Include a dated call to action
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Adds a specific deadline to the ask
                </span>
              </span>
              <Switch
                checked={input.includeCta}
                onCheckedChange={(v) => set("includeCta", v)}
                aria-label="Include call to action"
              />
            </div>

            <GenerateButton
              loading={loading}
              disabled={!input.intent.trim()}
              onClick={run}
              label="Compose email"
            />
          </div>
        </Panel>

        <Panel title="Generated draft">
          {loading ? (
            <OutputSkeleton />
          ) : doc ? (
            <DocView doc={doc} />
          ) : (
            <EmptyOutput>
              Add an intent or pick a preset, then compose. Your draft appears here with editor
              notes you can act on before sending.
            </EmptyOutput>
          )}
        </Panel>
      </div>
    </div>
  );
}
