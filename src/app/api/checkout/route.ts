import { NextResponse } from "next/server";
import Stripe from "stripe";

// POST /api/checkout
// Creates a Stripe Checkout session for the single Finally Peace $25/mo
// subscription and returns the hosted-checkout URL for the client to redirect to.
//
// Required environment variables (set in .env.local and in Vercel):
//   STRIPE_SECRET_KEY   — your Stripe secret key (sk_live_… / sk_test_…)
//   STRIPE_PRICE_ID     — the recurring Price ID for the $25/mo plan (price_…)
//   NEXT_PUBLIC_SITE_URL (optional) — canonical site URL for success/cancel
//                          redirects; falls back to the request origin.

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!secretKey) {
    return NextResponse.json(
      { error: "Payments are not configured yet (missing STRIPE_SECRET_KEY)." },
      { status: 503 },
    );
  }

  const stripe = new Stripe(secretKey);

  // Resolve the base URL for redirects.
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.headers.get("origin") ||
    new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              // Fallback so checkout works before a Price is created in
              // Stripe. Once you have a real Price ID, set STRIPE_PRICE_ID.
              quantity: 1,
              price_data: {
                currency: "cad",
                recurring: { interval: "month" },
                unit_amount: 2500, // $25.00 CAD
                product_data: {
                  name: "Finally Peace Subscription",
                  description:
                    "End-of-life planning subscription — funeral, transportation, and legal documents, saved in your secure profile.",
                },
              },
            },
      ],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled#plans`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
