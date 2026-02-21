import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";


const useCountUp = (target, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const StatCard = ({ value, suffix = "", label, started }) => {
  const count = useCountUp(value, 1800, started);
  return (
    <div style={{
      textAlign: "center",
      padding: "24px 32px",
      borderRight: "1px solid var(--border)",
    }}>
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(40px, 5vw, 64px)",
        color: "var(--primary)",
        lineHeight: 1,
        letterSpacing: "0.02em",
      }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{
        fontSize: "var(--text-xs)",
        color: "var(--text-secondary)",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        marginTop: 8,
        fontWeight: 500,
      }}>
        {label}
      </div>
    </div>
  );
};

const features = [
  { icon: "🚛", title: "Vehicle Registry",     desc: "Digital garage for every asset. Track plate, capacity, odometer and status in real time.",           color: "var(--primary)"  },
  { icon: "🗺️", title: "Trip Dispatcher",      desc: "Book trips with smart cargo validation. Overload protection blocks impossible assignments.",          color: "var(--info)"     },
  { icon: "🔧", title: "Maintenance Logs",     desc: "Log service issues and auto-pull vehicles off the road into the shop queue instantly.",               color: "var(--warning)"  },
  { icon: "⛽", title: "Expense & Fuel",       desc: "Track fuel spend per trip. Auto-compute total operational cost across your entire fleet.",             color: "var(--primary)"  },
  { icon: "👤", title: "Driver Profiles",      desc: "Monitor license expiry, safety scores and trip completion rates for every driver on payroll.",        color: "var(--info)"     },
  { icon: "📊", title: "Analytics & Reports",  desc: "Fleet ROI, fuel efficiency trends, and one-click CSV/PDF export for audits and payroll.",             color: "var(--warning)"  },
  { icon: "⚡", title: "Smart Load Optimizer", desc: "AI-ranks available vehicles by cargo fit and cost-per-km. Pick the best match in one click.",         color: "var(--primary)"  },
  { icon: "🔔", title: "Alert Center",         desc: "Proactive expiry warnings for licenses and odometer milestones. Never get caught off-guard.",         color: "var(--danger)"   },
];

const workflowSteps = [
  { step: "01", title: "Register Vehicle",  desc: "Add asset to registry with plate, capacity and odometer",  icon: "🚛" },
  { step: "02", title: "Verify Driver",     desc: "System checks license validity before allowing assignment", icon: "✅" },
  { step: "03", title: "Dispatch Trip",     desc: "Cargo weight validated against vehicle max capacity",       icon: "📦" },
  { step: "04", title: "Track Progress",    desc: "Live status from Dispatched → On Trip → Completed",        icon: "📍" },
  { step: "05", title: "Log Expenses",      desc: "Record fuel, distance and misc costs per trip",             icon: "⛽" },
  { step: "06", title: "Analyse & Export",  desc: "Fleet ROI, cost-per-km and monthly financial reports",     icon: "📊" },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [statsRef, statsInView] = useInView(0.3);
  const [featuresRef, featuresInView] = useInView(0.1);
  const [workflowRef, workflowInView] = useInView(0.1);

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", overflowX: "hidden" }}>

      <nav style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: "var(--z-raised)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        height: 64,
        background: "var(--bg-base)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: 24,
          letterSpacing: "0.06em",
          color: "var(--primary)",
        }}>
          FLEET<span style={{ color: "var(--text-secondary)" }}>FLOW</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Built for Odoo Hackathon 2026
          </span>
          <button className="btn btn--primary btn--sm" onClick={() => navigate("/auth")}>
            Enter System →
          </button>
        </div>
      </nav>

      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 48px 80px",
        position: "relative",
        textAlign: "center",
        overflow: "hidden",
      }}>

        
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: 0.4,
          pointerEvents: "none",
        }} />

        <div style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 16px",
          border: "1px solid var(--primary)",
          borderRadius: "var(--radius-pill)",
          background: "var(--primary-dim)",
          fontSize: "var(--text-xs)",
          color: "var(--primary)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 32,
          position: "relative",
          animation: "fadeIn 600ms ease both",
        }}>
          <span style={{
            width: 6, height: 6,
            borderRadius: "50%",
            background: "var(--primary)",
            animation: "pulse-info 2s infinite",
            display: "inline-block",
          }} />
          Modular Fleet & Logistics Management
        </div>

       
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(56px, 9vw, 110px)",
          lineHeight: 0.95,
          letterSpacing: "0.02em",
          color: "var(--text-primary)",
          marginBottom: 24,
          position: "relative",
          animation: "slideUp 700ms ease 100ms both",
        }}>
          YOUR FLEET.<br />
          <span style={{
            color: "var(--primary)",
            textShadow: "0 0 60px var(--primary-glow)",
          }}>
            FULLY IN
          </span>
          <br />CONTROL.
        </h1>

        
        <p style={{
          fontSize: "clamp(14px, 1.5vw, 18px)",
          color: "var(--text-secondary)",
          maxWidth: 540,
          lineHeight: 1.7,
          marginBottom: 48,
          fontFamily: "var(--font-body)",
          position: "relative",
          animation: "slideUp 700ms ease 200ms both",
        }}>
          Replace scattered logbooks with a centralized command center.
          Track every vehicle, dispatch every trip, and audit every rupee —
          all in one industrial-grade system.
        </p>

       
        <div style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          position: "relative",
          animation: "slideUp 700ms ease 300ms both",
        }}>
          <button
            className="btn btn--primary btn--lg"
            onClick={() => navigate("/auth")}
            style={{ fontSize: 15, letterSpacing: "0.06em" }}
          >
            Launch FleetFlow →
          </button>
          <a
            href="#features"
            className="btn btn--ghost btn--lg"
            style={{ fontSize: 15 }}
          >
            See Features
          </a>
        </div>

        
        <div style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          color: "var(--text-dim)",
          fontSize: "var(--text-xs)",
          letterSpacing: "0.1em",
          animation: "fadeIn 1s ease 1s both",
        }}>
          <span style={{ textTransform: "uppercase" }}>Scroll</span>
          <div style={{
            width: 1,
            height: 40,
            background: "linear-gradient(to bottom, var(--text-dim), transparent)",
          }} />
        </div>
      </section>

      
      <section ref={statsRef} style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)",
      }}>
        <div style={{
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}>
          <StatCard value={220}  suffix="+"  label="Active Vehicles Tracked"  started={statsInView} />
          <StatCard value={1840} suffix=""   label="Trips Dispatched"          started={statsInView} />
          <StatCard value={98}   suffix="%"  label="On-Time Delivery Rate"     started={statsInView} />
          <div style={{ borderRight: "none" }}>
            <StatCard value={2600000} suffix="₹" label="Fuel Cost Saved Monthly" started={statsInView} />
          </div>
        </div>
      </section>

      
      <section style={{
        padding: "120px 48px",
        maxWidth: "var(--content-max)",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 80,
        alignItems: "center",
      }}>
        
        <div>
          <div style={{
            fontSize: "var(--text-xs)",
            color: "var(--danger)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            marginBottom: 16,
          }}>
            The Problem
          </div>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(28px, 3vw, 40px)",
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.2,
            marginBottom: 24,
          }}>
            Manual logbooks are killing your efficiency.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              "Drivers assigned to overloaded vehicles daily",
              "Expired licenses go unnoticed until an incident",
              "No visibility into real fuel cost per route",
              "Maintenance tracked on paper — vehicles break down mid-trip",
            ].map((p, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                fontSize: "var(--text-sm)",
                color: "var(--text-secondary)",
              }}>
                <span style={{
                  color: "var(--danger)",
                  fontSize: 16,
                  lineHeight: 1.4,
                  flexShrink: 0,
                }}>✕</span>
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Solution */}
        <div>
          <div style={{
            fontSize: "var(--text-xs)",
            color: "var(--primary)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            marginBottom: 16,
          }}>
            The FleetFlow Solution
          </div>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(28px, 3vw, 40px)",
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.2,
            marginBottom: 24,
          }}>
            One system. Every vehicle. Total control.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              "Cargo overload blocked at the point of dispatch",
              "License expiry alerts 30 days before they happen",
              "Automated fuel cost tracking per trip and per vehicle",
              "Service logs auto-pull vehicles from the dispatch pool",
            ].map((s, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                fontSize: "var(--text-sm)",
                color: "var(--text-secondary)",
              }}>
                <span style={{
                  color: "var(--primary)",
                  fontSize: 16,
                  lineHeight: 1.4,
                  flexShrink: 0,
                }}>✓</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section id="features" style={{
        padding: "80px 48px 120px",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-surface)",
      }}>
        <div style={{ maxWidth: "var(--content-max)", margin: "0 auto" }}>

          
          <div style={{ marginBottom: 64, textAlign: "center" }}>
            <div style={{
              fontSize: "var(--text-xs)",
              color: "var(--primary)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              marginBottom: 12,
            }}>
              8 Core Modules
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(36px, 5vw, 64px)",
              color: "var(--text-primary)",
              letterSpacing: "0.02em",
            }}>
              EVERYTHING YOUR FLEET NEEDS
            </h2>
          </div>

          
          <div ref={featuresRef} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}>
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderTop: `2px solid ${f.color}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "28px 24px",
                  transition: "transform 250ms ease, box-shadow 250ms ease",
                  cursor: "default",
                  animation: featuresInView ? `slideUp 500ms ease ${i * 60}ms both` : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 8px 32px ${f.color}18`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
                <div style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "var(--text-base)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 10,
                }}>
                  {f.title}
                </div>
                <div style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.65,
                }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW ── */}
      <section style={{ padding: "120px 48px", maxWidth: "var(--content-max)", margin: "0 auto" }}>

        <div style={{ marginBottom: 64, textAlign: "center" }}>
          <div style={{
            fontSize: "var(--text-xs)",
            color: "var(--primary)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            marginBottom: 12,
          }}>
            How It Works
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(36px, 5vw, 64px)",
            color: "var(--text-primary)",
            letterSpacing: "0.02em",
          }}>
            FROM INTAKE TO INSIGHT
          </h2>
        </div>

        <div ref={workflowRef} style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "2px",
          background: "var(--border)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}>
          {workflowSteps.map((s, i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-surface)",
                padding: "36px 28px",
                borderBottom: i < 3 ? "2px solid var(--border)" : "none",
                animation: workflowInView ? `slideUp 500ms ease ${i * 80}ms both` : "none",
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  color: "var(--primary)",
                  letterSpacing: "0.1em",
                  opacity: 0.7,
                }}>
                  {s.step}
                </span>
                <div style={{
                  height: 1,
                  flex: 1,
                  background: "var(--border)",
                }} />
                <span style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
              <div style={{
                fontFamily: "var(--font-heading)",
                fontSize: "var(--text-md)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 10,
              }}>
                {s.title}
              </div>
              <div style={{
                fontSize: "var(--text-sm)",
                color: "var(--text-secondary)",
                lineHeight: 1.65,
              }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        margin: "0 48px 80px",
        borderRadius: "var(--radius-xl)",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderTop: "2px solid var(--primary)",
        padding: "80px 64px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* background glow */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          height: 300,
          background: "radial-gradient(ellipse, var(--primary-glow) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          fontSize: "var(--text-xs)",
          color: "var(--primary)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          marginBottom: 16,
          position: "relative",
        }}>
          Ready to Take Control?
        </div>

        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(40px, 6vw, 80px)",
          color: "var(--text-primary)",
          letterSpacing: "0.02em",
          lineHeight: 1,
          marginBottom: 24,
          position: "relative",
        }}>
          YOUR FLEET COMMAND<br />
          <span style={{ color: "var(--primary)" }}>STARTS HERE.</span>
        </h2>

        <p style={{
          fontSize: "var(--text-md)",
          color: "var(--text-secondary)",
          marginBottom: 40,
          position: "relative",
        }}>
          Built for the Odoo Hackathon 2026 · Industrial Precision · Zero Logbooks
        </p>

        <button
          className="btn btn--primary btn--lg"
          onClick={() => navigate("/auth")}
          style={{
            fontSize: 16,
            letterSpacing: "0.08em",
            padding: "16px 40px",
            position: "relative",
          }}
        >
          Enter FleetFlow →
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "32px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: 18,
          letterSpacing: "0.06em",
          color: "var(--text-dim)",
        }}>
          FLEET<span style={{ color: "var(--text-dim)" }}>FLOW</span>
        </div>
        <div style={{
          fontSize: "var(--text-xs)",
          color: "var(--text-dim)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}>
          Odoo Hackathon 2026 · All Rights Reserved
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
