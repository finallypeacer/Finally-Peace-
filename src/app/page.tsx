"use client";

import { useEffect, useRef, useState } from "react";
import InstallApp from "./InstallApp";
import { WaitlistCounter, FuneralCostChart, AffordabilityChart } from "@/components/LiveStats";

// The dotLottie player is a custom element registered by the script loaded in
// layout.tsx. Declare it so TSX/JSX accepts <dotlottie-wc>.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "dotlottie-wc": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          speed?: string | number;
          loop?: boolean;
          autoplay?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // ---------- GLOBAL BUBBLES (floating decoration across sections) ----------
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const TARGETS = [
      "hero",
      "stats-bar",
      "problem",
      "easy",
      "compare",
      "voices",
      "how",
      "faq",
      "why",
    ];
    const created: HTMLElement[] = [];

    function spawnBubbles(section: HTMLElement | null, count: number) {
      if (!section) return;
      const cs = getComputedStyle(section);
      if (cs.position === "static") section.style.position = "relative";
      if (!section.style.overflow) section.style.overflow = "hidden";
      for (let i = 0; i < count; i++) {
        const b = document.createElement("span");
        b.className = "global-bubble";
        const size = 6 + Math.random() * 18;
        b.style.width = size + "px";
        b.style.height = size + "px";
        b.style.left = 3 + Math.random() * 94 + "%";
        b.style.top = 3 + Math.random() * 94 + "%";
        b.style.animationDuration = 9 + Math.random() * 8 + "s";
        b.style.animationDelay = Math.random() * 8 + "s";
        const flavor = Math.random();
        if (flavor < 0.55) {
          b.style.background = "var(--blue-400)";
        } else if (flavor < 0.85) {
          b.style.background = "var(--blue-100)";
          b.style.border = "1px solid var(--blue-400)";
        } else {
          b.style.background = "var(--accent)";
        }
        section.appendChild(b);
        created.push(b);
      }
    }

    TARGETS.forEach((sel) => {
      const s =
        (root.querySelector("#" + sel) as HTMLElement | null) ||
        (root.querySelector("." + sel) as HTMLElement | null);
      spawnBubbles(s, 8);
    });
    const cta = root.querySelector(".final-cta") as HTMLElement | null;
    if (cta) spawnBubbles(cta, 10);

    return () => {
      created.forEach((b) => b.remove());
    };
  }, []);

  // ---------- Waitlist form ----------
  function handleWaitlist(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: POST `email` to a waitlist endpoint / CRM.
    setEmail("");
    setJoined(true);
  }

  // ---------- Stripe checkout (single $15/mo subscription) ----------
  async function startCheckout() {
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "quietworld" }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(
          data.error ||
            "Checkout is not configured yet. Please try again shortly.",
        );
        setCheckoutLoading(false);
      }
    } catch {
      alert("Something went wrong starting checkout. Please try again.");
      setCheckoutLoading(false);
    }
  }

  return (
    <div ref={rootRef}>
      {/* ============ NAV ============ */}
      <nav>
        <div className="nav-inner">
          <div className="logo">QuietWorld</div>
          <div className="nav-links">
            <a href="#easy">What you get</a>
            <a href="#plans">The plan</a>
            <a href="#how">How it works</a>
            <a href="#getapp">Get the app</a>
            <a href="#faq">FAQ</a>
            <a href="/app" className="btn btn-nav">
              Open the app
            </a>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-grid">
            <div>
              <div className="hero-pill">
                New · Now accepting Canadian waitlist
              </div>
              <h1>
                $15 a month. <br />
                For <span className="serif">what comes next.</span>
              </h1>
              <p className="hero-sub">
                End-of-life coverage, rebuilt as one simple subscription.
                Funeral, legal, debt, transportation — all included. So your
                family never has to plan a funeral on the worst week of their
                life.
              </p>
              <div className="hero-actions">
                <a href="#plans" className="btn btn-primary btn-lg">
                  See the plans →
                </a>
                <a href="#how" className="btn btn-secondary btn-lg">
                  How it works
                </a>
              </div>
              <div className="hero-trust">
                <span>
                  <span className="check">✓</span>&nbsp; Underwritten by a
                  licensed Canadian carrier
                </span>
                <span>
                  <span className="check">✓</span>&nbsp; Cancel anytime after 12
                  months
                </span>
                <span>
                  <span className="check">✓</span>&nbsp; No medical exam
                </span>
              </div>
            </div>
            <div className="quote-card">
              <div className="quote-label">WHY WE EXIST</div>
              <div className="quote-text">
                &quot;My mother passed and we had seven days to find $14,000 in
                cash. I never want my kids to feel that.&quot;
              </div>
              <div className="quote-attr">
                — What every QuietWorld member eventually tells us.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section className="trust-strip">
        <div className="container">
          <div className="trust-label">
            <span className="dot"></span>Partnered with leading Canadian
            carriers<span className="dot"></span>
          </div>
          <div className="trust-logos">
            <div className="trust-logo">
              <div className="trust-logo-name">Underwriting partner</div>
              <div className="trust-logo-tag">Tier 1 Canadian life carrier</div>
            </div>
            <div className="trust-logo">
              <div className="trust-logo-name">Risk partner</div>
              <div className="trust-logo-tag">Global specialty risk partner</div>
            </div>
            <div className="trust-logo">
              <div className="trust-logo-name">Funeral network</div>
              <div className="trust-logo-tag">100+ Canadian providers</div>
            </div>
            <div className="trust-logo">
              <div className="trust-logo-name">Legal partner</div>
              <div className="trust-logo-tag">Estate &amp; debt specialists</div>
            </div>
          </div>
          <div className="trust-disclaimer">
            All policies are issued by a licensed Canadian carrier.
            Concierge and debt-restructuring services are delivered through
            QuietWorld&apos;s vetted partner network.
          </div>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-num">$15K</div>
              <div className="stat-label">average Canadian funeral cost</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">7&nbsp;days</div>
              <div className="stat-label">
                median time families have to pay
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-num">73%</div>
              <div className="stat-label">
                of Canadians under 50 have no plan
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-num">$2B</div>
              <div className="stat-label">
                Canadian funeral industry, every year
              </div>
            </div>
          </div>
          <div className="stats-charts-row">
            <FuneralCostChart />
            <AffordabilityChart />
          </div>
        </div>
      </section>

      {/* ============ PROBLEM ============ */}
      <section id="problem">
        <div className="container">
          <div className="section-head-center">
            <div className="section-eyebrow">The problem</div>
            <h2 className="section-title">
              Death is a <span className="serif">financial emergency</span>{" "}
              families aren&apos;t ready for.
            </h2>
            <p className="section-sub">
              Final-expense coverage exists. But it&apos;s sold through
              50-year-old agent networks, marketed to seniors only, and
              impossible to understand.
            </p>
          </div>
          <div className="problem-cards">
            <div className="problem-card">
              <h3>Funeral homes charge $9K–$15K — paid in cash, within a week.</h3>
              <p>
                Most families haven&apos;t planned for this. Many take on debt
                or crowdfund grief on social media.
              </p>
            </div>
            <div className="problem-card">
              <h3>
                Existing coverage is built for someone your grandparents&apos;
                age.
              </h3>
              <p>
                Door-to-door agents, paper applications, opaque pricing. Nothing
                that feels designed for someone who pays for their gym on their
                phone.
              </p>
            </div>
            <div className="problem-card">
              <h3>The logistics swallow your family alive.</h3>
              <p>
                Casket selection, repatriation, debt cleanup, the apartment,
                social media, the estate — all while they&apos;re grieving.
              </p>
            </div>
            <div className="problem-card">
              <h3>Younger generations avoid the conversation entirely.</h3>
              <p>
                73% of Canadians under 50 have no plan. Not because they
                don&apos;t care. Because no one made it easy enough to start.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHAT YOU GET FOR $25 ============ */}
      <section id="easy">
        <div className="container">
          <div className="section-head-center">
            <div className="section-eyebrow">What you get for $15/month</div>
            <h2 className="section-title">
              Four things{" "}
              <span className="serif">
                your family will never have to do alone.
              </span>
            </h2>
            <p className="section-sub">
              One subscription. Everything that turns the worst week of your
              family&apos;s life into the easiest one to navigate.
            </p>
          </div>

          <div className="easy-steps">
            <div className="easy-card">
              <div className="easy-num">1</div>
              <svg
                className="easy-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 5h6M10 5v2C8 8 7 10 7 12.5V17a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-4.5C17 10 16 8 14 7V5" />
                <line x1="8" y1="13" x2="16" y2="13" />
              </svg>
              <h3>Funeral, your way</h3>
              <p>
                Cremation, traditional burial, green burial, or aquamation —
                your choice. Casket, transport, service, paperwork — all
                included.
              </p>
            </div>

            <div className="easy-card">
              <div className="easy-num">2</div>
              <svg
                className="easy-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
                <polyline points="15 4 15 9 20 9" />
                <line x1="7" y1="13" x2="14" y2="13" />
                <line x1="7" y1="16" x2="14" y2="16" />
                <line x1="7" y1="10" x2="11" y2="10" />
              </svg>
              <h3>Legal help</h3>
              <p>
                Attorney-prepared will, estate paperwork, power of attorney,
                advance directives. Your family doesn&apos;t open a lawyer&apos;s
                office while grieving.
              </p>
            </div>

            <div className="easy-card">
              <div className="easy-num">3</div>
              <svg
                className="easy-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L4 6v6c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V6l-8-4z" />
                <line x1="9" y1="11" x2="15" y2="11" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
              <h3>Debt navigation</h3>
              <p>
                Your family is connected to specialists who restructure,
                negotiate, and reorganize outstanding obligations — so
                they&apos;re never standing alone against a creditor.
              </p>
            </div>

            <div className="easy-card">
              <div className="easy-num">4</div>
              <svg
                className="easy-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
                <path d="M5 17H3v-5l2-5h13l3 5v5h-2" />
                <line x1="9" y1="17" x2="15" y2="17" />
              </svg>
              <h3>Transportation</h3>
              <p>
                Body transport anywhere in Canada. International repatriation if
                you pass abroad. Family travel covered for distant relatives who
                need to be there.
              </p>
            </div>
          </div>

          <div className="easy-tagline">
            All of this. <strong>$15 a month.</strong> Cancel anytime.
            <br />
            <em>
              One good thing you did for your family — long before they ever
              needed it.
            </em>
          </div>
        </div>
      </section>

      {/* ============ PLAN (single $25 subscription) ============ */}
      <section id="plans">
        <span className="plan-deco plan-deco-1"></span>
        <span className="plan-deco plan-deco-2"></span>
        <span className="plan-deco plan-deco-3"></span>
        <span className="plan-deco plan-deco-4"></span>
        <span className="plan-deco plan-deco-5"></span>
        <span className="plan-deco plan-deco-6"></span>
        <span className="plan-deco plan-deco-7"></span>
        <span className="plan-deco plan-deco-8"></span>
        <span className="plan-deco plan-deco-9"></span>
        <span className="plan-deco plan-deco-10"></span>
        <span className="plan-line plan-line-1"></span>
        <span className="plan-line plan-line-2"></span>

        <dotlottie-wc
          className="plan-lottie plan-lottie-left"
          src="https://lottie.host/4c87a2b4-7c25-4f60-b2c9-7c70f3b67ce4/yvL8jxJZQp.lottie"
          speed="0.6"
          loop
          autoplay
        ></dotlottie-wc>
        <dotlottie-wc
          className="plan-lottie plan-lottie-right"
          src="https://lottie.host/91d7a47e-2bca-4f5f-bb31-7f1f8e22f74d/dgGwhfDXgB.lottie"
          speed="0.6"
          loop
          autoplay
        ></dotlottie-wc>

        <div className="container">
          <div className="section-head-center">
            <div className="section-eyebrow">The plan</div>
            <h2 className="section-title">
              One plan. <span className="serif">$15 a month.</span>
            </h2>
            <p className="section-sub">
              Everything you need so your family never has to plan a funeral on
              the worst week of their life.
            </p>
          </div>

          <div className="single-plan-wrap">
            <div className="single-plan">
              <div className="single-plan-badge">QUIETWORLD SUBSCRIPTION</div>
              <div className="single-plan-price">
                <span className="single-plan-currency">$</span>
                <span className="single-plan-amount">15</span>
                <span className="single-plan-period">/month</span>
              </div>
              <div className="single-plan-tagline">
                Everything below. Cancel anytime. Locked at signup age — for
                life.
              </div>

              <div className="single-plan-grid">
                <div className="single-plan-col">
                  <div className="single-plan-col-title">FUNERAL</div>
                  <ul className="single-plan-list">
                    <li>
                      Choice of cremation, traditional burial, green burial, or
                      aquamation
                    </li>
                    <li>Casket or urn — three styles per type</li>
                    <li>Full service OR direct cremation</li>
                    <li>Live-streamed memorial for distant relatives</li>
                    <li>Obituary in 2 publications</li>
                    <li>10 certified death certificates</li>
                  </ul>
                </div>

                <div className="single-plan-col">
                  <div className="single-plan-col-title">LEGAL</div>
                  <ul className="single-plan-list">
                    <li>Attorney-prepared will</li>
                    <li>Power of attorney + advance directive</li>
                    <li>Estate paperwork &amp; probate guidance</li>
                    <li>Digital legacy management</li>
                    <li>Family beneficiary setup</li>
                  </ul>
                </div>

                <div className="single-plan-col">
                  <div className="single-plan-col-title">DEBT</div>
                  <ul className="single-plan-list">
                    <li>Connection to debt restructuring specialists</li>
                    <li>Negotiation &amp; reorganization support</li>
                    <li>Guidance through outstanding obligations</li>
                    <li>$15,000 cash benefit for family runway</li>
                    <li>Apartment / room cleanout coordination</li>
                  </ul>
                </div>

                <div className="single-plan-col">
                  <div className="single-plan-col-title">TRANSPORT</div>
                  <ul className="single-plan-list">
                    <li>Body transport anywhere in Canada</li>
                    <li>International repatriation if you die abroad</li>
                    <li>Family travel for 2 distant relatives</li>
                    <li>Pall-bearer arrangement</li>
                    <li>Burial plot or scattering location coordination</li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                className="single-plan-cta"
                onClick={startCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading
                  ? "Redirecting…"
                  : "Start your subscription →"}
              </button>

              <div className="single-plan-note">
                Rate locked at your signup age — never increases. No medical
                exam. Cancel anytime.
              </div>
            </div>
          </div>

          <div className="pricing-note">
            <strong>About pricing.</strong> Headline prices apply ages 18–40.
            Above 40, premiums step up by age band — your final rate is set by
            our licensed carrier after a 60-second underwriting questionnaire.
            Family bundle: 10% off when two adults in your household subscribe.
            Lock your current rate for life with a single 12-month upfront
            payment.
          </div>
        </div>
      </section>

      {/* ============ COMPARE ============ */}
      <section id="compare">
        <div className="container">
          <div className="section-head-center">
            <div className="section-eyebrow">Compare</div>
            <h2 className="section-title">
              QuietWorld vs{" "}
              <span className="serif">traditional coverage.</span>
            </h2>
            <p className="section-sub">
              A 50-year-old product, sold the same way for 50 years. We rebuilt
              every piece.
            </p>
          </div>

          <div className="compare-table">
            <div className="compare-row compare-head">
              <div></div>
              <div className="col-old">Traditional final expense</div>
              <div className="col-atlas">QuietWorld</div>
            </div>

            <div className="compare-row">
              <div className="col-label">How you sign up</div>
              <div className="col-old">
                <span className="ic-x">×</span>In-home agent visit, paper
                application
              </div>
              <div className="col-atlas">
                <span className="ic-check">✓</span>8 minutes on your phone
              </div>
            </div>

            <div className="compare-row">
              <div className="col-label">How long until you&apos;re covered</div>
              <div className="col-old">
                <span className="ic-x">×</span>2–4 weeks
              </div>
              <div className="col-atlas">
                <span className="ic-check">✓</span>Minutes — simplified-issue,
                no exam
              </div>
            </div>

            <div className="compare-row">
              <div className="col-label">Pricing transparency</div>
              <div className="col-old">
                <span className="ic-x">×</span>&quot;Call for a quote&quot;
              </div>
              <div className="col-atlas">
                <span className="ic-check">✓</span>One price, $15/mo — no hidden
                fees
              </div>
            </div>

            <div className="compare-row">
              <div className="col-label">When you die, who handles it</div>
              <div className="col-old">
                <span className="ic-x">×</span>Your family — alone, on the worst
                week of their life
              </div>
              <div className="col-atlas">
                <span className="ic-check">✓</span>One QuietWorld concierge,
                end-to-end
              </div>
            </div>

            <div className="compare-row">
              <div className="col-label">Cancellation</div>
              <div className="col-old">
                <span className="ic-x">×</span>Lose what you&apos;ve paid in
              </div>
              <div className="col-atlas">
                <span className="ic-check">✓</span>Cancel anytime after 12
                months
              </div>
            </div>

            <div className="compare-row">
              <div className="col-label">Built for</div>
              <div className="col-old">
                <span className="ic-x">×</span>People 70+
              </div>
              <div className="col-atlas">
                <span className="ic-check">✓</span>You, today, on your phone
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how">
        <div className="container">
          <div className="section-head-center">
            <div className="section-eyebrow">How it works</div>
            <h2 className="section-title">
              Three steps. <span className="serif">Done in minutes.</span>
            </h2>
            <p className="section-sub">
              From signup to a real, licensed coverage plan in your name
              — without a single phone call.
            </p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Sign up</h3>
              <p>
                One $15/month subscription. Everything included. No tier picker,
                no quote forms.
              </p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>Quick quiz</h3>
              <p>
                5 health questions. No medical exam. Simplified-issue
                underwriting handled by our licensed Canadian carrier partner.
              </p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Ready for life — your future is secured</h3>
              <p>
                Real coverage, issued and active. We&apos;re here the day
                your family needs us. Until then — live your life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHY QUIETWORLD ============ */}
      <section id="why">
        <div className="container">
          <div className="section-head-center">
            <div className="section-eyebrow">Why QuietWorld</div>
            <h2 className="section-title">
              Real coverage. <span className="serif">Real service.</span>
            </h2>
            <p className="section-sub">
              Built differently from the inside out — but with a 90-year-old
              product underneath.
            </p>
          </div>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">🛡️</div>
              <h3>Backed by a real carrier</h3>
              <p>
                Your policy is underwritten by a licensed Canadian life
                carrier. Capital reserves, regulator oversight, the
                works. We handle the experience; they handle the underwriting.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">💬</div>
              <h3>Concierge, not a call center</h3>
              <p>
                When your family calls QuietWorld, they get one real person who
                handles everything: funeral home, casket, transport, paperwork,
                even the cleanup of your apartment.
              </p>
            </div>
            <div className="why-card">
              <div className="why-icon">📱</div>
              <h3>Built for who you are now</h3>
              <p>
                Final-expense coverage has been sold the same way for 50 years
                — door-to-door agents and senior TV ads. QuietWorld is the first
                version made for someone who buys things on their phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ VOICES ============ */}
      <section id="voices">
        <div className="container">
          <div className="section-head-center">
            <div className="section-eyebrow">Voices</div>
            <h2 className="section-title">
              From people who{" "}
              <span className="serif">stopped avoiding it.</span>
            </h2>
            <p className="section-sub">
              Early QuietWorld members. Real conversations from our beta — names
              changed where requested.
            </p>
          </div>
          <div className="voices-grid">
            <div className="voice-card">
              <div className="voice-stars">★ ★ ★ ★ ★</div>
              <div className="voice-quote">
                &quot;I&apos;d been putting this off for four years. QuietWorld
                took twelve minutes. I cried a little after I hit submit — not
                because it was sad, just because it was finally done.&quot;
              </div>
              <div className="voice-author">
                <div className="voice-avatar">MR</div>
                <div>
                  <div className="voice-name">Maya R., 42</div>
                  <div className="voice-meta">
                    Toronto · QuietWorld subscriber
                  </div>
                </div>
              </div>
            </div>

            <div className="voice-card">
              <div className="voice-stars">★ ★ ★ ★ ★</div>
              <div className="voice-quote">
                &quot;My dad has early-onset Alzheimer&apos;s. QuietWorld is the
                first product I&apos;ve ever seen that quietly handles the
                things you don&apos;t want to think about.&quot;
              </div>
              <div className="voice-author">
                <div className="voice-avatar">JK</div>
                <div>
                  <div className="voice-name">Jordan K., 38</div>
                  <div className="voice-meta">
                    Vancouver · QuietWorld subscriber
                  </div>
                </div>
              </div>
            </div>

            <div className="voice-card">
              <div className="voice-stars">★ ★ ★ ★ ★</div>
              <div className="voice-quote">
                &quot;I tried to buy final-expense coverage two years ago. A man
                in a suit came to my apartment for two hours. I bought QuietWorld
                in a coffee shop on my phone. That&apos;s the entire pitch.&quot;
              </div>
              <div className="voice-author">
                <div className="voice-avatar">SP</div>
                <div>
                  <div className="voice-name">Sarah P., 51</div>
                  <div className="voice-meta">
                    Calgary · QuietWorld subscriber
                  </div>
                </div>
              </div>
            </div>

            <div className="voice-card">
              <div className="voice-stars">★ ★ ★ ★ ★</div>
              <div className="voice-quote">
                &quot;I&apos;m 56 and just signed up for QuietWorld. I stopped
                thinking of coverage as paperwork and started thinking of it as
                part of my life.&quot;
              </div>
              <div className="voice-author">
                <div className="voice-avatar">DL</div>
                <div>
                  <div className="voice-name">David L., 56</div>
                  <div className="voice-meta">
                    Montréal · QuietWorld subscriber
                  </div>
                </div>
              </div>
            </div>

            <div className="voice-card">
              <div className="voice-stars">★ ★ ★ ★ ★</div>
              <div className="voice-quote">
                &quot;When my mom passed last fall, QuietWorld handled the
                funeral home, the casket, transport from Florida, and the
                apartment cleanout. I made one phone call. They handled the
                rest.&quot;
              </div>
              <div className="voice-author">
                <div className="voice-avatar">AT</div>
                <div>
                  <div className="voice-name">Anna T., 47</div>
                  <div className="voice-meta">
                    Ottawa · Daughter of a QuietWorld subscriber
                  </div>
                </div>
              </div>
            </div>

            <div className="voice-card voice-card-cta">
              <div className="voice-stars">★ ★ ★ ★ ★</div>
              <div className="voice-quote">
                &quot;QuietWorld is the rare product that makes you feel less
                alone.&quot;
              </div>
              <div className="voice-cta-block">
                <a href="#join" className="btn btn-primary">
                  Join the waitlist →
                </a>
                <div className="voice-cta-meta">
                  <WaitlistCounter />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq">
        <div className="container">
          <div className="section-head-center">
            <div className="section-eyebrow">FAQ</div>
            <h2 className="section-title">
              The questions <span className="serif">everyone asks.</span>
            </h2>
          </div>
          <div className="faq-list">
            <details className="faq-item">
              <summary className="faq-q">
                Is this real coverage or just a savings plan??
              </summary>
              <div className="faq-a">
                Real coverage. Every QuietWorld subscription includes a
                licensed coverage plan in your name, issued by a
                regulated Canadian carrier. The subscription wraps the policy
                with our service layer — funeral arrangements, repatriation,
                concierge, AI memorial — but the underlying product is regulated
                final-expense coverage.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-q">What if I cancel?</summary>
              <div className="faq-a">
                12-month minimum commitment. After that, cancel anytime. Your
                policy lapses if you stop paying. You can also lock your current
                rate for life by paying 12 months upfront once.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-q">
                Is there a waiting period before coverage kicks in?
              </summary>
              <div className="faq-a">
                For natural-cause deaths, full benefits pay out after 24 months
                of premium (industry standard for simplified-issue products).
                During the first 24 months, your family receives a pro-rated
                payout. Accidental death is covered in full from day 1.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-q">What if I die outside Canada?</summary>
              <div className="faq-a">
                Yes. International repatriation is included in your $25
                subscription. QuietWorld arranges and pays for transport of your
                body back to your home country, anywhere in the world.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-q">
                What is the AI memorial avatar?
              </summary>
              <div className="faq-a">
                During your time as a subscriber, you can record memories,
                stories, and answers to prompts. We use that material to build a
                private, family-accessible AI avatar — so your grandchildren can
                hear your voice and your stories long after you&apos;re gone.
                Optional and fully under your control.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-q">
                What if I&apos;m already showing memory or cognitive symptoms
                when I sign up?
              </summary>
              <div className="faq-a">
                QuietWorld requires you to be cognitively healthy at the time you
                enroll — this is standard for any final-expense coverage
                product. The 5-question health quiz at signup includes a brief
                cognitive screen.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-q">From what age can I sign up?</summary>
              <div className="faq-a">
                QuietWorld is available from age 18 to 75. Sign up takes 8
                minutes on your phone — no medical exam, just a 5-question health
                questionnaire.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-q">Does pricing change with age?</summary>
              <div className="faq-a">
                Yes. Headline prices ($20 / $80 / $200 / $500) apply ages 18–40.
                Above 40, premiums step up in published age bands: 41–50 (×1.5),
                51–60 (×2.2), 61–70 (×3.5), 71–80 (×5.5). Health adjustments are
                on top: Preferred (non-smoker, healthy) gets −10%,
                smokers/controlled conditions get +40%. Lock your rate band for
                life with a one-time 12-month upfront payment.
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-q">
                If I sign up young, does my price go up as I age?
              </summary>
              <div className="faq-a">
                No. Your rate band is set at signup and frozen for life — even
                when you cross into a higher age band years later. A 32-year-old
                who signs up today will pay the 32-year-old rate at 65. This is
                the single biggest reason to start now: the carrier locks your
                mortality risk at today&apos;s number.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* ============ GET THE APP (PWA) ============ */}
      <section id="getapp">
        <div className="container">
          <div className="getapp-grid">
            <div>
              <div className="section-eyebrow">The app</div>
              <h2>
                Carry QuietWorld <span className="serif">in your pocket.</span>
              </h2>
              <p className="getapp-sub">
                Install the QuietWorld app on your phone or desktop in one tap.
                Manage your subscription, store your wishes, and give your family
                one number to call — all from your home screen.
              </p>
              <ul className="getapp-features">
                <li>Installs straight to your home screen — no app store</li>
                <li>Opens full-screen, like a native app</li>
                <li>Works on iPhone, Android, and desktop</li>
                <li>Always up to date — nothing to update manually</li>
              </ul>
              <InstallApp />
              <a href="/app" className="getapp-open-link">
                Or open the app in your browser →
              </a>
            </div>

            <div className="getapp-visual">
              <div className="phone">
                <div className="phone-screen">
                  <div className="phone-logo">QW</div>
                  <div className="phone-title">QuietWorld</div>
                  <div className="phone-tag">For what comes next.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section id="join" className="final-cta">
        <div className="container">
          <h2>
            Join the QuietWorld <span className="serif">waitlist.</span>
          </h2>
          <p>
            We&apos;re launching in Ontario first. Early members get locked-in
            founder pricing and influence the product before launch.
          </p>
          <form className="signup-form" onSubmit={handleWaitlist}>
            <input
              type="email"
              placeholder="you@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">
              {joined ? "✓ You're on the list" : "Join the waitlist"}
            </button>
          </form>
          <div className="cta-trust" style={{ marginBottom: "16px" }}>
            No spam. We email you twice — once when we launch, once if you ask.
          </div>
          <WaitlistCounter />
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer>
        <div className="container">
          <div>© 2026 QuietWorld Services Inc. · Toronto, Canada</div>
          <div className="foot-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Disclosure</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
