/**
 * Flux Slate — Phase 2 Interactive Demo Lookbook Logic
 * Handles passcode authorization, visual card feedback transitions, and inline comments.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------------------------------
  // DOM Elements
  // ----------------------------------------------------
  const gateForm = document.getElementById("gate-form");
  const gatePassword = document.getElementById("gate-password");
  const gateError = document.getElementById("gate-error");
  const accessGate = document.getElementById("access-gate");
  const lookbookApp = document.getElementById("lookbook-app");

  // ----------------------------------------------------
  // 1. Password Access Gate Verification
  // ----------------------------------------------------
  if (gateForm) {
    gateForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const passcode = gatePassword.value.trim().toLowerCase();
      const correctPasscode = "tajdecember";

      if (passcode === correctPasscode) {
        // Clear any existing error state
        gateError.style.display = "none";

        // Play smooth transition: fade out access gate
        accessGate.classList.add("fade-out");

        // Roll up main lookbook application after fade out begins
        setTimeout(() => {
          lookbookApp.classList.add("is-active");
          // Enable page scrolling on body once lookbook is loaded
          document.body.style.overflow = "";
        }, 150);

        // Fully remove gate from flow after transition finishes
        setTimeout(() => {
          accessGate.style.display = "none";
        }, 750);
      } else {
        // Show errors with micro-shake animation
        gateError.style.display = "block";
        gatePassword.value = "";
        gatePassword.focus();

        // Force a layout reflow to re-trigger CSS animations
        gateError.style.animation = "none";
        void gateError.offsetWidth;
        gateError.style.animation = null;
      }
    });
  }

  // ----------------------------------------------------
  // 2. Interactive Card Core Controls
  // ----------------------------------------------------
  const cards = document.querySelectorAll(".showcase-card");

  cards.forEach((card) => {
    const cardId = card.getAttribute("data-card-id");
    const heartBtn = card.querySelector(".heart-btn");
    const commentBtn = card.querySelector(".comment-btn");
    const approvedOverlay = card.querySelector(".approved-overlay");

    // Inline Feedback elements
    const feedbackTray = card.querySelector(".feedback-tray");
    const textarea = card.querySelector(".feedback-textarea");
    const cancelBtn = card.querySelector(".btn-cancel-feedback");
    const sendBtn = card.querySelector(".btn-send-feedback");

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
        // Smooth scroll helper to keep input centered on mobile
        setTimeout(() => {
          feedbackTray.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 200);
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
          client: "Mridula & Rohan Portfolio Pitch",
        };

        // Asynchronous log transmission for validation verification
        console.group(
          "%c💬 FLUX SLATE — Client Feedback Transmitted",
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

  // Disable default body scrolling initially (while password gate is up)
  if (accessGate && accessGate.style.display !== "none") {
    document.body.style.overflow = "hidden";
  }
});
