/**
 * Local simulated AI engine.
 *
 * No API credentials required: every "model call" is a deterministic
 * transformation of the user's input, run behind an artificial latency so the
 * UI can show real loading states. Each feature ships a structured prompt
 * template (system / task / constraints / output contract) which is surfaced in
 * the UI so the prompt engineering is inspectable.
 */

export const DISCLAIMER = "AI-generated content may require human review";

export type DocSection = {
  label: string;
  body?: string;
  bullets?: string[];
  rows?: { k: string; v: string }[];
  tone?: "default" | "ember" | "sage" | "orchid";
};

export type GeneratedDoc = {
  title: string;
  meta: string[];
  prompt: string;
  sections: DocSection[];
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function withLatency<T>(fn: () => T, ms = 1400): Promise<T> {
  await sleep(ms);
  return fn();
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map(clean)
    .filter((s) => s.length > 3);
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function keywords(text: string, n = 6): string[] {
  const stop = new Set(
    "the a an and or but if then with for from into to of on in at by is are was were be been being we our you your they their it its this that these those as will can should would could about need needs have has had more most very just also than them not our us i".split(
      " ",
    ),
  );
  const counts = new Map<string, number>();
  for (const w of text.toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? []) {
    if (stop.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([w]) => w);
}

function pickVerbs(text: string): string[] {
  const cues = [
    "confirm",
    "send",
    "review",
    "share",
    "schedule",
    "draft",
    "follow up",
    "align",
    "ship",
    "decide",
    "update",
    "fix",
    "prepare",
    "hire",
    "migrate",
    "test",
  ];
  const low = text.toLowerCase();
  const hits = cues.filter((c) => low.includes(c));
  return hits.length ? hits : ["confirm", "review", "follow up"];
}

function futureDate(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/* ---------------------------------- Email --------------------------------- */

export type EmailTone = "Warm" | "Direct" | "Formal" | "Persuasive" | "Apologetic";
export type EmailAudience =
  | "Executive"
  | "Client"
  | "Teammate"
  | "Candidate"
  | "Vendor";
export type EmailLength = "Short" | "Standard" | "Detailed";

export type EmailInput = {
  intent: string;
  tone: EmailTone;
  audience: EmailAudience;
  length: EmailLength;
  senderName: string;
  includeCta: boolean;
};

const toneOpeners: Record<EmailTone, string> = {
  Warm: "Hope your week is going well —",
  Direct: "Quick note:",
  Formal: "I hope this message finds you well.",
  Persuasive: "There's a clear win available here, and I'd like your take.",
  Apologetic: "Thank you for your patience on this —",
};

const audienceFraming: Record<EmailAudience, string> = {
  Executive: "Leading with outcome and decision needed, detail kept to a minimum.",
  Client: "Framed around value delivered and next steps you can count on.",
  Teammate: "Collaborative framing with shared ownership of the next step.",
  Candidate: "Transparent about process, timing and what happens next.",
  Vendor: "Specific about scope, dates and acceptance criteria.",
};

export function emailPrompt(i: EmailInput) {
  return [
    "SYSTEM: You are a senior workplace communications editor.",
    `TASK: Write one email that accomplishes: "${clean(i.intent) || "<intent>"}".`,
    `AUDIENCE: ${i.audience} — ${audienceFraming[i.audience]}`,
    `TONE: ${i.tone}. LENGTH: ${i.length}.`,
    "CONSTRAINTS: no filler, no hedging, one idea per paragraph, plain English, British spelling.",
    `OUTPUT CONTRACT: subject line (<=8 words), greeting, ${
      i.length === "Short" ? "1-2" : i.length === "Standard" ? "2-3" : "3-4"
    } body paragraphs${i.includeCta ? ", explicit call to action with a date" : ""}, sign-off as ${
      i.senderName || "<sender>"
    }.`,
  ].join("\n");
}

export function generateEmail(i: EmailInput): GeneratedDoc {
  const intent = clean(i.intent) || "share a project update";
  const kw = keywords(intent, 4);
  const subject = titleCase(
    (kw.length ? kw.slice(0, 3).join(" ") : intent.slice(0, 40)) + " — next step",
  );
  const paras = [
    `${toneOpeready(i.tone)} ${intent.charAt(0).toUpperCase() + intent.slice(1)}${
      intent.endsWith(".") ? "" : "."
    }`,
    `Here's where things stand: the essentials are in place${
      kw[0] ? ` around ${kw[0]}` : ""
    }, and the remaining open items are small enough to close this week. I've kept the detail short on purpose — ${audienceFraming[
      i.audience
    ].toLowerCase()}`,
    i.length !== "Short"
      ? `If it's useful I can send a one-page summary with owners and dates attached, so nothing depends on this thread staying open.`
      : "",
    i.includeCta
      ? `Could you confirm by ${futureDate(3)}? A yes/no is enough — I'll take it from there.`
      : "",
  ].filter(Boolean) as string[];

  const greeting =
    i.audience === "Executive"
      ? "Dear colleague,"
      : i.audience === "Client"
        ? "Hello,"
        : "Hi there,";

  return {
    title: subject,
    meta: [i.tone, i.audience, `${i.length} length`],
    prompt: emailPrompt(i),
    sections: [
      { label: "Subject", body: subject, tone: "ember" },
      { label: "Body", body: [greeting, ...paras].join("\n\n") },
      {
        label: "Sign-off",
        body: `${i.tone === "Formal" ? "Kind regards" : "Thanks"},\n${
          i.senderName || "Your name"
        }`,
      },
      {
        label: "Editor notes",
        tone: "sage",
        bullets: [
          `Reading level tuned for a ${i.audience.toLowerCase()} reader.`,
          i.includeCta
            ? `A dated ask is included (${futureDate(3)}) to avoid an open loop.`
            : "No call to action requested — consider adding one before sending.",
          `Removed hedging language ("just", "maybe", "I think").`,
        ],
      },
    ],
  };
}

function toneOpeready(t: EmailTone) {
  return toneOpeners[t];
}

/* ------------------------------ Meeting notes ----------------------------- */

export type NotesInput = { transcript: string; meetingName: string; attendees: string };

export function notesPrompt(i: NotesInput) {
  return [
    "SYSTEM: You are a meeting analyst who produces auditable minutes.",
    `TASK: Summarise the transcript of "${i.meetingName || "<meeting>"}".`,
    `PARTICIPANTS: ${i.attendees || "<unspecified>"}.`,
    "CONSTRAINTS: no invented facts; anything uncertain goes under Open questions.",
    "OUTPUT CONTRACT: 1) 3-line executive summary 2) key points 3) decisions 4) action items with owner + deadline 5) risks 6) open questions.",
  ].join("\n");
}

export function summarizeNotes(i: NotesInput): GeneratedDoc {
  const ss = sentences(i.transcript);
  const kw = keywords(i.transcript, 6);
  const people = i.attendees
    .split(/[,\n]/)
    .map(clean)
    .filter(Boolean);
  const owner = (n: number) => people[n % Math.max(people.length, 1)] || "Unassigned";
  const verbs = pickVerbs(i.transcript);

  const key = ss.slice(0, 5).map((s) => (s.length > 160 ? s.slice(0, 157) + "…" : s));
  const decisions = ss
    .filter((s) => /\b(agree|decide|decided|will|approved|sign off|go ahead)\b/i.test(s))
    .slice(0, 3);

  return {
    title: i.meetingName || "Meeting summary",
    meta: [
      `${ss.length} statements analysed`,
      `${people.length || "—"} participants`,
      new Date().toLocaleDateString("en-GB"),
    ],
    prompt: notesPrompt(i),
    sections: [
      {
        label: "Executive summary",
        tone: "ember",
        body:
          key.length > 0
            ? `${key[0]} The discussion centred on ${
                kw.slice(0, 3).join(", ") || "the agenda"
              }. Momentum is on the follow-through rather than the decision itself.`
            : "Not enough transcript content to summarise yet.",
      },
      { label: "Key points", bullets: key.length ? key : ["—"] },
      {
        label: "Decisions",
        tone: "sage",
        bullets: decisions.length
          ? decisions
          : ["No explicit decision was recorded — confirm with the chair."],
      },
      {
        label: "Action items",
        rows: verbs.slice(0, 4).map((v, n) => ({
          k: `${titleCase(v)} ${kw[n] ?? "the follow-up item"}`,
          v: `${owner(n)} · due ${futureDate(2 + n * 2)}`,
        })),
      },
      {
        label: "Risks",
        tone: "orchid",
        bullets: [
          `Ownership is implicit for ${kw[1] ?? "at least one item"} — assign a named owner.`,
          "Deadlines were inferred from context, not stated aloud.",
        ],
      },
      {
        label: "Open questions",
        bullets: [
          `What is the acceptance criteria for ${kw[0] ?? "the main workstream"}?`,
          "Who signs off before this goes external?",
        ],
      },
    ],
  };
}

/* -------------------------------- Planner -------------------------------- */

export type PlannerInput = {
  braindump: string;
  horizon: "Today" | "This week" | "This sprint";
  capacityHours: number;
  energyPeak: "Morning" | "Afternoon";
};

export type PlannedTask = {
  title: string;
  priority: "P1" | "P2" | "P3";
  impact: number;
  effort: number;
  score: number;
  slot: string;
  minutes: number;
};

export function plannerPrompt(i: PlannerInput) {
  return [
    "SYSTEM: You are a chief-of-staff scheduler using impact/effort triage.",
    `TASK: Turn the raw task list into a prioritised ${i.horizon.toLowerCase()} plan.`,
    `CAPACITY: ${i.capacityHours} focus hours. PEAK ENERGY: ${i.energyPeak}.`,
    "CONSTRAINTS: score = impact / effort; deep work in the peak window; never schedule beyond capacity; batch shallow work.",
    "OUTPUT CONTRACT: ranked table (task, P-level, impact, effort, slot) + deferred list + one focus recommendation.",
  ].join("\n");
}

export function planTasks(i: PlannerInput): { doc: GeneratedDoc; tasks: PlannedTask[] } {
  const raw = i.braindump
    .split(/\n|;/)
    .map((l) => clean(l.replace(/^[-*\d.\s]+/, "")))
    .filter(Boolean);

  const urgentWord = /(today|urgent|asap|deadline|blocker|launch|client|ship)/i;
  const bigWord = /(plan|design|write|build|migrate|research|strategy|rewrite)/i;

  const scored = raw.map((title) => {
    const impact = Math.min(5, 2 + (urgentWord.test(title) ? 2 : 0) + (title.length > 40 ? 1 : 0));
    const effort = Math.min(5, 1 + (bigWord.test(title) ? 2 : 0) + Math.floor(title.length / 45));
    const score = Number((impact / Math.max(effort, 1)).toFixed(2));
    return { title, impact, effort, score };
  });

  scored.sort((a, b) => b.score - a.score || b.impact - a.impact);

  const startHour = i.energyPeak === "Morning" ? 9 : 13;
  let used = 0;
  const tasks: PlannedTask[] = [];
  const deferred: string[] = [];

  scored.forEach((t, idx) => {
    const minutes = t.effort >= 4 ? 90 : t.effort >= 2 ? 50 : 25;
    if (used + minutes / 60 > i.capacityHours) {
      deferred.push(t.title);
      return;
    }
    const startMin = startHour * 60 + used * 60;
    const h = Math.floor(startMin / 60);
    const m = Math.round(startMin % 60);
    used += minutes / 60;
    tasks.push({
      ...t,
      priority: idx === 0 ? "P1" : t.score >= 1.5 ? "P1" : t.score >= 1 ? "P2" : "P3",
      minutes,
      slot: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    });
  });

  const doc: GeneratedDoc = {
    title: `${i.horizon} plan`,
    meta: [
      `${tasks.length} scheduled`,
      `${used.toFixed(1)}h of ${i.capacityHours}h used`,
      `${deferred.length} deferred`,
    ],
    prompt: plannerPrompt(i),
    sections: [
      {
        label: "Focus recommendation",
        tone: "ember",
        body: tasks.length
          ? `Protect ${tasks[0].slot}–${tasks[0].minutes}min for "${tasks[0].title}". It carries the highest impact-to-effort ratio (${tasks[0].score}), and everything below it gets easier once it's done.`
          : "Add a few tasks to generate a plan.",
      },
      {
        label: "Deferred",
        tone: "orchid",
        bullets: deferred.length ? deferred : ["Nothing deferred — capacity fits the list."],
      },
      {
        label: "Guardrails",
        tone: "sage",
        bullets: [
          `Shallow work batched after ${i.energyPeak === "Morning" ? "13:00" : "16:00"}.`,
          "No task exceeds a 90-minute block; add a 10-minute reset between blocks.",
        ],
      },
    ],
  };

  return { doc, tasks };
}

/* -------------------------------- Research ------------------------------- */

export type ResearchInput = {
  question: string;
  depth: "Brief" | "Standard" | "Deep dive";
  lens: "Market" | "Technical" | "Competitive" | "Operational";
};

export function researchPrompt(i: ResearchInput) {
  return [
    "SYSTEM: You are a research analyst who separates evidence from inference.",
    `QUESTION: ${clean(i.question) || "<question>"}`,
    `LENS: ${i.lens}. DEPTH: ${i.depth}.`,
    "CONSTRAINTS: label every claim as observed or inferred; no fabricated citations; flag what would change the conclusion.",
    "OUTPUT CONTRACT: thesis, key insights, evidence needed, counter-view, recommended next actions.",
  ].join("\n");
}

export function research(i: ResearchInput): GeneratedDoc {
  const q = clean(i.question) || "the topic";
  const kw = keywords(q, 5);
  const depthN = i.depth === "Brief" ? 3 : i.depth === "Standard" ? 4 : 6;

  const insightSeeds = [
    `The constraint is rarely ${kw[0] ?? "the technology"} — it's the decision latency around it.`,
    `${titleCase(kw[1] ?? "Adoption")} tends to follow existing workflows; anything requiring a new habit stalls first.`,
    `Cost curves favour incumbents in the short term, challengers once ${kw[2] ?? "distribution"} commoditises.`,
    `The measurable proxy for success here is time-to-first-value, not feature parity.`,
    `Risk concentrates where ownership is shared but accountability is not.`,
    `A 90-day pilot with two teams produces more signal than a six-month analysis.`,
  ];

  return {
    title: `Research brief — ${q.length > 60 ? q.slice(0, 57) + "…" : q}`,
    meta: [i.lens + " lens", i.depth, `${depthN} insights`],
    prompt: researchPrompt(i),
    sections: [
      {
        label: "Thesis",
        tone: "ember",
        body: `Through a ${i.lens.toLowerCase()} lens, ${q.replace(/\?$/, "")} resolves less into a single answer and more into a sequencing problem: decide what must be true first, then buy evidence for that one thing.`,
      },
      { label: "Key insights", bullets: insightSeeds.slice(0, depthN) },
      {
        label: "Evidence to gather",
        tone: "sage",
        rows: [
          { k: "Primary", v: `5–8 structured interviews on ${kw[0] ?? "the workflow"}` },
          { k: "Quantitative", v: "Baseline metric for the last two quarters" },
          { k: "Comparative", v: "Two adjacent implementations and their failure modes" },
        ],
      },
      {
        label: "Counter-view",
        tone: "orchid",
        body: `The strongest opposing case: the current approach is under-instrumented rather than wrong, and ${
          kw[1] ?? "the proposed change"
        } would add coordination cost without changing the bottleneck.`,
      },
      {
        label: "Next actions",
        bullets: [
          `Write the one-page decision memo before gathering more data.`,
          `Instrument the baseline metric this week.`,
          `Run a two-week probe with a reversible commitment.`,
        ],
      },
    ],
  };
}

/* --------------------------------- Chatbot ------------------------------- */

export const chatSystemPrompt = [
  "SYSTEM: You are Ember, an internal workplace productivity assistant.",
  "STYLE: concise, concrete, British English; no flattery, no filler.",
  "BEHAVIOUR: ask at most one clarifying question, then give a usable answer with steps.",
  "SAFETY: never invent internal data; say what you'd need instead.",
].join("\n");

export function chatReply(message: string, turn: number): string {
  const m = clean(message);
  const kw = keywords(m, 3);
  const low = m.toLowerCase();

  if (/^(hi|hey|hello|yo)\b/.test(low)) {
    return "Hello. Tell me what you're trying to move forward today — a draft, a decision, or a plan — and I'll take the first pass.";
  }
  if (low.includes("email") || low.includes("draft")) {
    return `Here's a fast structure for that draft:\n\n1. One-line context — why this lands in their inbox now.\n2. The ask, with a date attached.\n3. What they get out of saying yes.\n4. A single fallback option so "no" still moves things along.\n\nIf you paste the raw intent into the Smart Email Generator I'll produce a full version with tone controls.`;
  }
  if (low.includes("meeting") || low.includes("summar")) {
    return `Three things make minutes trustworthy: decisions separated from discussion, every action carrying a named owner and a date, and uncertainty parked under "open questions" rather than smoothed over. Paste the transcript into Meeting Notes Summarizer and I'll split it that way.`;
  }
  if (low.includes("prioriti") || low.includes("plan") || low.includes("task")) {
    return `Rank by impact ÷ effort, then protect the top item in your peak-energy window. Two rules keep it honest: nothing longer than a 90-minute block, and anything that doesn't fit today gets explicitly deferred rather than silently carried.`;
  }
  if (m.endsWith("?")) {
    return `Short answer: it depends on which constraint binds first — ${
      kw[0] ?? "scope"
    } or time.\n\nMy working view: pick the smallest reversible step that produces evidence within two weeks, and write down what result would make you change course. If you tell me the deadline and who needs convincing, I'll tighten this into something you can send.`;
  }
  return `Noted${kw[0] ? ` — the core of this looks like ${kw[0]}` : ""}. Here's how I'd approach it:\n\n• Name the outcome in one sentence, so success is testable.\n• Strip it to the one step that can't be skipped${turn > 2 ? " (you've now given me enough to be specific about that)" : ""}.\n• Set a date and an owner, even if the owner is you.\n\nWant me to turn this into a plan, an email, or a research brief?`;
}
