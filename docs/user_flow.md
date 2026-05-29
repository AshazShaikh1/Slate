# Flux Slate — Product Blueprint & User Flow

## 1. System Architecture Layout
/flux-slate-root
├── /docs
│   ├── idea.md
│   ├── rules.md
│   └── techstack.md
├── /landing
│   ├── index.html        # Main Validation Landing Page
│   ├── style.css
│   └── script.js
└── /demo
└── /mridula-rohan
├── index.html    # The Zero-Code Interactive Demo Lookbook
├── style.css
└── script.js


---

## 2. End-to-End Core Product Flow

### Phase 1: Mobile Curation ("The Inbox")
- **Context:** The designer finishes an on-site consultation at a venue (e.g., Taj Lands End, Mumbai) and wants to quickly log ideas on their phone.
- **Action:** Opens `slate.flux.app`. The user dashboard loads instantly on a clean mobile-viewport browser window.
- **UI Interaction:** - Pure obsidian black canvas (`#0A0A0A`) with a floating circular **Emerald Green Plus (+) Button** at the bottom center.
  - Tapping the `+` button smoothly slides up a native-feeling mobile sheet: `[Take Photo]` or `[Upload from Library]`.
  - User selects 6 high-res asset photos (mandaps, floral arches, table cutlery layout designs).
  - An emerald loading ring spins smoothly around the floating button as files upload.
  - The uploads display via a fluid masonry grid utilizing a soft CSS blur fade-in to prevent lag.
  - Tapping an uploaded card opens a clean text field to attach labels (e.g., typing `Table Styling` or `Main Mandap Canvas`).

### Phase 2: Structuring the Visual Presentation ("The Canvas")
- **Context:** The designer sits down later to package these raw images into a premium presentation.
- **Action:** Enters the collection panel from the top navigation.
- **UI Interaction:**
  - Taps `+ New Collection` and blinks a minimal terminal-like cursor to type: `Mridula & Rohan — Taj Lands End`.
  - Selects the uploaded images from the Inbox view and hits a bulk `Move to Collection` action.
  - Enters the new collection folder and toggles the layout engine configuration options: `[Classic Grid]`, `[Editorial Magazine]`, or `[Asymmetric Minimalist]`.
  - Selects **Editorial Magazine** style: The CSS auto-calculates image priority, placing the primary floral archway as a dramatic full-bleed feature hero block while placing secondary detail swatches in side-by-side modular tiles below it.
  - Clicks a subtle ink pen icon below the primary banner to write custom design notes via a lightweight markdown inline field. The text renders in a clean, elegant editorial serif font.

### Phase 3: Exclusivity Controls ("The Pitch Link")
- **Context:** Generating the external presentation link to pitch the client over mobile messaging channels.
- **Action:** Taps the high-visibility `Share Lookbook` icon at the top right of the active project view.
- **UI Interaction:**
  - A modal panel fades into position over a glassmorphic blurred background.
  - User toggles a switch to activate `Enable Client Feedback Portal`.
  - User toggles a second security option labeled `Password Protection` and defines a temporary phrase: `tajdecember`.
  - Taps `Copy Secure Link` which runs a clipboard transaction engine and flashes a micro-interaction alert: *"Link copied to clipboard."*
  - Designer opens WhatsApp and drops the premium short-link directly to the bride: `slate.flux.app/demo/mridula-rohan`.

### Phase 4: Interactive Client Sign-Off ("The Close")
- **Context:** The premium client opens the pitch link over WhatsApp on a mobile viewport.
- **Action:** Accesses the password screen and reviews the proposal.
- **UI Interaction:**
  - Screen requests authentication code entry. Client inputs `tajdecember`.
  - The personalized visual lookbook rolls up from the screen edge with an effortless scroll acceleration feel.
  - The editorial framework formats text and images beautifully to give the feel of browsing an interactive luxury Vogue issue on mobile.
  - At the bottom corner of every individual image layout block, two micro-icons float gracefully: an emerald **Heart Icon** (Approve) and a slate **Speech Bubble Icon** (Comment).
  - Client taps the Heart Icon on approved elements—turning it into an absolute filled emerald accent state.
  - Client taps the Speech Bubble Icon on alternative elements to open an elegant inline keyboard tray: typing *"Can we swap the brass stands for matte silver lanterns instead?"* and hits submit.
  - Instantly, an asynchronous background trigger passes a push notification straight to the designer's main works