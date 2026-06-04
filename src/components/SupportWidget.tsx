"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "What's included in the $15/month plan?",
  "How do I sign up?",
  "Is there a waiting period?",
  "Can I cancel anytime?",
];

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to latest message
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  async function send(text: string) {
    const userMsg = text.trim();
    if (!userMsg || loading) return;

    const next: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(next);
    setInput("");
    setLoading(true);

    // Placeholder for the streaming response
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Support unavailable right now." }));
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: (err as { error: string }).error },
        ]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: accumulated },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  const showSuggested = messages.length === 0;

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="sw-panel" role="dialog" aria-label="Support chat">
          <div className="sw-panel-head">
            <div className="sw-panel-title">
              <span className="sw-panel-dot" />
              Support
            </div>
            <button
              className="sw-panel-close"
              onClick={() => setOpen(false)}
              aria-label="Close support"
            >
              &times;
            </button>
          </div>

          <div className="sw-messages">
            {/* Welcome message */}
            <div className="sw-msg sw-msg-assistant">
              <div className="sw-bubble">
                Hi there! I&apos;m here to help with any questions about
                Finally Peace or to help you navigate the site.
              </div>
            </div>

            {messages.map((m, i) => (
              <div
                key={i}
                className={`sw-msg ${m.role === "user" ? "sw-msg-user" : "sw-msg-assistant"}`}
              >
                <div className="sw-bubble">
                  {m.content ||
                    (loading && i === messages.length - 1 ? (
                      <span className="sw-typing">
                        <span />
                        <span />
                        <span />
                      </span>
                    ) : (
                      "…"
                    ))}
                </div>
              </div>
            ))}

            {/* Suggested questions */}
            {showSuggested && (
              <div className="sw-suggested">
                {SUGGESTED.map((q) => (
                  <button key={q} onClick={() => send(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form className="sw-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask a question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send">
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        className={`sw-fab ${open ? "sw-fab-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close support" : "Open support"}
      >
        {open ? (
          <span className="sw-fab-icon">&times;</span>
        ) : (
          <>
            <svg className="sw-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span className="sw-fab-label">Support</span>
          </>
        )}
      </button>
    </>
  );
}
