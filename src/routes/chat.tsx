import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Flame, Send, Terminal, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { WorkspaceHeader, Panel } from "@/components/workspace";
import { DISCLAIMER, chatReply, chatSystemPrompt, withLatency } from "@/lib/ai-sim";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Ember Chat — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "A concise workplace AI chat that answers with steps, not filler — drafting, prioritising and decision support.",
      },
      { property: "og:title", content: "Ember Chat — AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Ask about drafts, meetings or priorities and get a usable answer with steps.",
      },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Help me prioritise a chaotic Thursday",
  "How do I write minutes people trust?",
  "Draft a nudge for a late approval",
  "Is a two-week probe better than a full analysis?",
];

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md ring-1",
          isUser ? "bg-surface-raised ring-border" : "bg-ember/15 ring-ember/30",
        )}
      >
        {isUser ? (
          <User className="size-3.5 text-muted-foreground" />
        ) : (
          <Flame className="size-3.5 text-ember" />
        )}
      </span>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-line rounded-lg border px-4 py-3 text-sm leading-relaxed",
          isUser ? "border-border bg-surface-raised/60" : "border-ember/25 bg-ember/[0.05]",
        )}
      >
        {msg.content}
      </div>
    </div>
  );
}

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "I'm Ember. I keep answers short and concrete — tell me what you're trying to move forward and I'll take the first pass.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || thinking) return;
    setDraft("");
    const turn = messages.filter((m) => m.role === "user").length + 1;
    setMessages((p) => [...p, { role: "user", content }]);
    setThinking(true);
    const reply = await withLatency(() => chatReply(content, turn), 1100);
    setMessages((p) => [...p, { role: "assistant", content: reply }]);
    setThinking(false);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <WorkspaceHeader
        kicker="Workspace 05"
        title="Ember Chat"
        description="One conversation, no ceremony. Ember asks at most one clarifying question, then gives you something usable — and tells you what it would need rather than inventing internal data."
      />

      <Panel
        title="Conversation"
        aside={
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            simulated · local
          </span>
        }
      >
        <div className="max-h-[52vh] space-y-4 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <Bubble key={i} msg={m} />
          ))}
          {thinking && (
            <div className="flex items-center gap-2 pl-10 text-xs text-muted-foreground">
              <span className="size-1.5 animate-bounce rounded-full bg-ember" />
              <span
                className="size-1.5 animate-bounce rounded-full bg-ember"
                style={{ animationDelay: "120ms" }}
              />
              <span
                className="size-1.5 animate-bounce rounded-full bg-ember"
                style={{ animationDelay: "240ms" }}
              />
              <span className="ml-1">Ember is thinking…</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="mt-5 space-y-3 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-md border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-ember/50 hover:text-ember-soft"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-2">
            <Textarea
              value={draft}
              rows={2}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(draft);
                }
              }}
              placeholder="Ask Ember… (Enter to send, Shift+Enter for a new line)"
              className="min-h-0 resize-none bg-background/60"
            />
            <button
              onClick={() => send(draft)}
              disabled={thinking || !draft.trim()}
              aria-label="Send message"
              className="flex size-10 shrink-0 items-center justify-center rounded-md bg-ember text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              <Send className="size-4" />
            </button>
          </div>

          <div className="rounded-lg border border-border">
            <button
              onClick={() => setShowPrompt((v) => !v)}
              className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
            >
              <span className="inline-flex items-center gap-2">
                <Terminal className="size-3.5" /> System prompt
              </span>
              <ChevronDown className={cn("size-4 transition-transform", showPrompt && "rotate-180")} />
            </button>
            {showPrompt && (
              <pre className="overflow-x-auto border-t border-border px-4 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                {chatSystemPrompt}
              </pre>
            )}
          </div>

          <p className="text-[11px] text-ember-soft/80">{DISCLAIMER}</p>
        </div>
      </Panel>
    </div>
  );
}
