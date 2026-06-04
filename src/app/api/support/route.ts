import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

function cannedReply(q: string): string {
  if (/price|cost|how much|\$15|15.?month|pricing/i.test(q))
    return "QuietWorld is $15/month — one flat price, no hidden fees, no tiers. Your rate is locked at your signup age and never increases, even as you get older.";
  if (/what.*includ|what.*get|cover|benefit|plan/i.test(q))
    return "Your $15/month subscription covers everything: funeral arrangements (cremation, burial, or aquamation), legal help (will, POA, estate paperwork), debt navigation ($15,000 family runway + specialists), and body transportation anywhere in Canada including international repatriation.";
  if (/cancel|quit|stop|leave/i.test(q))
    return "There's a 12-month minimum commitment, then you can cancel anytime. Your coverage simply lapses if you stop paying — no penalties.";
  if (/wait|period|when.*cover|24 month|day 1/i.test(q))
    return "Accidental death is covered from day 1. For natural causes, full benefits pay out after 24 months of premiums — that's standard for simplified-issue products. During the first 24 months your family receives a pro-rated payout.";
  if (/sign.?up|join|start|how.*work|enroll|register/i.test(q))
    return "Signing up takes about 8 minutes on your phone — no medical exam, just a 5-question health questionnaire. Tap the Start your subscription button on the plan card, or join the waitlist at the bottom of the page. We're launching in Ontario first.";
  if (/age|old|young|18|75/i.test(q))
    return "QuietWorld is available from age 18 to 75. The earlier you join, the lower your locked-in rate — a 30-year-old who signs up today keeps that rate at 65.";
  if (/exam|medical|health|doctor/i.test(q))
    return "No medical exam required — just a quick 5-question health questionnaire at signup. Most people are approved instantly.";
  if (/funeral|cremation|burial|casket|service/i.test(q))
    return "Your subscription covers the full funeral: cremation, traditional burial, green burial, or aquamation — your choice. Casket or urn, live-streamed memorial, obituary in 2 publications, and 10 certified death certificates are all included.";
  if (/legal|will|poa|estate|power of attorney/i.test(q))
    return "Legal help is fully included: an attorney-prepared will, power of attorney, advance directive, estate paperwork & probate guidance, digital legacy management, and family beneficiary setup.";
  if (/debt|money|cash|benefit|family runway/i.test(q))
    return "The debt navigation benefit connects your family to specialists who restructure and negotiate outstanding obligations — plus a $15,000 cash benefit for family runway and apartment/room cleanout coordination.";
  if (/transport|repatri|abroad|travel|body/i.test(q))
    return "Body transport is included anywhere in Canada. If you pass abroad, international repatriation is covered. Family travel for 2 distant relatives and pall-bearer arrangement are also included.";
  if (/app|dashboard|download|install|phone/i.test(q))
    return "You can install QuietWorld directly to your home screen — no app store needed. Tap the Get the app button in the menu and follow the steps. Once installed, it opens full-screen like a native app with your personal dashboard.";
  if (/real|legit|trust|carrier|underwr/i.test(q))
    return "QuietWorld subscriptions are underwritten by a licensed Canadian carrier with full capital reserves and regulatory oversight. We handle the experience; they handle the underwriting.";
  if (/ontario|canada|province|where/i.test(q))
    return "We're launching in Ontario first, then expanding across Canada. Join the waitlist to get founder pricing and early access.";
  if (/hello|hi|hey|help|support/i.test(q))
    return "Hi there! I'm here to help with any questions about QuietWorld. Ask me about what's covered, how to sign up, pricing, or anything else — or scroll up to read the FAQ.";
  return "Great question! For the most accurate answer, I'd suggest checking our FAQ section on this page, or join the waitlist at the bottom and our team will reach out personally. Is there anything else I can help with?";
}

const SYSTEM_PROMPT = `You are the QuietWorld Support assistant. You help visitors understand the QuietWorld subscription, navigate the website, and answer questions.

About QuietWorld:
- QuietWorld is a $15/month subscription that covers end-of-life needs for Canadians
- One flat price — no tiers, no hidden fees, no medical exam required
- Launching in Ontario first; currently accepting a Canadian waitlist
- Rate is locked at signup age and never increases

What's included in the $15/month subscription:
FUNERAL: Choice of cremation, traditional burial, green burial, or aquamation. Casket or urn (3 styles per type). Full service OR direct cremation. Live-streamed memorial. Obituary in 2 publications. 10 certified death certificates.
LEGAL: Attorney-prepared will. Power of attorney + advance directive. Estate paperwork & probate guidance. Digital legacy management. Family beneficiary setup.
DEBT: Connection to debt restructuring specialists. Negotiation & reorganization support. Guidance through outstanding obligations. $15,000 cash benefit for family runway. Apartment/room cleanout coordination.
TRANSPORT: Body transport anywhere in Canada. International repatriation if you die abroad. Family travel for 2 distant relatives. Pall-bearer arrangement. Burial plot or scattering location coordination.

Key facts:
- No medical exam required — just a 5-question health questionnaire
- 12-month minimum commitment, then cancel anytime
- Accidental death covered from day 1; natural causes after 24 months of premiums
- Family bundle: 10% off when two adults in the same household subscribe
- Available ages 18–75
- Signup takes about 8 minutes on your phone

Website navigation:
- "What you get" section — the 4 main benefits (funeral, legal, debt, transport)
- "The plan" section — the $15/month plan card with full feature list
- "How it works" — 3-step signup process
- "Why QuietWorld" — what makes it different
- "FAQ" — common questions answered
- "Get the app" — install the QuietWorld PWA to your home screen
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
