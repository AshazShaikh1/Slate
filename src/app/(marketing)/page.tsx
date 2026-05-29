"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

// Define TypeScript interfaces for simulator state
interface CardState {
  isLiked: boolean;
  isCommentTrayOpen: boolean;
  commentInput: string;
  isCommentSubmitted: boolean;
}

export default function MarketingPage() {
  // ----------------------------------------------------
  // 1. Modal & Waitlist Form State
  // ----------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<
    "free_waitlist" | "founding_pass"
  >("founding_pass");

  // Input fields
  const [fullName, setFullName] = useState("");
  const [instaHandle, setInstaHandle] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");

  // Validation error states
  const [nameError, setNameError] = useState(false);
  const [instaError, setInstaError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  // Form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [randomRefId, setRandomRefId] = useState("FX-XXXXX");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Auto-focus input reference
  const nameInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------
  // 2. Lookbook Simulator State
  // ----------------------------------------------------
  const [simCards, setSimCards] = useState<Record<string, CardState>>({
    "sim-canopy": {
      isLiked: false,
      isCommentTrayOpen: false,
      commentInput: "",
      isCommentSubmitted: false,
    },
    "sim-tablescape": {
      isLiked: false,
      isCommentTrayOpen: false,
      commentInput: "",
      isCommentSubmitted: false,
    },
    "sim-welcome": {
      isLiked: false,
      isCommentTrayOpen: false,
      commentInput: "",
      isCommentSubmitted: false,
    },
  });

  // ----------------------------------------------------
  // 3. Form Triggers & Actions
  // ----------------------------------------------------
  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
    // Short delay to allow modal transition
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "";

    // Reset form states after close animation completes
    setTimeout(() => {
      resetForm();
    }, 400);
  };

  const resetForm = () => {
    setFullName("");
    setInstaHandle("");
    setBusinessEmail("");
    setSelectedTier("founding_pass");
    setNameError(false);
    setInstaError(false);
    setEmailError(false);
    setIsSubmitting(false);
    setIsSuccess(false);
    setIsFadingOut(false);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Section entrance / exit scroll-linked observer
  useEffect(() => {
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
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    const sections = document.querySelectorAll(".reveal-section");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // Validation helpers
  const isValidEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr.trim());
  };

  const isValidInstaHandle = (handle: string) => {
    const cleaned = handle.replace(/^@/, "").trim();
    if (cleaned.length === 0 || cleaned.length > 30) return false;
    const instaRegex = /^[a-zA-Z0-9._]+$/;
    return instaRegex.test(cleaned);
  };

  // Form Submit handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasErrors = false;

    // Formulate final Insta handle
    let formattedInsta = instaHandle.trim();
    if (formattedInsta && !formattedInsta.startsWith("@")) {
      formattedInsta = "@" + formattedInsta;
      setInstaHandle(formattedInsta);
    }

    // Full name check
    if (!fullName.trim()) {
      setNameError(true);
      hasErrors = true;
    } else {
      setNameError(false);
    }

    // Instagram check
    if (!formattedInsta || !isValidInstaHandle(formattedInsta)) {
      setInstaError(true);
      hasErrors = true;
    } else {
      setInstaError(false);
    }

    // Email check
    if (!businessEmail.trim() || !isValidEmail(businessEmail)) {
      setEmailError(true);
      hasErrors = true;
    } else {
      setEmailError(false);
    }

    if (hasErrors) return;

    // Proceeding to submit
    setIsSubmitting(true);

    const signupPayload = {
      full_name: fullName.trim(),
      instagram: formattedInsta,
      email: businessEmail.trim(),
      tier_selected: selectedTier,
      payment_status: "pending",
    };

    console.group(
      "%c💎 FLUX SLATE — Lead Registered",
      "color: #10B981; font-weight: bold; font-size: 13px;",
    );
    console.log("Payload: ", JSON.stringify(signupPayload, null, 2));
    console.groupEnd();

    // Trigger visual fadeout animations inside the modal
    setIsFadingOut(true);

    // Setup success state view toggles
    const completeRegistration = () => {
      if (selectedTier === "founding_pass") {
        const randomRefNum = Math.floor(10000 + Math.random() * 90000);
        setRandomRefId(`FX-${randomRefNum}`);
      }
      setIsSubmitting(false);
      setIsSuccess(true);
    };

    if (!supabase) {
      console.log(
        "%cℹ️ Supabase is in offline/mock state. Simulating database insertion.",
        "color: #3B82F6; font-style: italic;",
      );
      setTimeout(() => {
        completeRegistration();
      }, 800);
    } else {
      try {
        const { error } = await supabase
          .from("registrations")
          .insert([signupPayload]);
        if (error) {
          console.error("Supabase DB insertion error:", error);
          alert("Submission failed: " + error.message);
          setIsFadingOut(false);
          setIsSubmitting(false);
        } else {
          completeRegistration();
        }
      } catch (err) {
        console.error("Database connection error:", err);
        alert(
          "Database connection failed. Please check your credentials or network and try again.",
        );
        setIsFadingOut(false);
        setIsSubmitting(false);
      }
    }
  };

  // UPI Copy ID handler
  const handleCopyUpi = () => {
    const upiId = "ashazshaikh111-1@okicici";
    navigator.clipboard
      .writeText(upiId)
      .then(() => {
        setCopiedUpi(true);
        setTimeout(() => {
          setCopiedUpi(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy UPI ID:", err);
      });
  };

  // ----------------------------------------------------
  // 4. Simulator Functions
  // ----------------------------------------------------
  const toggleLikeCard = (cardId: string) => {
    setSimCards((prev) => {
      const card = prev[cardId];
      const nextLiked = !card.isLiked;

      return {
        ...prev,
        [cardId]: {
          ...card,
          isLiked: nextLiked,
          // Close comment tray automatically if approved
          isCommentTrayOpen: nextLiked ? false : card.isCommentTrayOpen,
        },
      };
    });
  };

  const removeLikeCard = (cardId: string) => {
    setSimCards((prev) => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        isLiked: false,
      },
    }));
  };

  const toggleCommentTray = (cardId: string) => {
    setSimCards((prev) => {
      const card = prev[cardId];
      return {
        ...prev,
        [cardId]: {
          ...card,
          isCommentTrayOpen: !card.isCommentTrayOpen,
        },
      };
    });
  };

  const closeCommentTray = (cardId: string) => {
    setSimCards((prev) => {
      const card = prev[cardId];
      return {
        ...prev,
        [cardId]: {
          ...card,
          isCommentTrayOpen: false,
          commentInput: card.isCommentSubmitted ? card.commentInput : "",
        },
      };
    });
  };

  const handleCommentChange = (cardId: string, value: string) => {
    setSimCards((prev) => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        commentInput: value,
      },
    }));
  };

  const submitSimulatorComment = (cardId: string) => {
    const card = simCards[cardId];
    const commentText = card.commentInput.trim();

    if (!commentText) return;

    // Simulated transaction details
    const feedbackPayload = {
      cardId: cardId,
      comment: commentText,
      timestamp: new Date().toISOString(),
      client: "Mridula & Rohan Simulator Mock",
    };

    console.group(
      "%c💬 FLUX SLATE — Simulator Feedback Transmitted",
      "color: #10B981; font-weight: bold; font-size: 13px;",
    );
    console.log("Concept ID: ", feedbackPayload.cardId);
    console.log("Feedback:   ", feedbackPayload.comment);
    console.log("Timestamp:  ", feedbackPayload.timestamp);
    console.log("Payload:    ", JSON.stringify(feedbackPayload, null, 2));
    console.groupEnd();

    // Trigger submitted transition overlay
    setSimCards((prev) => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        isCommentSubmitted: true,
        commentInput: "",
      },
    }));

    // Revert submitted indicator and close drawer after delay
    setTimeout(() => {
      setSimCards((prev) => ({
        ...prev,
        [cardId]: {
          ...prev[cardId],
          isCommentTrayOpen: false,
          isCommentSubmitted: false,
        },
      }));
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Elite Editorial Header */}
      <header className="main-header" id="navbar">
        <div className="header-container">
          <div className="logo">
            <span className="logo-main">FLUX</span>
            <span className="logo-sub">SLATE</span>
          </div>
          <div className="header-badge">
            <span className="badge-dot"></span> PHASE 1 BETA
          </div>
        </div>
      </header>

      {/* Main Editorial Hero */}
      <main className="grow">
        <section className="hero-section reveal-section" id="hero">
          <div className="container hero-container">
            <h1 className="hero-title">
              Stop flooding your premium clients with{" "}
              <span className="italic-serif">200 loose WhatsApp images</span>.
            </h1>
            <p className="hero-subtitle">
              Flux Slate transforms your curated wedding decor inspiration into
              a stunning, interactive digital lookbook. Send a single,
              password-protected link over WhatsApp that looks like a high-end
              design magazine.
            </p>
            <div className="hero-actions">
              <button className="cta-button" onClick={openModal}>
                Request Beta Access
              </button>
              <span className="pricing-tag">
                Limited to 15 Indian Styling Firms • ₹199/mo lifetime
              </span>
            </div>
          </div>
        </section>

        {/* Lookbook Live Presentation Simulator */}
        <section className="lookbook-section reveal-section" id="lookbook-demo">
          <div className="container">
            <div className="section-tag">SIMULATED LOOKBOOK</div>
            <h2 className="section-title-small">The Client Experience</h2>

            {/* Mobile Simulator Frame */}
            <div className="phone-wrapper">
              <div className="phone-frame">
                <div className="phone-screen relative">
                  {/* Simulator Lookbook App (Active by Default) */}
                  <div
                    className="sim-lookbook-app is-active"
                    id="sim-lookbook-app"
                  >
                    <div className="sim-lookbook-header">
                      <div className="sim-brand-bar">
                        <span className="sim-brand-name">FLUX SLATE</span>
                        <span className="sim-secure-badge">🔒 SECURE LINK</span>
                      </div>
                      <div className="sim-client-identity">
                        <h4 className="sim-client-names">Mridula & Rohan</h4>
                        <p className="sim-venue-subtitle">
                          Taj Lands End, Mumbai
                        </p>
                      </div>
                    </div>

                    <div className="sim-lookbook-content">
                      {/* Concept 1 Card */}
                      <div className="sim-showcase-card">
                        <div className="sim-card-visual gradient-emerald">
                          <div className="sim-visual-grid-lines"></div>
                          <div className="sim-concept-label">
                            MANDAP CONCEPT
                          </div>

                          {/* Floating Buttons */}
                          <div className="sim-floating-actions">
                            <button
                              type="button"
                              onClick={() => toggleLikeCard("sim-canopy")}
                              className={`sim-action-btn sim-heart-btn ${simCards["sim-canopy"].isLiked ? "is-active animate-scale-pop" : ""}`}
                              aria-label="Approve"
                            >
                              <svg
                                className="heart-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleCommentTray("sim-canopy")}
                              className={`sim-action-btn sim-comment-btn ${simCards["sim-canopy"].isCommentTrayOpen ? "is-active" : ""}`}
                              aria-label="Comment"
                            >
                              <svg
                                className="comment-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              >
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              </svg>
                            </button>
                          </div>

                          {/* Approval Overlay */}
                          <div
                            className={`sim-approved-overlay ${simCards["sim-canopy"].isLiked ? "is-active" : ""}`}
                            onClick={() => removeLikeCard("sim-canopy")}
                          >
                            <div className="sim-approved-badge-wrapper">
                              <svg
                                className="approved-check"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M20 6L9 17l-5-5"></path>
                              </svg>
                              <span>Concept Approved</span>
                            </div>
                          </div>
                        </div>
                        <div className="sim-card-details">
                          <h5 className="sim-card-title">
                            01 / The Canopy & Floral Ceiling
                          </h5>
                          <p className="sim-card-description">
                            Exotic white hydrangeas and tuberose suspended in
                            cascading strings, draped elegantly in premium
                            semi-sheer georgette.
                          </p>
                        </div>

                        {/* Comments Drawer */}
                        <div
                          className={`sim-feedback-tray ${simCards["sim-canopy"].isCommentTrayOpen ? "is-active" : ""} ${simCards["sim-canopy"].isCommentSubmitted ? "submitted" : ""}`}
                        >
                          <div className="sim-feedback-tray-inner">
                            <textarea
                              className="sim-feedback-textarea"
                              placeholder="Add design feedback..."
                              rows={1}
                              value={simCards["sim-canopy"].commentInput}
                              onChange={(e) =>
                                handleCommentChange(
                                  "sim-canopy",
                                  e.target.value,
                                )
                              }
                            />
                            <div className="sim-feedback-actions">
                              <button
                                type="button"
                                className="sim-btn-cancel"
                                onClick={() => closeCommentTray("sim-canopy")}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="sim-btn-send"
                                onClick={() =>
                                  submitSimulatorComment("sim-canopy")
                                }
                              >
                                Send
                              </button>
                            </div>
                          </div>
                          <div className="sim-feedback-success-msg">
                            Feedback transmitted to studio.
                          </div>
                        </div>
                      </div>

                      {/* Concept 2 Card */}
                      <div className="sim-showcase-card">
                        <div className="sim-card-visual gradient-gold-cream">
                          <div className="sim-visual-grid-lines"></div>
                          <div className="sim-concept-label">
                            TABLESCAPE DETAIL
                          </div>

                          {/* Floating Buttons */}
                          <div className="sim-floating-actions">
                            <button
                              type="button"
                              onClick={() => toggleLikeCard("sim-tablescape")}
                              className={`sim-action-btn sim-heart-btn ${simCards["sim-tablescape"].isLiked ? "is-active animate-scale-pop" : ""}`}
                              aria-label="Approve"
                            >
                              <svg
                                className="heart-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleCommentTray("sim-tablescape")
                              }
                              className={`sim-action-btn sim-comment-btn ${simCards["sim-tablescape"].isCommentTrayOpen ? "is-active" : ""}`}
                              aria-label="Comment"
                            >
                              <svg
                                className="comment-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              >
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              </svg>
                            </button>
                          </div>

                          {/* Approval Overlay */}
                          <div
                            className={`sim-approved-overlay ${simCards["sim-tablescape"].isLiked ? "is-active" : ""}`}
                            onClick={() => removeLikeCard("sim-tablescape")}
                          >
                            <div className="sim-approved-badge-wrapper">
                              <svg
                                className="approved-check"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M20 6L9 17l-5-5"></path>
                              </svg>
                              <span>Concept Approved</span>
                            </div>
                          </div>
                        </div>
                        <div className="sim-card-details">
                          <h5 className="sim-card-title">
                            02 / Heritage Tablescape
                          </h5>
                          <p className="sim-card-description">
                            Handcrafted brass urli bowls filled with vibrant
                            marigolds, block-printed linen, and vintage candles.
                          </p>
                        </div>

                        {/* Comments Drawer */}
                        <div
                          className={`sim-feedback-tray ${simCards["sim-tablescape"].isCommentTrayOpen ? "is-active" : ""} ${simCards["sim-tablescape"].isCommentSubmitted ? "submitted" : ""}`}
                        >
                          <div className="sim-feedback-tray-inner">
                            <textarea
                              className="sim-feedback-textarea"
                              placeholder="Add design feedback..."
                              rows={1}
                              value={simCards["sim-tablescape"].commentInput}
                              onChange={(e) =>
                                handleCommentChange(
                                  "sim-tablescape",
                                  e.target.value,
                                )
                              }
                            />
                            <div className="sim-feedback-actions">
                              <button
                                type="button"
                                className="sim-btn-cancel"
                                onClick={() =>
                                  closeCommentTray("sim-tablescape")
                                }
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="sim-btn-send"
                                onClick={() =>
                                  submitSimulatorComment("sim-tablescape")
                                }
                              >
                                Send
                              </button>
                            </div>
                          </div>
                          <div className="sim-feedback-success-msg">
                            Feedback transmitted to studio.
                          </div>
                        </div>
                      </div>

                      {/* Concept 3 Card */}
                      <div className="sim-showcase-card">
                        <div className="sim-card-visual gradient-marigold">
                          <div className="sim-visual-grid-lines"></div>
                          <div className="sim-concept-label">
                            ENTRANCE EXPERIENTIAL
                          </div>

                          {/* Floating Buttons */}
                          <div className="sim-floating-actions">
                            <button
                              type="button"
                              onClick={() => toggleLikeCard("sim-welcome")}
                              className={`sim-action-btn sim-heart-btn ${simCards["sim-welcome"].isLiked ? "is-active animate-scale-pop" : ""}`}
                              aria-label="Approve"
                            >
                              <svg
                                className="heart-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleCommentTray("sim-welcome")}
                              className={`sim-action-btn sim-comment-btn ${simCards["sim-welcome"].isCommentTrayOpen ? "is-active" : ""}`}
                              aria-label="Comment"
                            >
                              <svg
                                className="comment-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              >
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              </svg>
                            </button>
                          </div>

                          {/* Approval Overlay */}
                          <div
                            className={`sim-approved-overlay ${simCards["sim-welcome"].isLiked ? "is-active" : ""}`}
                            onClick={() => removeLikeCard("sim-welcome")}
                          >
                            <div className="sim-approved-badge-wrapper">
                              <svg
                                className="approved-check"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M20 6L9 17l-5-5"></path>
                              </svg>
                              <span>Concept Approved</span>
                            </div>
                          </div>
                        </div>
                        <div className="sim-card-details">
                          <h5 className="sim-card-title">
                            03 / The Welcome Walkway
                          </h5>
                          <p className="sim-card-description">
                            Arches of fresh jasmine strings interspersed with
                            hanging brass bells, casting warm amber shadows
                            across the stone pathway.
                          </p>
                        </div>

                        {/* Comments Drawer */}
                        <div
                          className={`sim-feedback-tray ${simCards["sim-welcome"].isCommentTrayOpen ? "is-active" : ""} ${simCards["sim-welcome"].isCommentSubmitted ? "submitted" : ""}`}
                        >
                          <div className="sim-feedback-tray-inner">
                            <textarea
                              className="sim-feedback-textarea"
                              placeholder="Add design feedback..."
                              rows={1}
                              value={simCards["sim-welcome"].commentInput}
                              onChange={(e) =>
                                handleCommentChange(
                                  "sim-welcome",
                                  e.target.value,
                                )
                              }
                            />
                            <div className="sim-feedback-actions">
                              <button
                                type="button"
                                className="sim-btn-cancel"
                                onClick={() => closeCommentTray("sim-welcome")}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="sim-btn-send"
                                onClick={() =>
                                  submitSimulatorComment("sim-welcome")
                                }
                              >
                                Send
                              </button>
                            </div>
                          </div>
                          <div className="sim-feedback-success-msg">
                            Feedback transmitted to studio.
                          </div>
                        </div>
                      </div>

                      {/* Curated Color Swatches */}
                      <div className="sim-lookbook-palette">
                        <h6 className="sim-palette-title">
                          Curated Color Palette
                        </h6>
                        <div className="sim-palette-colors">
                          <div
                            className="sim-palette-color"
                            style={{ backgroundColor: "#0A5C36" }}
                          >
                            <span>Emerald</span>
                          </div>
                          <div
                            className="sim-palette-color"
                            style={{
                              backgroundColor: "#FFFDD0",
                              color: "#121212",
                            }}
                          >
                            <span>Ivory</span>
                          </div>
                          <div
                            className="sim-palette-color"
                            style={{ backgroundColor: "#D4AF37" }}
                          >
                            <span>Gold</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="sim-lookbook-footer">
                      <span>🔒 Secure Link</span>
                      <span>Flux Slate Presentation System</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Teaser Interactive Pitch CTA */}
            <div
              className="demo-interactive-cta"
              style={{ marginTop: "3rem", textAlign: "center" }}
            >
              <a
                href="/demo/mridula-rohan"
                className="cta-button"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", display: "inline-block" }}
              >
                Open Interactive Client Demo
              </a>
              <span
                className="pricing-tag"
                style={{ display: "block", marginTop: "0.8rem" }}
              >
                Experience the password protection & feedback features live
              </span>
            </div>
          </div>
        </section>

        {/* Benefits Pillars Section */}
        <section className="benefits-section reveal-section" id="benefits">
          <div className="container">
            <div className="section-tag">THE PLATFORM</div>
            <h2 className="benefits-heading">
              Designed for Elite Design Studios
            </h2>

            <div className="grid-benefits">
              <div className="benefit-card">
                <div className="benefit-num">01</div>
                <h3 className="benefit-title">Fast Mobile Upload</h3>
                <p className="benefit-description">
                  Capture inspiration on the go. Snap venue photos at the Taj or
                  clip new trends directly on your phone. Your mood boards stay
                  organized, private, and lightning-fast.
                </p>
              </div>

              <div className="benefit-card">
                <div className="benefit-num">02</div>
                <h3 className="benefit-title">One-Click Lookbooks</h3>
                <p className="benefit-description">
                  Instant editorial presentation. Transform your loose floral
                  concepts, fabrics, and layout grids into a styled digital
                  magazine link. No more messy PDFs.
                </p>
              </div>

              <div className="benefit-card">
                <div className="benefit-num">03</div>
                <h3 className="benefit-title">Client Feedback Portal</h3>
                <p className="benefit-description">
                  Seamless client sign-off. Your couples open a single link
                  inside WhatsApp, tap to approve layouts, or drop specific
                  feedback right on the image.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA action panel */}
        <section className="cta-bottom-section reveal-section">
          <div className="container text-center">
            <h2 className="cta-bottom-heading">
              Ready to elevate your presentation standards?
            </h2>
            <p className="cta-bottom-sub">
              Be one of the 15 exclusive Indian design firms to shape the future
              of wedding curation.
            </p>
            <button
              className="cta-button primary-cta"
              id="bottom-cta-btn"
              onClick={openModal}
            >
              Reserve Beta Access
            </button>
          </div>
        </section>
      </main>

      {/* Footer copyright */}
      <footer className="main-footer">
        <div className="container footer-container">
          <p className="footer-copy">
            &copy; 2026 Flux Slate. All rights reserved. Created for elite
            styling firms.
          </p>
          <p className="footer-note">Part of the Flux design ecosystem.</p>
        </div>
      </footer>

      {/* Waitlist Lead Capture Modal Overlay */}
      <div
        className={`modal-overlay ${isModalOpen ? "is-active" : ""}`}
        id="lead-modal"
        role="dialog"
        onClick={(e) => e.target === e.currentTarget && closeModal()}
      >
        <div className="modal-card">
          <button
            className="modal-close"
            onClick={closeModal}
            aria-label="Close modal"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="modal-body">
            <h2 className="modal-title" style={{ marginBottom: "1.5rem" }}>
              Select Access Tier
            </h2>

            {/* Card Tier Toggles */}
            <div className="tier-selection-container">
              {/* Free Waitlist option */}
              <div
                className={`tier-card ${selectedTier === "free_waitlist" ? "active" : ""}`}
                onClick={() => setSelectedTier("free_waitlist")}
                role="radio"
                aria-checked={selectedTier === "free_waitlist"}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    setSelectedTier("free_waitlist");
                  }
                }}
              >
                <div className="tier-badge">Free to Join</div>
                <h3 className="tier-title">Standard Waitlist</h3>
                <p className="tier-subtext">₹399/month upon launch</p>
                <div className="tier-incentive">
                  Free Waitlist Entry + Your 1st Month is{" "}
                  <strong>100% FREE</strong> upon public launch.
                </div>
              </div>

              {/* Paid Founding Creator option */}
              <div
                className={`tier-card ${selectedTier === "founding_pass" ? "active" : ""}`}
                onClick={() => setSelectedTier("founding_pass")}
                role="radio"
                aria-checked={selectedTier === "founding_pass"}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    setSelectedTier("founding_pass");
                  }
                }}
              >
                <div className="tier-badge recommended">
                  Founding Creator Pass (Recommended)
                </div>
                <h3 className="tier-title">Founding Creator Pass</h3>
                <p className="tier-subtext">₹299 one-time setup activation</p>
                <div className="tier-incentive">
                  Get <strong>3 Months Entirely FREE</strong> + Locked 50% Off
                  Lifetime Pricing (Just ₹199/month forever).
                </div>
              </div>
            </div>

            {/* Registration Input Form */}
            <form
              onSubmit={handleFormSubmit}
              className={`beta-form ${isFadingOut ? "fade-out-form" : ""}`}
              noValidate
            >
              <div className={`form-group ${nameError ? "has-error" : ""}`}>
                <label htmlFor="full-name" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full-name"
                  className="form-input"
                  placeholder="e.g. Devika Narain"
                  value={fullName}
                  ref={nameInputRef}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (e.target.value.trim()) setNameError(false);
                  }}
                  required
                />
                <span className="error-msg" id="name-error">
                  Please enter your full name.
                </span>
              </div>

              <div className={`form-group ${instaError ? "has-error" : ""}`}>
                <label htmlFor="insta-handle" className="form-label">
                  Instagram Handle
                </label>
                <div className="input-prefix-wrapper">
                  <span className="input-prefix">@</span>
                  <input
                    type="text"
                    id="insta-handle"
                    className="form-input has-prefix"
                    placeholder="devikanarainandcompany"
                    value={instaHandle.replace(/^@/, "")}
                    onChange={(e) => {
                      setInstaHandle(e.target.value);
                      if (
                        e.target.value.trim() &&
                        isValidInstaHandle(e.target.value)
                      )
                        setInstaError(false);
                    }}
                    required
                  />
                </div>
                <span className="error-msg" id="insta-error">
                  Please enter a valid Instagram handle.
                </span>
              </div>

              <div className={`form-group ${emailError ? "has-error" : ""}`}>
                <label htmlFor="business-email" className="form-label">
                  Business Email
                </label>
                <input
                  type="email"
                  id="business-email"
                  className="form-input"
                  placeholder="design@devikanarain.com"
                  value={businessEmail}
                  onChange={(e) => {
                    setBusinessEmail(e.target.value);
                    if (e.target.value.trim() && isValidEmail(e.target.value))
                      setEmailError(false);
                  }}
                  required
                />
                <span className="error-msg" id="email-error">
                  Please enter a valid business email.
                </span>
              </div>

              <button
                type="submit"
                className="form-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Submitting..."
                  : selectedTier === "free_waitlist"
                    ? "Join Free Waitlist"
                    : "Secure Founding Pass & Pay ₹299"}
              </button>
            </form>

            {/* Checkout Overlay Success viewports */}
            <div
              className={`success-state ${isSuccess ? "is-active" : ""}`}
              id="form-success-state"
            >
              <div className="success-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              {/* 1. Free Waitlist success screen */}
              {selectedTier === "free_waitlist" ? (
                <div
                  id="success-free-content"
                  className="success-tier-view is-visible"
                >
                  <h3 className="success-title">Added to Waitlist</h3>
                  <p className="success-description">
                    Your 100% Free First Month slot has been reserved
                    successfully. We will notify your studio via email as soon
                    as public onboarding begins.
                  </p>
                </div>
              ) : (
                /* 2. Paid Founding Creator Pass success screen */
                <div
                  id="success-founding-content"
                  className="success-tier-view is-visible"
                >
                  <h3 className="success-title">
                    Application Logged Successfully
                  </h3>
                  <p className="success-description">
                    To prevent automated signups and officially lock in your
                    studio's Founding Creator slot (3 Months Free + Lifetime
                    Pricing locked at ₹199/month), please complete your ₹299
                    activation deposit. Scan the official secure UPI QR code
                    below using GPay, PhonePe, or Paytm to complete your ₹299
                    verification deposit.
                  </p>

                  {/* Interactive QR frame */}
                  <div className="qr-container">
                    <img
                      src="/assets/upi-qr.png"
                      alt="Secure UPI QR Code"
                      className="qr-image"
                    />
                  </div>

                  {/* Copyable raw ID tag */}
                  <div className="upi-id-display">
                    <span className="upi-label">UPI ID:</span>
                    <span className="upi-value" id="upi-raw-val">
                      ashazshaikh111-1@okicici
                    </span>
                    <button
                      className={`upi-copy-btn ${copiedUpi ? "copied" : ""}`}
                      onClick={handleCopyUpi}
                      aria-label="Copy UPI ID"
                    >
                      {copiedUpi ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      )}
                    </button>
                  </div>

                  <p className="success-footer-subtext">
                    Reference Transaction ID:{" "}
                    <strong className="emerald-text">{randomRefId}</strong>
                  </p>
                </div>
              )}

              <button
                className="cta-button"
                onClick={closeModal}
                style={{ marginTop: "1rem" }}
              >
                Return to Lookbook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
