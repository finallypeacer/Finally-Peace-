"use client";
import { useState } from "react";
import "./subscribe.css";

type Step = 1 | 2 | 3;

const COUNTRIES = [
  "United States","Canada","United Kingdom","Australia","Ireland","New Zealand",
  "Germany","France","Netherlands","Belgium","Switzerland","Austria","Spain",
  "Portugal","Italy","Sweden","Norway","Denmark","Finland","Iceland","Poland",
  "Czech Republic","Greece","Hungary","Romania","Croatia","Mexico","Brazil",
  "Argentina","Chile","Colombia","Peru","India","Pakistan","Bangladesh",
  "Philippines","Singapore","Malaysia","Indonesia","Thailand","Vietnam",
  "Japan","South Korea","China","Hong Kong","United Arab Emirates","Saudi Arabia",
  "Qatar","Kuwait","Israel","Turkey","South Africa","Nigeria","Kenya","Ghana",
  "Egypt","Morocco",
];

export default function SubscribePage() {
  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male"|"female"|"">("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [postal, setPostal] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    const payload = { plan: "finally-peace", email, name: fullName, age, gender, phone, address, postal, city, country };

    // 1) Save the signup to our records (non-blocking — never stops the flow).
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch { /* logged server-side; don't block the user */ }

    // 2) Proceed to checkout if configured, else confirm the waitlist spot.
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setDone(true); // waitlist fallback
        setLoading(false);
      }
    } catch {
      setDone(true);
      setLoading(false);
    }
  }

  if (done) return (
    <div className="sub-wrap">
      <div className="sub-done">
        <div className="sub-done-icon">✓</div>
        <h2>You&apos;re on the list!</h2>
        <p>We&apos;ll email you at <strong>{email}</strong> when it&apos;s your turn.<br/>Welcome to Finally Peace.</p>
        <a href="/" className="sub-btn">Back to home</a>
      </div>
    </div>
  );

  return (
    <div className="sub-wrap">
      {/* Header */}
      <div className="sub-header">
        <a href="/" className="sub-logo">
          <svg viewBox="0 0 86 52" width="70" height="38" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ng2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#1d4ed8"/>
              </linearGradient>
            </defs>
            <ellipse cx="21" cy="26" rx="17" ry="13" fill="none" stroke="url(#ng2)" strokeWidth="6" strokeLinecap="round"/>
            <ellipse cx="55" cy="26" rx="17" ry="13" fill="none" stroke="url(#ng2)" strokeWidth="6" strokeLinecap="round"/>
            <line x1="38" y1="10" x2="38" y2="42" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" transform="rotate(-35,38,26)"/>
            <path d="M38,6 Q40,12 38,18 Q36,12 38,6" fill="#93c5fd" transform="rotate(-35,38,26)"/>
          </svg>
          <span className="sub-logo-name">Finally Peace</span>
        </a>

        {/* Menu button */}
        <button className="sub-menu-btn" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>

        {/* Menu dropdown */}
        {menuOpen && (
          <div className="sub-menu-dropdown">
            <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="/#easy" onClick={() => setMenuOpen(false)}>What you get</a>
            <a href="/#plans" onClick={() => setMenuOpen(false)}>The plan</a>
            <a href="/#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="/#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <a href="/app" onClick={() => setMenuOpen(false)}>Open the app</a>
          </div>
        )}
      </div>

      {/* Menu overlay (click outside to close) */}
      {menuOpen && <div className="sub-menu-overlay" onClick={() => setMenuOpen(false)} />}

      {/* Progress */}
      <div className="sub-progress">
        {[1,2,3].map(n => (
          <div key={n} className={`sub-step-dot ${step >= n ? "active" : ""} ${step > n ? "done" : ""}`}>
            {step > n ? "✓" : n}
          </div>
        ))}
        <div className="sub-progress-line" style={{width: `${((step-1)/2)*100}%`}} />
      </div>

      <div className="sub-card">

        {/* Step 1 - Who are you */}
        {step === 1 && (
          <>
            <div className="sub-eyebrow">Step 1 of 3</div>
            <h1 className="sub-title">Let&apos;s get started</h1>
            <p className="sub-sub">No medical exam. No agent visit. Just you and 3 quick steps.</p>
            <div className="sub-fields">
              <label className="sub-label">
                Full name
                <input className="sub-input" type="text" placeholder="Sarah Smith" value={fullName} onChange={e => setFullName(e.target.value)} autoFocus />
              </label>
              <div className="sub-row-2">
                <label className="sub-label">
                  Age
                  <input className="sub-input" type="number" placeholder="35" min="18" max="85" value={age} onChange={e => setAge(e.target.value)} />
                </label>
                <label className="sub-label">
                  Phone number
                  <input className="sub-input" type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
                </label>
              </div>
              <div className="sub-gender-row">
                <span className="sub-label-text">Gender</span>
                <div className="sub-gender-btns">
                  <button type="button" className={`sub-gender-btn ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>
                    ♂ Male
                  </button>
                  <button type="button" className={`sub-gender-btn ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>
                    ♀ Female
                  </button>
                </div>
              </div>
              <label className="sub-label">
                Email address
                <input className="sub-input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </label>
              <label className="sub-label">
                Street address
                <input className="sub-input" type="text" placeholder="123 Main St" value={address} onChange={e => setAddress(e.target.value)} />
              </label>
              <div className="sub-row-2">
                <label className="sub-label">
                  City
                  <input className="sub-input" type="text" placeholder="Toronto" value={city} onChange={e => setCity(e.target.value)} />
                </label>
                <label className="sub-label">
                  Postal / ZIP
                  <input className="sub-input" type="text" placeholder="M5V 2T6" value={postal} onChange={e => setPostal(e.target.value)} />
                </label>
              </div>
              <label className="sub-label">
                Country
                <input className="sub-input" type="text" placeholder="Start typing…" value={country} onChange={e => setCountry(e.target.value)} list="country-list" autoComplete="country-name" />
                <datalist id="country-list">
                  {COUNTRIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </label>
            </div>
            <button className="sub-btn" disabled={!fullName || !age || !gender || !email || !address || !postal || !country} onClick={() => setStep(2)}>
              Continue →
            </button>

            {/* Data / privacy notice */}
            <div className="sub-privacy">
              <span className="sub-privacy-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </span>
              <div className="sub-privacy-text">
                <strong>Your information is protected.</strong>
                We securely store the details you provide — your name, contact
                details, age, and location — solely to confirm eligibility, reserve
                your place, and contact you about your coverage. Handled under strict
                confidentiality and never sold or shared with third parties.
              </div>
            </div>
            <p className="sub-fine">No spam — we&apos;ll only reach out about your membership.</p>
          </>
        )}

        {/* Step 2 - The plan */}
        {step === 2 && (
          <>
            <div className="sub-eyebrow">Step 2 of 3</div>
            <h1 className="sub-title">One plan. Everything included.</h1>
            <p className="sub-sub">Rate locked at your age today - forever.</p>

            <div className="sub-plan-card">
              <div className="sub-plan-badge">FINALLY PEACE SUBSCRIPTION</div>
              <div className="sub-plan-price">
                <span className="sub-cur">$</span>
                <span className="sub-amt">15</span>
                <span className="sub-per">/month</span>
              </div>
              <div className="sub-plan-features">
                {[
                  "Funeral - your way (cremation, burial, aquamation)",
                  "Attorney-prepared will + estate paperwork",
                  "Secure profile to customize & save your choices",
                  "Body transport worldwide + repatriation",
                  "Live-streamed memorial + 2 obituaries",
                  "24/7 dedicated concierge - one call handles all",
                ].map(f => (
                  <div key={f} className="sub-feature">
                    <span className="sub-check">✓</span> {f}
                  </div>
                ))}
              </div>
              <div className="sub-plan-note">No medical exam · Cancel anytime after 12 months · Rate locked for life</div>
            </div>

            <div className="sub-btn-row">
              <button className="sub-btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="sub-btn" onClick={() => setStep(3)}>This is my plan →</button>
            </div>
          </>
        )}

        {/* Step 3 - Confirm */}
        {step === 3 && (
          <>
            <div className="sub-eyebrow">Step 3 of 3</div>
            <h1 className="sub-title">Confirm &amp; start</h1>
            <p className="sub-sub">Review your details then hit start - takes 30 seconds.</p>

            <div className="sub-summary">
              <div className="sub-summary-row">
                <span>Name</span><strong>{fullName}</strong>
              </div>
              <div className="sub-summary-row">
                <span>Age</span><strong>{age}</strong>
              </div>
              <div className="sub-summary-row">
                <span>Phone</span><strong>{phone}</strong>
              </div>
              <div className="sub-summary-row">
                <span>Email</span><strong>{email}</strong>
              </div>
              <div className="sub-summary-row">
                <span>Plan</span><strong>Finally Peace · $15/mo</strong>
              </div>
              <div className="sub-summary-row">
                <span>Address</span><strong>{address}{city ? ', ' + city : ''}</strong>
              </div>
              <div className="sub-summary-row">
                <span>Postal code</span><strong>{postal}</strong>
              </div>
              <div className="sub-summary-row">
                <span>Country</span><strong>{country}</strong>
              </div>
              <div className="sub-summary-row">
                <span>Rate</span><strong>Locked at your age today - forever</strong>
              </div>
            </div>

            <button className="sub-btn sub-btn-big" onClick={handleCheckout} disabled={loading}>
              {loading ? "Redirecting to payment…" : "Start my subscription →"}
            </button>
            <div className="sub-btn-row" style={{marginTop:"12px"}}>
              <button className="sub-btn-ghost" onClick={() => setStep(2)}>← Back</button>
            </div>
            <p className="sub-fine">You&apos;ll be redirected to our secure payment page. Your rate is locked the moment you subscribe.</p>
          </>
        )}

      </div>

      <div className="sub-trust">
        <span>✓ No medical exam</span>
        <span>✓ Cancel anytime after 12 months</span>
        <span>✓ Rate locked for life</span>
      </div>
    </div>
  );
}
