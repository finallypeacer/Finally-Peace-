import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

function cannedReply(q: string): string {
  const t = q.toLowerCase().trim();

  // Greetings — broad match including typos like "heelo", "helo", "sup"
  if (/^(h+e+l+o*|hi+|hey+|sup|yo|good\s*(morning|afternoon|evening)|howdy|hiya|greet|hello)/i.test(t) || t.length < 6)
    return "Hi! Happy to help. You can ask me anything about Finally Peace — what's covered, how to sign up, pricing, cancellation, or how to install the app. What's on your mind?";

  if (/price|cost|how much|\$15|15.?month|pricing|cheap|afford|fee/i.test(t))
    return "Finally Peace is $15/month — one flat price, no hidden fees, no tiers. Your rate is locked at your signup age and never increases, even as you get older.";
  if (/what.*includ|what.*get|what.*cover|benefit|plan|everything/i.test(t))
    return "Your $15/month subscription covers everything: funeral arrangements (cremation, burial, or aquamation), legal preferences (will, POA, estate paperwork), body transportation worldwide including international repatriation, and a secure profile where you customize and save every choice.";
  if (/cancel|quit|stop|leave|refund/i.test(t))
    return "You can cancel anytime — no commitment, no penalties. Your coverage simply lapses if you stop paying, and you can rejoin whenever you're ready.";
  if (/wait|period|when.*cover|24 month|day 1|immediate|instant/i.test(t))
    return "Accidental death is covered from day 1. For natural causes, full benefits pay out after 24 months of premiums. During the first 24 months your family receives a pro-rated payout.";
  if (/sign.?up|join|start|how.*work|enroll|register|begin|get started/i.test(t))
    return "Signing up takes about 8 minutes on your phone — no medical exam, just a 5-question health questionnaire. Tap the Start your subscription button on the plan card, or join the waitlist at the bottom of the page. We're launching soon.";
  if (/age|old|young|18|75|eligib/i.test(t))
    return "Finally Peace is available from age 18 to 75. The earlier you join, the lower your locked-in rate — a 30-year-old who signs up today keeps that rate at 65.";
  if (/exam|medical|health question|doctor|test/i.test(t))
    return "No medical exam required — just a quick 5-question health questionnaire at signup. Most people are approved instantly.";
  if (/funeral|cremation|burial|casket|service|ceremony/i.test(t))
    return "Your subscription covers the full funeral: cremation, traditional burial, green burial, or aquamation — your choice. Casket or urn, live-streamed memorial, obituary in 2 publications, and 10 certified death certificates are all included.";
  if (/legal|will|poa|estate|power of attorney|probate/i.test(t))
    return "Legal preferences are fully included: an attorney-prepared will, power of attorney, advance directive, estate paperwork & probate guidance, digital legacy management, and family beneficiary setup.";
  if (/profile|customi[sz]e|save|wishes|preferences|secure|account/i.test(t))
    return "Your secure profile is where you customize and save every choice — your funeral preferences, transportation, and legal preferences — all private, encrypted, and ready the moment your family needs them.";
  if (/transport|repatri|abroad|travel|body|move|ship/i.test(t))
    return "Body transport is included worldwide. If you pass abroad, international repatriation is covered. Family travel for 2 distant relatives and pall-bearer arrangement are also included.";
  if (/app|dashboard|download|install|phone|home screen|pwa/i.test(t))
    return "You can install Finally Peace directly to your home screen — no app store needed. Tap Get the app in the menu and follow the steps. Once installed it opens full-screen like a native app with your personal dashboard.";
  if (/real|legit|trust|carrier|underwr|licensed|safe|scam/i.test(t))
    return "Finally Peace subscriptions are underwritten by a world-class licensed carrier with full capital reserves and regulatory oversight. We handle the experience; they handle the underwriting.";
  if (/ontario|canada|province|where|location|available|launch/i.test(t))
    return "We're launching soon, then expanding globally. Join the waitlist to get founder pricing and early access.";
  if (/family|spouse|couple|partner|children|parent/i.test(t))
    return "You can subscribe individually or as a couple — two adults in the same household get 10% off. Your family is notified and connected to a Finally Peace concierge the day they need us.";
  if (/concierge|contact|call|phone number|support|help/i.test(t))
    return "Your family gets one dedicated Finally Peace concierge who handles everything — funeral home, casket, transport, paperwork, even the apartment cleanout. One call, everything handled.";

  // Warm, helpful fallback — not a dead end
  return "Thanks for reaching out! I can answer questions about our $15/month plan, what's covered, how to sign up, cancellation, and more. Could you tell me a bit more about what you'd like to know?";
}

const SYSTEM_PROMPT = `You are the Finally Peace Support assistant. You help visitors understand the Finally Peace subscription, navigate the website, and answer questions.

About Finally Peace:
- Finally Peace is a $15/month subscription for end-of-life planning, with a community and a secure profile to customize and save every choice
- One flat price — no tiers, no hidden fees, no medical exam required
- Launching in Ontario first; currently accepting members worldwide
- Rate is locked at signup age and never increases

What's included in the $15/month subscription:
FUNERAL: Choice of cremation, traditional burial, green burial, or aquamation. Casket or urn (3 styles per type). Full service OR direct cremation. Live-streamed memorial. Obituary in 2 publications. 10 certified death certificates.
LEGAL: Attorney-prepared will. Power of attorney + advance directive. Estate paperwork & probate guidance. Digital legacy management. Family beneficiary setup.
SECURE PROFILE: Customize your funeral your way. Save transportation preferences. Store legal preferences securely. Private & encrypted on your account. Ready the moment family needs it.
TRANSPORT: Body transport worldwide. International repatriation if you die abroad. Family travel for 2 distant relatives. Pall-bearer arrangement. Burial plot or scattering location coordination.

Key facts:
- No medical exam required — just a 5-question health questionnaire
- Cancel anytime — no commitment, no penalties
- Accidental death covered from day 1; natural causes after 24 months of premiums
- Family bundle: 10% off when two adults in the same household subscribe
- Available ages 18–75
- Signup takes about 8 minutes on your phone

Website navigation:
- "What you get" section — the 4 main benefits (funeral, legal, secure profile, transport)
- "The plan" section — the $15/month plan card with full feature list
- "How it works" — 3-step signup process
- "Why Finally Peace" — what makes it different
- "FAQ" — common questions answered
- "Get the app" — install the Finally Peace PWA to your home screen
- "/app" — the member dashboard (track health habits, view coverage, contact concierge)
- The "Join the waitlist" form at the bottom of the page

Guidelines:
- Be warm, clear, and reassuring — this is a sensitive topic
- Never use the word "insurance" — say "coverage" or "subscription" instead
- Keep answers concise, 2–4 sentences max unless the question needs more detail
- If someone asks to sign up or start, direct them to the "Start your subscription" button or the waitlist form
- If someone asks something you don't know, say "I don't have that detail right now — please use the contact form or join the waitlist and our team will reach out"
- Never make up prices, legal claims, or coverage details not listed above
- You are called "Support" — never refer to yourself as an AI or mention Claude or Anthropic`;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // No API key — fall back to smart canned answers so demo works out of the box
  if (!apiKey) {
    let messages: { role: "user" | "assistant"; content: string }[];
    try {
      const body = await request.json();
      messages = body.messages;
      if (!Array.isArray(messages) || messages.length === 0) throw new Error();
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const lastUser = messages.filter((m) => m.role === "user").pop()?.content?.toLowerCase() ?? "";
    const reply = cannedReply(lastUser);
    const encoder = new TextEncoder();
    // Simulate a slight streaming delay for realism
    const stream = new ReadableStream({
      async start(controller) {
        // drip the reply word-by-word so it feels live
        const words = reply.split(" ");
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "));
          await new Promise((r) => setTimeout(r, 28));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  let messages: { role: "user" | "assistant"; content: string }[];
  try {
    const body = await request.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  // Stream the response back as plain text chunks
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          system: SYSTEM_PROMPT,
          messages,
        });

        for await (const chunk of response) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Something went wrong.";
        controller.enqueue(encoder.encode(`\n\n[Support unavailable: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
