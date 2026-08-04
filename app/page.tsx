"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useState } from "react";

const WA_HREF =
  "https://wa.me/27827900255?text=Hi%20Ewan%2C%20I%27d%20like%20to%20book%20the%20free%2015-minute%20audit.";
const EMAIL_HREF = "mailto:ewan@growmaticsa.com";

const heroTicks = [
  { title: "Founder-run", sub: "You deal with me, Ewan — directly" },
  { title: "Nothing to install", sub: "Works with the tools you already use" },
  { title: "POPIA-safe", sub: "Your data never leaves your systems" },
  { title: "Free 15-min audit", sub: "See your number before you pay a cent" },
];

const trust = [
  { n: "15 min", label: "All the audit takes" },
  { n: "R0", label: "To find your number" },
  { n: "0", label: "Software to install" },
  { n: "1", label: "Person on the job — me" },
];

const problems = [
  {
    n: "01",
    title: "Silence is not a no",
    body: "The customer got busy, compared prices, or simply forgot. Without a nudge the quote sits there, and eventually someone else does the job.",
  },
  {
    n: "02",
    title: "You are on the tools",
    body: "You are the owner and the estimator. At five o'clock you go home, and the follow-up that would have won the work never happens.",
  },
  {
    n: "03",
    title: "Nothing tracks a quiet quote",
    body: "Your invoices are tracked. Your jobs are tracked. The quote that never became an invoice is tracked by nobody, and quiet looks the same as lost.",
  },
];

const steps = [
  {
    n: "1",
    title: "Book a time",
    body: "A WhatsApp message and a slot that fits around your day. Fifteen minutes, nothing more committed than that.",
  },
  {
    n: "2",
    title: "Meet on WhatsApp video",
    body: "No new software and no meeting links to work out. The tool you already use all day.",
  },
  {
    n: "3",
    title: "Share your screen",
    body: "You open your own quotes — email, a spreadsheet, your accounting system. I watch and take notes.",
  },
  {
    n: "4",
    title: "Get your real number",
    body: "By the end you know what is genuinely sitting in unanswered quotes. Nothing leaves your machine to get it.",
  },
];

const stats = [
  { n: "48%", label: "of salespeople never make a single follow-up after first contact." },
  { n: "80%", label: "of deals that close need five or more follow-ups to get there." },
  { n: "2%", label: "of sales happen on first contact — the rest come from following up." },
  { n: "63%", label: "of buyers not ready at first still buy later, if someone stays in touch." },
];

const popia = [
  "The audit is done over WhatsApp video with you sharing your screen — your quote records, customer details and prices stay on your machine.",
  "I do not ask you to upload a database or hand over any logins.",
  "Anything you share is used only to give you your number, kept in line with POPIA, and never passed to anyone else.",
];

function fmt(n: number) {
  return "R" + Math.round(n).toLocaleString("en-ZA").replace(/[, ]/g, " ");
}

function pctOf(v: number, min: number, max: number) {
  return (((v - min) / (max - min)) * 100).toFixed(1) + "%";
}

function useCalculator() {
  const [quotes, setQuotes] = useState(18);
  const [avg, setAvg] = useState(24000);
  const [pct, setPct] = useState(32);
  const [displayed, setDisplayed] = useState(0);
  const displayedRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const setDisplayedBoth = (v: number) => {
    displayedRef.current = v;
    setDisplayed(v);
  };

  const animateTo = (dest: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = displayedRef.current;
    const t0 = performance.now();
    const dur = 420;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplayedBoth(start + (dest - start) * e);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    animateTo(quotes * avg * (pct / 100) * 12);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key: "quotes" | "avg" | "pct", raw: string) => {
    let v = parseInt(raw, 10);
    if (isNaN(v)) v = 0;
    const next = { quotes, avg, pct, [key]: v };
    if (key === "quotes") setQuotes(v);
    if (key === "avg") setAvg(v);
    if (key === "pct") setPct(v);
    animateTo(next.quotes * next.avg * (next.pct / 100) * 12);
  };

  return {
    quotes,
    avg,
    pct,
    avgText: fmt(avg),
    quotesP: pctOf(quotes, 2, 120),
    avgP: pctOf(avg, 2000, 250000),
    pctP: pctOf(pct, 0, 100),
    figure: fmt(displayed),
    monthly: fmt(displayed / 12),
    onQuotes: (e: React.ChangeEvent<HTMLInputElement>) => set("quotes", e.target.value),
    onAvg: (e: React.ChangeEvent<HTMLInputElement>) => set("avg", e.target.value),
    onPct: (e: React.ChangeEvent<HTMLInputElement>) => set("pct", e.target.value),
  };
}

export default function LandingPage() {
  const calc = useCalculator();

  return (
    <div
      style={{
        margin: 0,
        background: "#08090c",
        color: "#eef1f5",
        fontFamily: "var(--font-manrope), system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
        overflowX: "hidden",
      }}
    >
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
          scroll-padding-top: 88px;
        }
        ::selection {
          background: #45e08a;
          color: #05130a;
        }
        .growmatic-landing input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 5px;
          border-radius: 999px;
          background: linear-gradient(90deg, #45e08a var(--p, 50%), #20242c var(--p, 50%));
          outline: none;
        }
        .growmatic-landing input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #0d0f14;
          border: 2px solid #45e08a;
          box-shadow: 0 0 0 4px rgba(69, 224, 138, 0.16), 0 6px 16px rgba(0, 0, 0, 0.5);
          cursor: pointer;
          transition: transform 0.12s;
        }
        .growmatic-landing input[type="range"]::-webkit-slider-thumb:active {
          transform: scale(1.12);
        }
        .growmatic-landing input[type="range"]::-moz-range-thumb {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #0d0f14;
          border: 2px solid #45e08a;
          box-shadow: 0 0 0 4px rgba(69, 224, 138, 0.16);
          cursor: pointer;
        }
        .growmatic-landing .fig {
          font-variant-numeric: tabular-nums lining-nums;
          font-feature-settings: "tnum" 1, "lnum" 1;
        }
        @keyframes growmatic-drift {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(3%, -4%) scale(1.08);
          }
        }
        @keyframes growmatic-fadeup {
          from {
            opacity: 0;
            transform: translateY(26px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes growmatic-tape {
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>

      <div className="growmatic-landing" style={{ position: "relative", overflowX: "clip" }}>
        {/* ambient glows */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -120,
            width: 720,
            height: 720,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(69,224,138,.16), transparent 62%)",
            filter: "blur(20px)",
            animation: "growmatic-drift 16s ease-in-out infinite",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 420,
            left: -200,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56,132,255,.12), transparent 64%)",
            filter: "blur(20px)",
            animation: "growmatic-drift 20s ease-in-out infinite reverse",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            WebkitMaskImage: "radial-gradient(1200px 800px at 70% 0%, #000 20%, transparent 76%)",
            maskImage: "radial-gradient(1200px 800px at 70% 0%, #000 20%, transparent 76%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* NAV */}
          <header
            id="top"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 60,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              background: "rgba(8,9,12,.72)",
              borderBottom: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <div
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "15px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
              }}
            >
              <a href="#top" style={{ display: "inline-flex", alignItems: "center" }}>
                <Image
                  src="/logo-mono-white.png"
                  alt="GrowMatic SA"
                  width={1266}
                  height={448}
                  priority
                  style={{ height: 40, width: "auto", display: "block" }}
                />
              </a>
              <nav
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 32,
                  fontSize: 14.5,
                  fontWeight: 500,
                  color: "#aab2c0",
                }}
              >
                <a href="#problem" style={{ color: "#aab2c0" }}>
                  The problem
                </a>
                <a href="#calculator" style={{ color: "#aab2c0" }}>
                  Calculator
                </a>
                <a href="#audit" style={{ color: "#aab2c0" }}>
                  The audit
                </a>
                <a href="#honest" style={{ color: "#aab2c0" }}>
                  Why free
                </a>
              </nav>
              <a
                href={WA_HREF}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: 999,
                  background: "#45e08a",
                  color: "#05130a",
                  fontFamily: "var(--font-sora)",
                  fontWeight: 600,
                  fontSize: 14.5,
                  boxShadow: "0 8px 24px rgba(69,224,138,.24)",
                }}
              >
                Book a free audit
              </a>
            </div>
          </header>

          {/* HERO */}
          <section style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 28px 40px" }}>
            <div
              style={{
                position: "relative",
                borderRadius: 24,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,.08)",
                minHeight: 640,
                display: "flex",
                boxShadow: "0 50px 120px -40px rgba(0,0,0,.9)",
                animation: "growmatic-fadeup .8s ease both",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 0,
                  background: "url('/hero.png') center right / cover no-repeat",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 1,
                  background:
                    "linear-gradient(90deg, rgba(6,7,10,.94) 0%, rgba(6,7,10,.82) 34%, rgba(6,7,10,.34) 66%, rgba(6,7,10,.5) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 1,
                  background:
                    "linear-gradient(180deg, rgba(6,7,10,.55) 0%, transparent 26%, transparent 58%, rgba(6,7,10,.92) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -40,
                  left: 0,
                  right: 0,
                  height: 220,
                  zIndex: 1,
                  background: "radial-gradient(700px 200px at 30% 100%, rgba(69,224,138,.28), transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "clamp(28px, 5vw, 60px)",
                  width: "100%",
                }}
              >
                <h1
                  style={{
                    fontFamily: "var(--font-sora)",
                    fontWeight: 700,
                    fontSize: "clamp(38px, 5.6vw, 66px)",
                    lineHeight: 1.02,
                    letterSpacing: "-.035em",
                    margin: "0 0 22px",
                    maxWidth: "15ch",
                    textShadow: "0 2px 30px rgba(0,0,0,.5)",
                  }}
                >
                  The money is already in your quotes.
                </h1>
                <p
                  style={{
                    fontSize: "clamp(17px, 2vw, 20px)",
                    lineHeight: 1.5,
                    color: "#cfd5df",
                    maxWidth: 540,
                    margin: "0 0 32px",
                  }}
                >
                  Most quotes that go quiet were never a no. GrowMatic finds the jobs you{"'"}ve already
                  priced and never heard back on, and shows you exactly what they{"'"}re worth.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 13 }}>
                  <a
                    href={WA_HREF}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "15px 28px",
                      borderRadius: 12,
                      background: "#16a34a",
                      color: "#fff",
                      fontFamily: "var(--font-sora)",
                      fontWeight: 600,
                      fontSize: 16,
                      boxShadow: "0 14px 34px rgba(22,163,74,.4)",
                    }}
                  >
                    Book a free 15-minute audit →
                  </a>
                  <a
                    href="#calculator"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "15px 28px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,.22)",
                      background: "rgba(255,255,255,.04)",
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                      color: "#fff",
                      fontFamily: "var(--font-sora)",
                      fontWeight: 500,
                      fontSize: 16,
                    }}
                  >
                    See what you{"'"}re owed
                  </a>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 12,
                    marginTop: 40,
                    paddingTop: 30,
                    borderTop: "1px solid rgba(255,255,255,.12)",
                  }}
                >
                  {heroTicks.map((t) => (
                    <div
                      key={t.title}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        padding: "16px 18px",
                        borderRadius: 14,
                        background: "rgba(255,255,255,.04)",
                        border: "1px solid rgba(255,255,255,.09)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                      }}
                    >
                      <span
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: "rgba(69,224,138,.14)",
                          border: "1px solid rgba(69,224,138,.3)",
                          display: "grid",
                          placeItems: "center",
                          color: "#45e08a",
                          fontSize: 16,
                          fontWeight: 800,
                        }}
                      >
                        ✓
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-sora)",
                          fontSize: 14.5,
                          fontWeight: 600,
                          color: "#fff",
                          letterSpacing: "-.01em",
                          lineHeight: 1.25,
                        }}
                      >
                        {t.title}
                      </span>
                      <span style={{ fontSize: 12.5, color: "#9aa3b2", lineHeight: 1.4 }}>{t.sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* TRUST BAND */}
          <section style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 28px 84px" }}>
            <div
              style={{
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 20,
                overflow: "hidden",
                background: "linear-gradient(180deg, rgba(18,21,27,.7), rgba(10,12,16,.7))",
                WebkitMaskImage: "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)",
                maskImage: "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)",
              }}
            >
              <div style={{ display: "flex", width: "max-content", animation: "growmatic-tape 24s linear infinite" }}>
                {[0, 1].map((rep) =>
                  trust.map((t, i) => (
                    <div
                      key={`${rep}-${i}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "30px 46px",
                        borderLeft: "1px solid rgba(255,255,255,.06)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        className="fig"
                        style={{
                          fontFamily: "var(--font-sora)",
                          fontWeight: 700,
                          fontSize: 42,
                          letterSpacing: "-.03em",
                          background: "linear-gradient(160deg, #7ff0ac, #2fa862)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent",
                          lineHeight: 1,
                        }}
                      >
                        {t.n}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          color: "#9aa3b2",
                          lineHeight: 1.3,
                          whiteSpace: "normal",
                          maxWidth: 160,
                        }}
                      >
                        {t.label}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* 01 PROBLEM */}
          <section id="problem" style={{ position: "relative", padding: "76px 28px 90px", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "100vw",
                height: "100%",
                zIndex: 0,
                background: "url('/growth-bg.png') center / cover no-repeat",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "100vw",
                height: "100%",
                zIndex: 0,
                background:
                  "linear-gradient(180deg, rgba(8,9,12,.9) 0%, rgba(8,9,12,.72) 40%, rgba(8,9,12,.86) 100%)",
              }}
            />
            <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto" }}>
              <div style={{ maxWidth: 680, marginBottom: 48 }}>
                <div
                  style={{
                    fontFamily: "var(--font-sora)",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "#45e08a",
                    marginBottom: 18,
                  }}
                >
                  Where the money goes
                </div>
                <h2
                  style={{
                    fontFamily: "var(--font-sora)",
                    fontWeight: 700,
                    fontSize: "clamp(34px, 4.8vw, 56px)",
                    lineHeight: 1.03,
                    letterSpacing: "-.03em",
                    margin: 0,
                  }}
                >
                  A quote is not the finish line. It only feels like one.
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                {problems.map((p) => (
                  <div
                    key={p.n}
                    style={{
                      padding: "32px 30px",
                      borderRadius: 18,
                      background: "linear-gradient(180deg, rgba(20,23,30,.7), rgba(12,14,19,.7))",
                      border: "1px solid rgba(255,255,255,.07)",
                    }}
                  >
                    <div style={{ width: 34, height: 3, borderRadius: 2, background: "#45e08a", marginBottom: 22 }} />
                    <h3
                      style={{
                        fontFamily: "var(--font-sora)",
                        fontWeight: 600,
                        fontSize: 21,
                        letterSpacing: "-.01em",
                        margin: "0 0 10px",
                      }}
                    >
                      {p.title}
                    </h3>
                    <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#9aa3b2", margin: 0 }}>{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CALCULATOR MODULE */}
          <section id="calculator" style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 28px 90px" }}>
            <div
              style={{
                position: "relative",
                borderRadius: 26,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,.09)",
                background: "linear-gradient(180deg, #0e1116, #0a0c10)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -140,
                  right: -80,
                  width: 460,
                  height: 460,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(69,224,138,.16), transparent 64%)",
                  filter: "blur(10px)",
                }}
              />
              <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ padding: "48px 46px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-sora)",
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                      color: "#45e08a",
                      marginBottom: 14,
                    }}
                  >
                    The estimate
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-sora)",
                      fontWeight: 700,
                      fontSize: "clamp(26px, 3.4vw, 38px)",
                      lineHeight: 1.08,
                      letterSpacing: "-.02em",
                      margin: "0 0 10px",
                    }}
                  >
                    How much is sitting in quotes you never got an answer on?
                  </h2>
                  <p style={{ fontSize: 15.5, color: "#9aa3b2", lineHeight: 1.55, margin: "0 0 38px" }}>
                    Slide your own numbers. The figure updates as you go.
                  </p>

                  <div style={{ display: "grid", gap: 30 }}>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: 14,
                        }}
                      >
                        <label style={{ fontSize: 14.5, fontWeight: 600, color: "#cdd3dd" }}>
                          Quotes you send per month
                        </label>
                        <span
                          className="fig"
                          style={{ fontFamily: "var(--font-sora)", fontWeight: 700, fontSize: 22, color: "#fff" }}
                        >
                          {calc.quotes}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={120}
                        step={1}
                        value={calc.quotes}
                        style={{ "--p": calc.quotesP } as React.CSSProperties}
                        onChange={calc.onQuotes}
                        aria-label="Quotes you send per month"
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: 14,
                        }}
                      >
                        <label style={{ fontSize: 14.5, fontWeight: 600, color: "#cdd3dd" }}>
                          Average quote value
                        </label>
                        <span
                          className="fig"
                          style={{ fontFamily: "var(--font-sora)", fontWeight: 700, fontSize: 22, color: "#fff" }}
                        >
                          {calc.avgText}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={2000}
                        max={250000}
                        step={1000}
                        value={calc.avg}
                        style={{ "--p": calc.avgP } as React.CSSProperties}
                        onChange={calc.onAvg}
                        aria-label="Average quote value"
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: 14,
                        }}
                      >
                        <label style={{ fontSize: 14.5, fontWeight: 600, color: "#cdd3dd" }}>
                          Percentage that go quiet
                        </label>
                        <span
                          className="fig"
                          style={{ fontFamily: "var(--font-sora)", fontWeight: 700, fontSize: 22, color: "#fff" }}
                        >
                          {calc.pct}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={calc.pct}
                        style={{ "--p": calc.pctP } as React.CSSProperties}
                        onChange={calc.onPct}
                        aria-label="Percentage that go quiet"
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "48px 44px",
                    background: "linear-gradient(180deg, rgba(69,224,138,.05), rgba(255,255,255,.015))",
                    borderLeft: "1px solid rgba(255,255,255,.07)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: "#7c8494",
                      fontWeight: 600,
                      marginBottom: 12,
                    }}
                  >
                    Estimated value going quiet — a year
                  </div>
                  <div
                    className="fig"
                    style={{
                      fontFamily: "var(--font-sora)",
                      fontWeight: 700,
                      fontSize: "clamp(48px, 6.4vw, 76px)",
                      lineHeight: 0.96,
                      letterSpacing: "-.035em",
                      background: "linear-gradient(100deg, #45e08a, #38c8ff)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {calc.figure}
                  </div>
                  <p className="fig" style={{ fontSize: 15, color: "#9aa3b2", margin: "16px 0 0" }}>
                    About {calc.monthly} a month you{"'"}re leaving on the table.
                  </p>
                  <a
                    href={WA_HREF}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 9,
                      marginTop: 28,
                      padding: "15px 26px",
                      borderRadius: 12,
                      background: "#45e08a",
                      color: "#05130a",
                      fontFamily: "var(--font-sora)",
                      fontWeight: 600,
                      fontSize: 16,
                      boxShadow: "0 14px 34px rgba(69,224,138,.26)",
                    }}
                  >
                    Get the real number — free audit →
                  </a>
                  <p style={{ fontSize: 12.5, color: "#6b7280", margin: "14px 0 0", lineHeight: 1.5 }}>
                    An estimate from your own numbers, not a promise. The real figure comes from your records in the
                    audit.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 02 AUDIT */}
          <section id="audit" style={{ position: "relative", padding: "76px 28px 90px", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "100vw",
                height: "100%",
                zIndex: 0,
                background: "url('/audit-bg.png') center / cover no-repeat",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "100vw",
                height: "100%",
                zIndex: 0,
                background:
                  "linear-gradient(180deg, rgba(8,9,12,.9) 0%, rgba(8,9,12,.74) 42%, rgba(8,9,12,.9) 100%)",
              }}
            />
            <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto" }}>
              <div style={{ maxWidth: 680, marginBottom: 48 }}>
                <div
                  style={{
                    fontFamily: "var(--font-sora)",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "#45e08a",
                    marginBottom: 18,
                  }}
                >
                  What happens in the audit
                </div>
                <h2
                  style={{
                    fontFamily: "var(--font-sora)",
                    fontWeight: 700,
                    fontSize: "clamp(34px, 4.8vw, 56px)",
                    lineHeight: 1.03,
                    letterSpacing: "-.03em",
                    margin: 0,
                  }}
                >
                  Fifteen minutes. Your screen, your records.
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
                {steps.map((s) => (
                  <div
                    key={s.n}
                    style={{
                      padding: "28px 24px",
                      borderRadius: 18,
                      background: "linear-gradient(180deg, rgba(20,23,30,.6), rgba(12,14,19,.6))",
                      border: "1px solid rgba(255,255,255,.07)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-sora)",
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#05130a",
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        background: "#45e08a",
                        display: "grid",
                        placeItems: "center",
                        marginBottom: 20,
                      }}
                    >
                      {s.n}
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-sora)",
                        fontWeight: 600,
                        fontSize: 18,
                        letterSpacing: "-.01em",
                        margin: "0 0 9px",
                      }}
                    >
                      {s.title}
                    </h3>
                    <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#9aa3b2", margin: 0 }}>{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* COST + STATS + POPIA (shared background band) */}
          <div style={{ position: "relative", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                background: "url('/cost-bg.png') center / cover no-repeat",
                backgroundAttachment: "fixed",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                background: "linear-gradient(180deg, rgba(8,9,12,.92) 0%, rgba(8,9,12,.8) 45%, rgba(8,9,12,.92) 100%)",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <section id="honest" style={{ maxWidth: 1200, margin: "0 auto", padding: "76px 28px 40px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.15fr",
                    gap: 20,
                    alignItems: "stretch",
                  }}
                >
                  <div
                    style={{
                      padding: "48px 44px",
                      borderRadius: 22,
                      background: "linear-gradient(180deg, rgba(20,23,30,.7), rgba(12,14,19,.7))",
                      border: "1px solid rgba(255,255,255,.07)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-sora)",
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: ".14em",
                        textTransform: "uppercase",
                        color: "#45e08a",
                        marginBottom: 18,
                      }}
                    >
                      What it costs
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-sora)",
                          fontWeight: 700,
                          fontSize: "clamp(48px, 6vw, 72px)",
                          letterSpacing: "-.03em",
                          color: "#fff",
                          lineHeight: 1,
                        }}
                      >
                        R0
                      </span>
                      <span style={{ fontSize: 16, color: "#9aa3b2" }}>for the audit</span>
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-sora)",
                        fontWeight: 600,
                        fontSize: 22,
                        letterSpacing: "-.01em",
                        margin: "0 0 16px",
                      }}
                    >
                      Nothing is charged until money comes back.
                    </h3>
                    <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#9aa3b2", margin: "0 0 14px" }}>
                      I am not naming a price on this page, because there isn{"'"}t one to name yet. You pay nothing
                      to find out what your quiet quotes are worth.
                    </p>
                    <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#9aa3b2", margin: 0 }}>
                      If there is real money in your records, we talk about recovering it then. If there isn{"'"}t,
                      the audit still told you something useful.
                    </p>
                  </div>

                  <div
                    style={{
                      position: "relative",
                      padding: "48px 44px",
                      borderRadius: 22,
                      overflow: "hidden",
                      background: "linear-gradient(150deg, rgba(69,224,138,.1), rgba(12,14,19,.72))",
                      border: "1px solid rgba(69,224,138,.18)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: -80,
                        right: -60,
                        width: 320,
                        height: 320,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(69,224,138,.18), transparent 66%)",
                        filter: "blur(10px)",
                        pointerEvents: "none",
                      }}
                    />
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-sora)",
                          fontSize: 13,
                          fontWeight: 600,
                          letterSpacing: ".14em",
                          textTransform: "uppercase",
                          color: "#8ff0b3",
                          marginBottom: 18,
                        }}
                      >
                        Why quotes slip away
                      </div>
                      <h2
                        style={{
                          fontFamily: "var(--font-sora)",
                          fontWeight: 700,
                          fontSize: "clamp(26px, 3.2vw, 36px)",
                          lineHeight: 1.06,
                          letterSpacing: "-.02em",
                          margin: "0 0 28px",
                        }}
                      >
                        The problem isn{"'"}t the quote. It{"'"}s the follow-up that never happens.
                      </h2>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "26px 24px" }}>
                        {stats.map((s) => (
                          <div key={s.n}>
                            <div
                              className="fig"
                              style={{
                                fontFamily: "var(--font-sora)",
                                fontWeight: 700,
                                fontSize: "clamp(34px, 3.6vw, 44px)",
                                letterSpacing: "-.03em",
                                background: "linear-gradient(160deg, #7ff0ac, #2fa862)",
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                color: "transparent",
                                lineHeight: 1,
                              }}
                            >
                              {s.n}
                            </div>
                            <div style={{ fontSize: 14.5, lineHeight: 1.5, color: "#b7bdc8", marginTop: 9 }}>
                              {s.label}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: 12.5, color: "#6b7280", margin: "28px 0 0", lineHeight: 1.5 }}>
                        General sales-research findings across industries. Your own number comes from your records
                        in the audit.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* POPIA */}
              <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px 84px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.3fr",
                    gap: 40,
                    alignItems: "start",
                    padding: "48px 44px",
                    borderRadius: 22,
                    background: "rgba(10,12,16,.55)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    border: "1px solid rgba(255,255,255,.08)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-sora)",
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: ".14em",
                        textTransform: "uppercase",
                        color: "#45e08a",
                        marginBottom: 18,
                      }}
                    >
                      Your data · POPIA
                    </div>
                    <h2
                      style={{
                        fontFamily: "var(--font-sora)",
                        fontWeight: 700,
                        fontSize: "clamp(28px, 3.6vw, 42px)",
                        lineHeight: 1.04,
                        letterSpacing: "-.025em",
                        margin: 0,
                      }}
                    >
                      Nothing leaves your systems.
                    </h2>
                  </div>
                  <div>
                    <div style={{ display: "grid", gap: 14 }}>
                      {popia.map((d) => (
                        <div key={d} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                          <span
                            style={{
                              flexShrink: 0,
                              width: 24,
                              height: 24,
                              borderRadius: 7,
                              background: "rgba(69,224,138,.14)",
                              color: "#45e08a",
                              fontSize: 13,
                              fontWeight: 800,
                              display: "grid",
                              placeItems: "center",
                              marginTop: 2,
                            }}
                          >
                            ✓
                          </span>
                          <p style={{ fontSize: 16, lineHeight: 1.55, color: "#aab2c0", margin: 0 }}>{d}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* FINAL CTA */}
          <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px 90px" }}>
            <div
              style={{
                position: "relative",
                borderRadius: 28,
                overflow: "hidden",
                padding: "clamp(48px, 7vw, 88px) 48px",
                background: "linear-gradient(140deg, #0e2b1c, #0a0f16 60%)",
                border: "1px solid rgba(69,224,138,.22)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(760px 420px at 50% -14%, rgba(69,224,138,.26), transparent 66%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
                  backgroundSize: "54px 54px",
                  maskImage: "radial-gradient(600px 300px at 50% 0%, #000, transparent 75%)",
                  WebkitMaskImage: "radial-gradient(600px 300px at 50% 0%, #000, transparent 75%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "relative",
                  display: "grid",
                  gridTemplateColumns: "1.3fr 1fr",
                  gap: 40,
                  alignItems: "center",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-sora)",
                      fontWeight: 700,
                      fontSize: "clamp(32px, 4.4vw, 54px)",
                      lineHeight: 1.02,
                      letterSpacing: "-.03em",
                      margin: "0 0 20px",
                      maxWidth: "16ch",
                    }}
                  >
                    See what your quiet quotes are worth.
                  </h2>
                  <p style={{ fontSize: 18, lineHeight: 1.5, color: "#b7bdc8", margin: 0, maxWidth: "46ch" }}>
                    Send me last month{"'"}s open quotes and I{"'"}ll show you the real number. Fifteen minutes, no
                    card, no sign-up, no long contract.
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  <a
                    href={WA_HREF}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 9,
                      padding: "17px 30px",
                      borderRadius: 12,
                      background: "#16a34a",
                      color: "#fff",
                      fontFamily: "var(--font-sora)",
                      fontWeight: 600,
                      fontSize: 17,
                      boxShadow: "0 16px 40px rgba(22,163,74,.4)",
                    }}
                  >
                    Book on WhatsApp →
                  </a>
                  <a
                    href={EMAIL_HREF}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 9,
                      padding: "17px 30px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,.18)",
                      background: "rgba(255,255,255,.03)",
                      color: "#eef1f5",
                      fontFamily: "var(--font-sora)",
                      fontWeight: 500,
                      fontSize: 17,
                    }}
                  >
                    Email instead
                  </a>
                  <div style={{ textAlign: "center", fontSize: 13, color: "#7c8494", marginTop: 4 }}>
                    +27 82 790 0255 · Gqeberha
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer
            style={{
              position: "relative",
              borderTop: "1px solid rgba(255,255,255,.06)",
              background: "radial-gradient(900px 300px at 20% 0%, rgba(69,224,138,.05), transparent 70%)",
            }}
          >
            <div
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "72px 28px 40px",
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr 1.1fr",
                gap: 40,
              }}
            >
              <div style={{ maxWidth: 360 }}>
                <Image
                  src="/logo-mono-white.png"
                  alt="GrowMatic SA"
                  width={1266}
                  height={448}
                  style={{ height: 42, width: "auto", display: "block", marginBottom: 24 }}
                />
                <p style={{ fontSize: 15, lineHeight: 1.65, color: "#8b93a2", margin: "0 0 30px" }}>
                  Quote Recovery follows up the quotes you{"'"}ve already sent — so potential jobs don{"'"}t get
                  forgotten while you{"'"}re busy on-site.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <a
                    href={WA_HREF}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 24px",
                      borderRadius: 999,
                      background: "#16a34a",
                      color: "#fff",
                      fontFamily: "var(--font-sora)",
                      fontWeight: 600,
                      fontSize: 15,
                      boxShadow: "0 10px 28px rgba(22,163,74,.32)",
                    }}
                  >
                    WhatsApp us
                  </a>
                  <a
                    href="#audit"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 24px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,.2)",
                      color: "#fff",
                      fontFamily: "var(--font-sora)",
                      fontWeight: 600,
                      fontSize: 15,
                    }}
                  >
                    How it works
                  </a>
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-sora)",
                    fontSize: 12,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "#45e08a",
                    fontWeight: 600,
                    marginBottom: 20,
                  }}
                >
                  GrowMatic
                </div>
                <div style={{ display: "grid", gap: 14, fontSize: 15 }}>
                  <a href="#top" style={{ color: "#aab2c0" }}>
                    Home
                  </a>
                  <a href="#audit" style={{ color: "#aab2c0" }}>
                    How it works
                  </a>
                  <a href="#honest" style={{ color: "#aab2c0" }}>
                    Pricing
                  </a>
                  <a href="#calculator" style={{ color: "#aab2c0" }}>
                    Calculator
                  </a>
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-sora)",
                    fontSize: 12,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "#45e08a",
                    fontWeight: 600,
                    marginBottom: 20,
                  }}
                >
                  Legal
                </div>
                <div style={{ display: "grid", gap: 14, fontSize: 15 }}>
                  <a href="#" style={{ color: "#aab2c0" }}>
                    Privacy Policy
                  </a>
                  <a href="#" style={{ color: "#aab2c0" }}>
                    POPIA Notice
                  </a>
                  <a href="#" style={{ color: "#aab2c0" }}>
                    Terms of Service
                  </a>
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-sora)",
                    fontSize: 12,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "#45e08a",
                    fontWeight: 600,
                    marginBottom: 20,
                  }}
                >
                  Get in touch
                </div>
                <div style={{ display: "grid", gap: 14, fontSize: 15 }}>
                  <a href={EMAIL_HREF} style={{ color: "#dfe4ec" }}>
                    ewan@growmaticsa.com
                  </a>
                  <a href="tel:+27827900255" style={{ color: "#dfe4ec" }}>
                    +27 82 790 0255
                  </a>
                  <span style={{ color: "#7c8494" }}>Gqeberha · Eastern Cape</span>
                </div>
              </div>
            </div>
            <div
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "24px 28px",
                borderTop: "1px solid rgba(255,255,255,.06)",
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: 12,
                alignItems: "center",
                fontFamily: "var(--font-sora)",
                fontSize: 12,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "#5f6675",
              }}
            >
              <span>© 2026 GrowMatic SA · All rights reserved</span>
              <span style={{ textAlign: "center" }}>growmaticsa.com</span>
              <span style={{ textAlign: "right" }}>Proudly Eastern Cape</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
