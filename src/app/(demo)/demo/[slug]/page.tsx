"use client";

import React, { useState, useEffect, use, useRef } from "react";

// Define TypeScript interfaces for lookbook cards
interface LookbookCard {
  id: string;
  conceptLabel: string;
  gradientClass: string;
  title: string;
  description: string;
  isLiked: boolean;
  isCommentTrayOpen: boolean;
  commentInput: string;
  isCommentSubmitted: boolean;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function DemoClientPage({ params }: PageProps) {
  // Unwrap params using React.use()
  const { slug } = use(params);

  // ----------------------------------------------------
  // 1. Password Authorization Gate State
  // ----------------------------------------------------
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [showError, setShowError] = useState(false);
  const [isFadingGate, setIsFadingGate] = useState(false);
  const [isGateRemoved, setIsGateRemoved] = useState(false);
  
  const passcodeRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  // Section entrance / exit scroll-linked observer
  useEffect(() => {
    if (!isUnlocked) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const sections = document.querySelectorAll(".reveal-section");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [isUnlocked]);

  // ----------------------------------------------------
  // 2. Curation Cards State (Concept 1, 2, 3)
  // ----------------------------------------------------
  const [cards, setCards] = useState<LookbookCard[]>([
    {
      id: "canopy-floral-ceiling",
      conceptLabel: "MANDAP CONCEPT",
      gradientClass: "gradient-emerald",
      title: "01 / The Canopy & Floral Ceiling",
      description: "Exotic white hydrangeas and tuberose suspended in cascading drapes, dropped elegantly to balance structural brass elements.",
      isLiked: false,
      isCommentTrayOpen: false,
      commentInput: "",
      isCommentSubmitted: false,
    },
    {
      id: "heritage-tablescape",
      conceptLabel: "TABLESCAPE DETAIL",
      gradientClass: "gradient-gold-cream",
      title: "02 / Heritage Tablescape",
      description: "Antique brass candelabras set against raw silk linen runners, adorned with loose marigolds and hand-dipped beeswax candles.",
      isLiked: false,
      isCommentTrayOpen: false,
      commentInput: "",
      isCommentSubmitted: false,
    },
    {
      id: "welcome-walkway",
      conceptLabel: "ENTRANCE EXPERIENTIAL",
      gradientClass: "gradient-marigold",
      title: "03 / The Welcome Walkway",
      description: "Arches of fresh jasmine strings interspersed with hanging brass bells, casting warm amber shadows across the stone pathway.",
      isLiked: false,
      isCommentTrayOpen: false,
      commentInput: "",
      isCommentSubmitted: false,
    }
  ]);

  // ----------------------------------------------------
  // 3. Gate Validation Handler
  // ----------------------------------------------------
  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const correctPasscode = "tajdecember";
    if (passcode.trim().toLowerCase() === correctPasscode) {
      setShowError(false);
      setIsFadingGate(true);

      // Transition app roll-up
      setTimeout(() => {
        setIsUnlocked(true);
      }, 150);

      // Remove gate DOM representation entirely
      setTimeout(() => {
        setIsGateRemoved(true);
      }, 750);
    } else {
      setShowError(true);
      setPasscode("");
      passcodeRef.current?.focus();

      // Trigger CSS shaking animation
      if (errorRef.current) {
        errorRef.current.style.animation = "none";
        void errorRef.current.offsetWidth; // Reflow trigger
        errorRef.current.style.animation = "";
      }
    }
  };

  // ----------------------------------------------------
  // 4. Client Interactivity Handlers
  // ----------------------------------------------------
  const handleLikeCard = (id: string) => {
    setCards(prev => prev.map(card => {
      if (card.id === id) {
        const nextLiked = !card.isLiked;
        return {
          ...card,
          isLiked: nextLiked,
          isCommentTrayOpen: nextLiked ? false : card.isCommentTrayOpen
        };
      }
      return card;
    }));
  };

  const handleCommentToggle = (id: string) => {
    setCards(prev => prev.map(card => {
      if (card.id === id) {
        return {
          ...card,
          isCommentTrayOpen: !card.isCommentTrayOpen
        };
      }
      return card;
    }));
  };

  const handleCommentCancel = (id: string) => {
    setCards(prev => prev.map(card => {
      if (card.id === id) {
        return {
          ...card,
          isCommentTrayOpen: false,
          commentInput: card.isCommentSubmitted ? card.commentInput : ""
        };
      }
      return card;
    }));
  };

  const handleCommentChange = (id: string, text: string) => {
    setCards(prev => prev.map(card => {
      if (card.id === id) {
        return { ...card, commentInput: text };
      }
      return card;
    }));
  };

  const handleCommentSend = (id: string) => {
    let targetCard = cards.find(c => c.id === id);
    if (!targetCard) return;

    const text = targetCard.commentInput.trim();
    if (!text) return;

    // Build comment transmission log payload
    const feedbackPayload = {
      cardId: id,
      comment: text,
      timestamp: new Date().toISOString(),
      client: `Mridula & Rohan dynamic page (slug: ${slug})`,
    };

    console.group("%c💬 FLUX SLATE — Client Feedback Transmitted", "color: #10B981; font-weight: bold; font-size: 13px;");
    console.log("Concept ID: ", feedbackPayload.cardId);
    console.log("Feedback:   ", feedbackPayload.comment);
    console.log("Timestamp:  ", feedbackPayload.timestamp);
    console.log("Payload:    ", JSON.stringify(feedbackPayload, null, 2));
    console.groupEnd();

    // Trigger Success Overlay
    setCards(prev => prev.map(card => {
      if (card.id === id) {
        return {
          ...card,
          isCommentSubmitted: true,
          commentInput: ""
        };
      }
      return card;
    }));

    // Clean tray after reading delay
    setTimeout(() => {
      setCards(prev => prev.map(card => {
        if (card.id === id) {
          return {
            ...card,
            isCommentTrayOpen: false,
            isCommentSubmitted: false
          };
        }
        return card;
      }));
    }, 3000);
  };

  // ----------------------------------------------------
  // 5. Slug Validation Render Fallback
  // ----------------------------------------------------
  if (slug !== "mridula-rohan") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-8 bg-obsidian text-center">
        <div className="max-w-md p-8 border border-white/5 bg-charcoal rounded-md shadow-2xl">
          <h1 className="font-serif text-3xl font-light tracking-wide text-white mb-4">Link Inactive</h1>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            This digital lookbook link is either incorrect, expired, or has been secure-locked by the design studio.
          </p>
          <a href="/" className="inline-block text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors duration-300">
            ← Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 1. Secure Access Gate Screen */}
      {!isGateRemoved && (
        <div className={`access-gate ${isFadingGate ? "fade-out" : ""}`} role="region" aria-live="polite">
          <div className="gate-content">
            <span className="gate-badge">SECURE DIGITAL LOOKBOOK</span>
            <h1 className="gate-title">FLUX SLATE</h1>
            
            <form onSubmit={handleGateSubmit} className="gate-form">
              <div className="gate-input-group">
                <label htmlFor="gate-password" className="sr-only">Access Code</label>
                <input 
                  type="password" 
                  id="gate-password" 
                  placeholder="Enter Access Code" 
                  autoComplete="off" 
                  value={passcode}
                  ref={passcodeRef}
                  onChange={(e) => { setPasscode(e.target.value); if (showError) setShowError(false); }}
                  required
                />
                <span className="gate-focus-bar"></span>
              </div>
              <button type="submit" className="gate-submit-btn">Unlock Proposal</button>
              <div className="gate-meta">
                <p className="gate-hint">Passcode: <span className="code-word">tajdecember</span></p>
                {showError && (
                  <p ref={errorRef} className="gate-error" id="gate-error" aria-live="assertive" style={{ display: "block" }}>
                    Access code incorrect. Please try again.
                  </p>
                )}
                <a href="/" className="gate-back-link">← Back to Homepage</a>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Main Lookbook Application */}
      <div className={`lookbook-app ${isUnlocked ? "is-active" : "hide-initially"}`} id="lookbook-app">
        {/* Magazine Pitch Header */}
        <header className="lookbook-header reveal-section">
          <div className="brand-bar">
            <span className="brand-name">
              <a href="/" style={{ textDecoration: "none", color: "inherit" }}>
                FLUX <span className="font-light">SLATE</span>
              </a>
            </span>
            <span className="secure-badge">
              <span className="badge-dot"></span> SECURE CLIENT LINK
            </span>
          </div>
          <div className="client-identity">
            <h1 className="client-names">Mridula & Rohan</h1>
            <p className="venue-subtitle">Venue Concept: Taj Lands End, Mumbai</p>
          </div>
        </header>

        {/* Dynamic Concept Stack */}
        <main className="lookbook-content">
          {cards.map(card => (
            <section key={card.id} className="showcase-card reveal-section">
              <div className="card-visual-wrapper">
                <div className={`card-visual ${card.gradientClass}`}>
                  <div className="visual-grid-lines"></div>
                  <div className="concept-label">{card.conceptLabel}</div>
                  
                  {/* Action overlays */}
                  <div className="floating-actions">
                    <button 
                      onClick={() => handleLikeCard(card.id)}
                      className={`action-btn heart-btn ${card.isLiked ? "is-active" : ""}`} 
                      aria-label="Approve Concept"
                    >
                      <svg className="heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleCommentToggle(card.id)}
                      className={`action-btn comment-btn ${card.isCommentTrayOpen ? "is-active" : ""}`} 
                      aria-label="Add Feedback"
                    >
                      <svg className="comment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </button>
                  </div>

                  {/* Approved overlay backdrop */}
                  <div 
                    className={`approved-overlay ${card.isLiked ? "is-active" : ""}`}
                    onClick={() => handleLikeCard(card.id)}
                  >
                    <div className="approved-badge-wrapper">
                      <svg className="approved-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                      <span>Concept Approved</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-details">
                <h2 className="card-title">{card.title}</h2>
                <p className="card-description">{card.description}</p>
              </div>

              {/* Collapsible Comment tray drawer */}
              <div className={`feedback-tray ${card.isCommentTrayOpen ? "is-active" : ""} ${card.isCommentSubmitted ? "submitted" : ""}`}>
                <div className="feedback-tray-inner">
                  <textarea 
                    className="feedback-textarea" 
                    placeholder="Add design feedback for this concept..." 
                    rows={2}
                    value={card.commentInput}
                    onChange={(e) => handleCommentChange(card.id, e.target.value)}
                  />
                  <div className="feedback-actions">
                    <button className="btn-cancel-feedback" onClick={() => handleCommentCancel(card.id)}>Cancel</button>
                    <button className="btn-send-feedback" onClick={() => handleCommentSend(card.id)}>Send Feedback</button>
                  </div>
                </div>
                <div className="feedback-success-msg">
                  <span className="success-dot"></span> Feedback transmitted to design studio.
                </div>
              </div>
            </section>
          ))}
        </main>

        {/* Footer info brand bar */}
        <footer className="lookbook-footer-bar reveal-section">
          <div className="footer-container">
            <p className="footer-brand">FLUX SLATE • DIGITAL PITCH</p>
            <p className="footer-tagline">Confidential Client Review System. Powered by Flux.</p>
            <a href="/" className="footer-back-link">← Return to Homepage</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
