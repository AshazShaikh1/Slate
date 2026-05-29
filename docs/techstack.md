# Technology Stack: Flux Ecosystem

## Phase 1: Validation Landing Page (Target Folder: `/landing`)
- **Framework:** Static HTML5 / CSS3 or a lightweight React/Next.js single page (keep dependencies close to zero).
- **Styling:** Vanilla CSS or TailwindCSS (configured for luxury minimal themes: Slate/Charcoal/Emerald).
- **Forms/Lead Capture:** Simple form posting to a backend service (e.g., Formspree, Formbold) or directly into a Supabase table.

## Phase 2: Core Application (Target Folder: `/app`)
- **Framework:** Next.js (App Router).
- **Database & Auth:** Supabase (PostgreSQL for structured relational collections, rows, and tags).
- **Storage:** Supabase Storage (optimized buckets with an image resizing/WebP conversion pipeline for high-res decor photographs).
- **Styling:** TailwindCSS with strict adherence to the typography and spacing system detailed in `rules.md`.