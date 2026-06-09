"use client";
import { useState } from "react";
import "./subscribe.css";

type Step = 1 | 2 | 3;

export default function SubscribePage() {
  const [step, setStep] = useState<Step>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male"|"female"|"">("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [postal, setPostal] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "finally-peace", email, name: firstName + " " + lastName, firstName, lastName, age, phone, address, postal, city }),
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
      </div>

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
              <div className="sub-row-2">
                <label className="sub-label">
                  First name
                  <input className="sub-input" type="text" placeholder="Sarah" value={firstName} onChange={e => setFirstName(e.target.value)} autoFocus />
                </label>
                <label className="sub-label">
                  Last name
                  <input className="sub-input" type="text" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} />
                </label>
              </div>
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
            </div>
            <button className="sub-btn" disabled={!firstName || !lastName || !age || !gender || !email || !address || !postal} onClick={() => setStep(2)}>
              Continue →
            </button>
            <p className="sub-fine">No spam. We email you once when it&apos;s your turn.</p>
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
                  "$15,000 family runway + debt navigation",
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
                <span>Name</span><strong>{firstName} {lastName}</strong>
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
