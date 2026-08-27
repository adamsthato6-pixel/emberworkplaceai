import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ShieldCheck, Scale, Eye } from "lucide-react";
import { WorkspaceHeader, Panel } from "@/components/workspace";
import { DISCLAIMER } from "@/lib/ai-sim";

export const Route = createFileRoute("/responsible")({
  head: () => ({
    meta: [
      { title: "Responsible AI — Ember Workplace Assistant" },
      {
        name: "description",
        content:
          "Limitations, bias risks and a validation checklist for every output Ember produces, plus the human review steps we expect before anything is sent.",
      },
      { property: "og:title", content: "Responsible AI — Ember" },
      {
        property: "og:description",
        content: "How Ember handles limitations, bias, risk and human validation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResponsiblePage,
});

const LIMITS = [
  "Outputs are generated from patterns in the input, not from verified internal records — treat every fact as unconfirmed until you check it.",
  "This prototype runs a local simulation engine, so it has no access to your inbox, calendar, CRM or documents.",
  "Dates and owners in generated plans and minutes are inferred from context. If they were not stated, they are suggestions.",
  "Long or unstructured input degrades quality; summaries favour the earliest and most repeated material.",
];

const BIAS = [
  "Tone presets encode a Western, corporate register that may read as blunt or overly formal in other cultures.",
  "Prioritisation uses impact ÷ effort, which systematically favours quick wins over slow, high-value work.",
  "Name-based owner assignment in minutes can reinforce whoever spoke most, not whoever is accountable.",
  "Research briefs generate a counter-view by design, but a single counter-view is not a balanced literature review.",
];

const RISKS = [
  { k: "Over-trust", v: "Sending a draft unread because it looks finished." },
  { k: "Fabrication", v: "Confident phrasing around facts that were never supplied." },
  { k: "Confidentiality", v: "Pasting client or personal data into any AI tool without approval." },
  { k: "Accountability drift", v: "Actions with a due date but no human who agreed to own them." },
];

const CHECKS = [
  "Read the output end to end before it leaves the app.",
  "Verify every name, number, date and commitment against the source.",
  "Remove or mask personal and client-identifying data before pasting input.",
  "Confirm decisions with the meeting chair or task owner, not with the summary.",
  "Keep the disclaimer attached when sharing generated content internally.",
  "Log anything the assistant got wrong so prompts can be refined.",
];

function ResponsiblePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <WorkspaceHeader
        kicker="Responsible AI"
        title="Limits, bias and validation"
        description="Useful AI is honest about where it stops being useful. This page states what Ember cannot know, where its judgements are skewed, what can go wrong, and the human checks that must happen before anything generated here is acted on."
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Panel title="Known limitations">
          <ul className="space-y-3 text-sm text-muted-foreground">
            {LIMITS.map((l) => (
              <li key={l} className="flex gap-3">
                <Eye className="mt-0.5 size-4 shrink-0 text-ember" strokeWidth={1.75} />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Where bias enters">
          <ul className="space-y-3 text-sm text-muted-foreground">
            {BIAS.map((l) => (
              <li key={l} className="flex gap-3">
                <Scale className="mt-0.5 size-4 shrink-0 text-ember" strokeWidth={1.75} />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Risk register">
          <dl className="divide-y divide-border/70 text-sm">
            {RISKS.map((r) => (
              <div key={r.k} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
                <dt className="flex items-center gap-2 font-medium sm:w-44 sm:shrink-0">
                  <AlertTriangle className="size-4 text-ember" strokeWidth={1.75} />
                  {r.k}
                </dt>
                <dd className="text-muted-foreground">{r.v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="Validation checklist">
          <ol className="space-y-3 text-sm text-muted-foreground">
            {CHECKS.map((c, n) => (
              <li key={c} className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ember/15 text-[11px] font-medium text-ember">
                  {n + 1}
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 border-t border-border pt-4 text-[11px] text-ember-soft/80">
            {DISCLAIMER}
          </p>
        </Panel>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-lg border border-border bg-card/60 p-5 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ember" strokeWidth={1.75} />
        <p>
          Every workspace exposes the exact prompt template used to produce its output, so a
          reviewer can judge the instruction as well as the answer. Nothing is sent to an external
          service in this prototype — no credentials, no data leaving the browser.
        </p>
      </div>
    </div>
  );
}
