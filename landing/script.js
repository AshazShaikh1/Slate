/**
 * Flux Slate — Phase 1 Landing Page Core Logic
 * Handles modal controls, tier selections, validation, Supabase integration, and success states.
 */

// Supabase Connection Configuration (Placeholders / Runtime Env)
let SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
let SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
let supabase = null;

async function initSupabase() {
  // 1. Try to read from environment variables (bundler environments)
  try {
    if (typeof process !== "undefined" && process.env) {
      if (process.env.SUPABASE_URL) SUPABASE_URL = process.env.SUPABASE_URL;
      if (process.env.SUPABASE_ANON_KEY)
        SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    }
  } catch (e) {}

  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      if (import.meta.env.VITE_SUPABASE_URL)
        SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      if (import.meta.env.VITE_SUPABASE_ANON_KEY)
        SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
    }
  } catch (e) {}

  // 2. Try fetching .env file dynamically if placeholders are still present
  const isPlaceholder =
    SUPABASE_URL === "YOUR_SUPABASE_PROJECT_URL" ||
    SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY";
  if (isPlaceholder && typeof window !== "undefined") {
    try {
      // Attempt to load .env from root or parent directory relative to site
      const response = await fetch("/.env")
        .catch(() => fetch("../.env"))
        .catch(() => fetch(".env"));
      if (response && response.ok) {
        const text = await response.text();
        const lines = text.split("\n");
        lines.forEach((line) => {
          const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/);
          if (match) {
            const key = match[1].trim();
            let val = match[2].trim();
            // Strip trailing inline comments if any
            if (val.includes("#")) {
              val = val.split("#")[0].trim();
            }
            // Strip quotes
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            if (key === "SUPABASE_URL" || key === "VITE_SUPABASE_URL") {
              SUPABASE_URL = val;
            }
            if (
              key === "SUPABASE_ANON_KEY" ||
              key === "VITE_SUPABASE_ANON_KEY"
            ) {
              SUPABASE_ANON_KEY = val;
            }
          }
        });
      }
    } catch (e) {
      console.warn("Dynamic .env fetch skipped or failed:", e);
    }
  }

  // 3. Initialize Supabase if keys look valid and Supabase library is loaded
  const isMock =
    SUPABASE_URL === "YOUR_SUPABASE_PROJECT_URL" ||
    !SUPABASE_URL.startsWith("http");
  if (!isMock && typeof window !== "undefined" && window.supabase) {
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log(
        "%c💎 FLUX SLATE — Supabase client active",
        "color: #10B981; font-weight: bold;",
      );
    } catch (err) {
      console.error("Supabase initialization failed:", err);
    }
  } else {
    console.log(
      "%cℹ️ FLUX SLATE — Dynamic environment keys not found. Using offline/mock state.",
      "color: #3B82F6; font-style: italic;",
    );
  }
}

// Run initialization
initSupabase();

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const triggerModalBtn = document.getElementById("trigger-modal-btn");
  const bottomCtaBtn = document.getElementById("bottom-cta-btn");
  const leadModal = document.getElementById("lead-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const betaForm = document.getElementById("beta-access-form");
  const successState = document.getElementById("form-success-state");
  const successCloseBtn = document.getElementById("success-close-btn");

  // Inputs & Error Elements
  const fullNameInput = document.getElementById("full-name");
  const instaHandleInput = document.getElementById("insta-handle");
  const businessEmailInput = document.getElementById("business-email");
  const tierSelectedInput = document.getElementById("tier-selected-input");
  const submitBtn = document.getElementById("submit-btn");

  const nameError = document.getElementById("name-error");
  const instaError = document.getElementById("insta-error");
  const emailError = document.getElementById("email-error");

  // Selectable Tier Cards
  const tierFreeCard = document.getElementById("tier-free");
  const tierFoundingCard = document.getElementById("tier-founding");

  // ----------------------------------------------------
  // 1. Selectable Access Tiers Logic
  // ----------------------------------------------------
  const selectTier = (tier) => {
    if (tier === "free_waitlist") {
      tierFreeCard.classList.add("active");
      tierFreeCard.setAttribute("aria-checked", "true");

      tierFoundingCard.classList.remove("active");
      tierFoundingCard.setAttribute("aria-checked", "false");

      tierSelectedInput.value = "free_waitlist";
      submitBtn.textContent = "Join Free Waitlist";
    } else {
      tierFoundingCard.classList.add("active");
      tierFoundingCard.setAttribute("aria-checked", "true");

      tierFreeCard.classList.remove("active");
      tierFreeCard.setAttribute("aria-checked", "false");

      tierSelectedInput.value = "founding_pass";
      submitBtn.textContent = "Secure Founding Pass & Pay ₹299";
    }
  };

  if (tierFreeCard) {
    tierFreeCard.addEventListener("click", () => selectTier("free_waitlist"));
    tierFreeCard.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        selectTier("free_waitlist");
      }
    });
  }

  if (tierFoundingCard) {
    tierFoundingCard.addEventListener("click", () =>
      selectTier("founding_pass"),
    );
    tierFoundingCard.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        selectTier("founding_pass");
      }
    });
  }

  // ----------------------------------------------------
  // 2. Modal Controls
  // ----------------------------------------------------
  const openModal = () => {
    leadModal.classList.add("is-active");
    leadModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
    fullNameInput.focus();
  };

  const closeModal = () => {
    leadModal.classList.remove("is-active");
    leadModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // Restore scrolling

    // Reset form and errors after transition completes
    setTimeout(() => {
      resetForm();
    }, 400);
  };

  const resetForm = () => {
    betaForm.reset();
    successState.classList.remove("is-active");

    // Reset default tier selection (Option 2 is active)
    selectTier("founding_pass");

    // Remove fade out classes
    const passCards = document.querySelectorAll(".tier-card");
    if (betaForm) betaForm.classList.remove("fade-out-form");
    passCards.forEach((c) => c.classList.remove("fade-out-card"));

    // Remove error classes
    document.querySelectorAll(".form-group").forEach((group) => {
      group.classList.remove("has-error");
    });
  };

  // Event Listeners for Modal Toggle
  if (triggerModalBtn) triggerModalBtn.addEventListener("click", openModal);
  if (bottomCtaBtn) bottomCtaBtn.addEventListener("click", openModal);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (successCloseBtn) successCloseBtn.addEventListener("click", closeModal);

  // Protect backdrop click from crashing the script if element is parsing slowly
  if (leadModal) {
    leadModal.addEventListener("click", (e) => {
      if (e.target === leadModal) {
        closeModal();
      }
    });
  }

  // Close modal on Escape key press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && leadModal.classList.contains("is-active")) {
      closeModal();
    }
  });

  // ----------------------------------------------------
  // 3. Validation Helpers
  // ----------------------------------------------------
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const isValidInstaHandle = (handle) => {
    const cleaned = handle.replace(/^@/, "").trim();
    if (cleaned.length === 0 || cleaned.length > 30) return false;
    const instaRegex = /^[a-zA-Z0-9._]+$/;
    return instaRegex.test(cleaned);
  };

  // ----------------------------------------------------
  // 4. Form Submission & Supabase Storage Flow
  // ----------------------------------------------------
  betaForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Values
    const nameVal = fullNameInput.value.trim();
    let rawInsta = instaHandleInput.value.trim();
    const emailVal = businessEmailInput.value.trim();
    const selectedTier = tierSelectedInput.value;

    // Auto-prepend '@' to Instagram handle if user forgot it
    if (rawInsta && !rawInsta.startsWith("@")) {
      rawInsta = "@" + rawInsta;
      instaHandleInput.value = rawInsta;
    }

    let hasErrors = false;

    // Name Validation
    if (!nameVal) {
      fullNameInput.parentElement.classList.add("has-error");
      hasErrors = true;
    } else {
      fullNameInput.parentElement.classList.remove("has-error");
    }

    // Instagram Handle Validation
    if (!rawInsta || !isValidInstaHandle(rawInsta)) {
      instaHandleInput.parentElement.parentElement.classList.add("has-error");
      hasErrors = true;
    } else {
      instaHandleInput.parentElement.parentElement.classList.remove(
        "has-error",
      );
    }

    // Email Validation
    if (!emailVal || !isValidEmail(emailVal)) {
      businessEmailInput.parentElement.classList.add("has-error");
      hasErrors = true;
    } else {
      businessEmailInput.parentElement.classList.remove("has-error");
    }

    // Stop submission if there are validation errors
    if (hasErrors) return;

    // Print payload for verification
    const signupPayload = {
      full_name: nameVal,
      instagram: rawInsta,
      email: emailVal,
      tier_selected: selectedTier,
      payment_status: "pending",
      timestamp: new Date().toISOString(),
    };

    console.group(
      "%c💎 FLUX SLATE — Lead Registered",
      "color: #10B981; font-weight: bold; font-size: 13px;",
    );
    console.log("Payload: ", JSON.stringify(signupPayload, null, 2));
    console.groupEnd();

    // 1. Fade out the input fields and selection cards inside the modal
    if (betaForm) betaForm.classList.add("fade-out-form");
    const passCards = document.querySelectorAll(".tier-card");
    passCards.forEach((c) => c.classList.add("fade-out-card"));

    const revertFormFadeOut = () => {
      if (betaForm) betaForm.classList.remove("fade-out-form");
      passCards.forEach((c) => c.classList.remove("fade-out-card"));
    };

    // 2. Setup success state views toggles
    const showSuccessState = () => {
      const successFreeView = document.getElementById("success-free-content");
      const successFoundingView = document.getElementById(
        "success-founding-content",
      );

      // Hide both initially
      successFreeView.classList.remove("is-visible");
      successFoundingView.classList.remove("is-visible");

      if (selectedTier === "free_waitlist") {
        successFreeView.classList.add("is-visible");
      } else {
        // Generate and inject random tracking reference ID: FX-[Random 5-digit number]
        const randomRefNum = Math.floor(10000 + Math.random() * 90000);
        const refSpan = document.getElementById("txn-ref-id");
        if (refSpan) {
          refSpan.textContent = `FX-${randomRefNum}`;
        }
        successFoundingView.classList.add("is-visible");
      }

      // Smooth fade-in overlay trigger
      setTimeout(() => {
        successState.classList.add("is-active");
      }, 400);
    };

    // 3. Database Insertion Process
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "Submitting...";
    submitBtn.disabled = true;

    const isMockSupabase =
      !supabase ||
      SUPABASE_URL.includes("YOUR_SUPABASE") ||
      SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");

    if (isMockSupabase) {
      console.log(
        "%cℹ️ Supabase is in placeholder/mock state. Simulating database insertion.",
        "color: #3B82F6; font-style: italic;",
      );
      setTimeout(() => {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        showSuccessState();
      }, 600);
    } else {
      // Real Supabase DB client insert call
      supabase
        .from("registrations")
        .insert([
          {
            full_name: signupPayload.full_name,
            instagram: signupPayload.instagram,
            email: signupPayload.email,
            tier_selected: signupPayload.tier_selected,
            payment_status: signupPayload.payment_status,
          },
        ])
        .then(({ error }) => {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
          if (error) {
            console.error("Supabase DB insertion error:", error);
            alert("Submission failed: " + error.message);
            revertFormFadeOut();
          } else {
            showSuccessState();
          }
        })
        .catch((err) => {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
          console.error("Database connection error:", err);
          alert(
            "Database connection failed. Please check your credentials or network and try again.",
          );
          revertFormFadeOut();
        });
    }
  });

  // Realtime validation clearing on input focus / input event
  fullNameInput.addEventListener("input", () => {
    if (fullNameInput.value.trim()) {
      fullNameInput.parentElement.classList.remove("has-error");
    }
  });

  instaHandleInput.addEventListener("input", () => {
    if (
      instaHandleInput.value.trim() &&
      isValidInstaHandle(instaHandleInput.value)
    ) {
      instaHandleInput.parentElement.parentElement.classList.remove(
        "has-error",
      );
    }
  });

  businessEmailInput.addEventListener("input", () => {
    if (
      businessEmailInput.value.trim() &&
      isValidEmail(businessEmailInput.value)
    ) {
      businessEmailInput.parentElement.classList.remove("has-error");
    }
  });

  // UPI ID Clipboard Copy Logic
  const upiCopyBtn = document.getElementById("upi-copy-trigger");
  const upiRawVal = document.getElementById("upi-raw-val");

  if (upiCopyBtn && upiRawVal) {
    upiCopyBtn.addEventListener("click", () => {
      const upiIdText = upiRawVal.textContent.trim();
      navigator.clipboard
        .writeText(upiIdText)
        .then(() => {
          upiCopyBtn.classList.add("copied");
          const originalSvg = upiCopyBtn.innerHTML;

          // Switch copy icon to checkmark icon
          upiCopyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg>`;

          setTimeout(() => {
            upiCopyBtn.classList.remove("copied");
            upiCopyBtn.innerHTML = originalSvg;
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy UPI ID:", err);
        });
    });
  }

  // ----------------------------------------------------
  // 5. Lookbook Simulator Interactive Controls
  // ----------------------------------------------------
  const simCards = document.querySelectorAll(".sim-showcase-card");

  simCards.forEach((card) => {
    const cardId = card.getAttribute("data-sim-card-id");
    const heartBtn = card.querySelector(".sim-heart-btn");
    const commentBtn = card.querySelector(".sim-comment-btn");
    const approvedOverlay = card.querySelector(".sim-approved-overlay");

    // Inline Feedback elements
    const feedbackTray = card.querySelector(".sim-feedback-tray");
    const textarea = card.querySelector(".sim-feedback-textarea");
    const cancelBtn = card.querySelector(".sim-btn-cancel");
    const sendBtn = card.querySelector(".sim-btn-send");

    // Toggle Approval (Heart)
    const toggleApproval = () => {
      const isApproved = heartBtn.classList.toggle("is-active");

      if (isApproved) {
        approvedOverlay.classList.add("is-active");
        // Auto-close feedback tray if open
        closeFeedbackTray();
      } else {
        approvedOverlay.classList.remove("is-active");
      }
    };

    if (heartBtn) heartBtn.addEventListener("click", toggleApproval);

    // Allow clicking the overlay backdrop to cancel approval
    if (approvedOverlay) {
      approvedOverlay.addEventListener("click", () => {
        heartBtn.classList.remove("is-active");
        approvedOverlay.classList.remove("is-active");
      });
    }

    // Toggle Comments Drawer
    const toggleFeedbackTray = () => {
      const isOpen = feedbackTray.classList.toggle("is-active");
      commentBtn.classList.toggle("is-active", isOpen);

      if (isOpen) {
        textarea.focus();
      }
    };

    const closeFeedbackTray = () => {
      feedbackTray.classList.remove("is-active");
      commentBtn.classList.remove("is-active");
      // Clean values if they cancel
      setTimeout(() => {
        if (!feedbackTray.classList.contains("submitted")) {
          textarea.value = "";
        }
      }, 300);
    };

    if (commentBtn) commentBtn.addEventListener("click", toggleFeedbackTray);
    if (cancelBtn) cancelBtn.addEventListener("click", closeFeedbackTray);

    // Send Feedback Transaction
    if (sendBtn) {
      sendBtn.addEventListener("click", () => {
        const commentText = textarea.value.trim();

        if (!commentText) {
          textarea.focus();
          return;
        }

        // Construct structural transaction payload
        const feedbackPayload = {
          cardId: cardId,
          comment: commentText,
          timestamp: new Date().toISOString(),
          client: "Mridula & Rohan Simulator Mock",
        };

        // Asynchronous log transmission for validation verification
        console.group(
          "%c💬 FLUX SLATE — Simulator Feedback Transmitted",
          "color: #10B981; font-weight: bold; font-size: 13px;",
        );
        console.log("Concept ID: ", feedbackPayload.cardId);
        console.log("Feedback:   ", feedbackPayload.comment);
        console.log("Timestamp:  ", feedbackPayload.timestamp);
        console.log("Payload:    ", JSON.stringify(feedbackPayload, null, 2));
        console.groupEnd();

        // Trigger premium validation animations in tray
        feedbackTray.classList.add("submitted");

        // Clear input
        textarea.value = "";

        // Transition tray closed and reset state after reading window
        setTimeout(() => {
          feedbackTray.classList.remove("is-active");
          feedbackTray.classList.remove("submitted");
          commentBtn.classList.remove("is-active");
        }, 3000);
      });
    }
  });
});
