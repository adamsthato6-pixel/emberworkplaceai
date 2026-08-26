import { useState, type ReactNode } from "react";
import { Check, ChevronDown, Copy, Sparkles, Terminal } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DISCLAIMER, type GeneratedDoc, type DocSection } from "@/lib/ai-sim";

export function WorkspaceHeader({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <header className="mb-8 max-w-3xl">
      <p className="text-[11px] uppercase tracking-[0.22em] text-ember">{kicker}</p>
      <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">{title}</h1>
      <div className="ember-rule mt-4 w-24" />
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </header>
  );
}

export function Panel({
  title,
  aside,
  children,
  className,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass-card rounded-xl", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </h2>
        {aside}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs transition-colors",
            value === o
              ? "border-ember bg-ember/15 text-ember-soft"
              : "border-border text-muted-foreground hover:border-ember/40 hover:text-foreground",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function PresetRow({
  presets,
  onPick,
}: {
  presets: { label: string; hint?: string }[];
  onPick: (label: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        Presets
      </span>
      {presets.map((p) => (
        <button
          key={p.label}
          type="button"
          title={p.hint}
          onClick={() => onPick(p.label)}
          className="rounded-md border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-ember/50 hover:text-ember-soft"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function GenerateButton({
  loading,
  disabled,
  onClick,
  label = "Generate",
}: {
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-md bg-ember px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all sm:w-auto",
        "hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55",
      )}
    >
      {loading ? (
        <>
          <span className="size-3.5 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
          Composing…
        </>
      ) : (
        <>
          <Sparkles className="size-4" strokeWidth={2} />
          {label}
        </>
      )}
    </button>
  );
}

const stages = [
  "Parsing input",
  "Applying prompt template",
  "Structuring output",
  "Polishing language",
];

export function OutputSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {stages.map((s, i) => (
          <span
            key={s}
            className="animate-pulse rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground"
            style={{ animationDelay: `${i * 180}ms` }}
          >
            {s}
          </span>
        ))}
      </div>
      {[92, 78, 85, 60, 88, 45].map((w, i) => (
        <div
          key={i}
          className="h-3 animate-pulse rounded-full bg-surface-raised"
          style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

export function EmptyOutput({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-14 text-center">
      <Sparkles className="mx-auto size-5 text-ember/70" />
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

const toneClass: Record<NonNullable<DocSection["tone"]>, string> = {
  default: "border-border",
  ember: "border-ember/40 bg-ember/[0.06]",
  sage: "border-sage/35 bg-sage/[0.05]",
  orchid: "border-orchid/35 bg-orchid/[0.05]",
};

function docToText(doc: GeneratedDoc) {
  const parts = [doc.title, ""];
  for (const s of doc.sections) {
    parts.push(s.label.toUpperCase());
    if (s.body) parts.push(s.body);
    if (s.bullets) parts.push(...s.bullets.map((b) => `• ${b}`));
    if (s.rows) parts.push(...s.rows.map((r) => `- ${r.k}: ${r.v}`));
    parts.push("");
  }
  parts.push(DISCLAIMER);
  return parts.join("\n");
}

export function DocView({ doc, extra }: { doc: GeneratedDoc; extra?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(docToText(doc));
      setCopied(true);
      toast.success("Output copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Clipboard unavailable in this view");
    }
  };

  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl leading-snug">{doc.title}</h3>
          <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {doc.meta.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </p>
        </div>
        <button
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-ember/50 hover:text-ember-soft"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {extra}

      <div className="space-y-4">
        {doc.sections.map((s) => (
          <div
            key={s.label}
            className={cn("rounded-lg border px-4 py-4", toneClass[s.tone ?? "default"])}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {s.label}
            </p>
            {s.body && (
              <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed">{s.body}</p>
            )}
            {s.bullets && (
              <ul className="mt-2.5 space-y-2">
                {s.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ember/70" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {s.rows && (
              <dl className="mt-2.5 divide-y divide-border">
                {s.rows.map((r, i) => (
                  <div key={i} className="flex flex-wrap gap-x-4 gap-y-1 py-2 text-sm">
                    <dt className="min-w-0 flex-1 font-medium">{r.k}</dt>
                    <dd className="font-mono text-xs text-muted-foreground">{r.v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border">
        <button
          onClick={() => setShowPrompt((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
        >
          <span className="inline-flex items-center gap-2">
            <Terminal className="size-3.5" /> Prompt template used
          </span>
          <ChevronDown className={cn("size-4 transition-transform", showPrompt && "rotate-180")} />
        </button>
        {showPrompt && (
          <pre className="overflow-x-auto border-t border-border px-4 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
            {doc.prompt}
          </pre>
        )}
      </div>

      <p className="text-[11px] text-ember-soft/80">{DISCLAIMER}</p>
    </article>
  );
}
