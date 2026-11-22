# Project R – Beyond Digital

A futuristic 3D developer portfolio for **Raveesha** (IT Undergraduate at SLIIT Matara Campus), built with React 19, TypeScript, Tailwind CSS v4, Three.js, Express, Gemini AI (`@google/genai`), and Firebase.

## Key Features

- **3D Digital Universe Background (`DigitalUniverseCanvas`)**: Interactive WebGL starfield, floating geometric wireframe structures, orbital rings, mouse parallax, visibility-pause, and reduced-motion fallbacks.
- **Dark & Light Theme Support**: Purple-blue glassmorphism across both dark (`#080B1A` / `#0D1024`) and light themes, persisted in `localStorage`.
- **Interactive Galaxy Navigation (`GalaxyNavigation`)**: Orbital planet constellation modal representing `Home`, `About`, `Skills`, `Projects`, `Education`, `Achievements`, and `Contact`, paired with a responsive top navigation bar.
- **3D Floating Digital Identity Card (`HeroSection` & `AboutSection`)**: Pointer-reactive perspective tilt profile cards with editable portrait and university metadata.
- **3D Technology Globe (`TechGlobe3D`)**: Interactive rotating Three.js globe dynamically populated from Raveesha's verified skills across Programming Languages, Web Development, Mobile Development, IoT and Embedded Systems, and Tools & Technologies (no invented percentages).
- **3D Rotating Project Cube & Hologram Previews (`ProjectsCube3D` & `ProjectsSection`)**: Interactive 6-face drag/touch cube with automatic paginated sets (`1–6 of N`) and holographic project preview cards opening a full media modal.
- **Verified AI Portfolio Assistant (`PortfolioAssistant` & `/api/assistant`)**: Server-side `@google/genai` integration grounded strictly on verified portfolio data without fabricated claims.
- **Interactive Developer Terminal (`DeveloperTerminal`)**: Functional CLI supporting `help`, `about`, `skills`, `projects`, `education`, `achievements`, `contact`, and `clear`, with command history and Tab autocomplete.
- **Digital Journey & Verified Activity (`DigitalJourneySection`)**: Milestone feed and summary metrics computed directly from stored education, projects, achievements, and skills.
- **Admin Dashboard (`#admin`)**: Firebase Authentication-gated studio (`it26101283@my.sliit.lk`) for editing profile, skills, unlimited projects, education, journey milestones, certificates, QR codes, and reviewing contact inbox messages.

## Environment Variables

Configure these server-side environment variables in your `.env` or AI Studio Secrets panel (see `.env.example`):

- `GEMINI_API_KEY`: Required for `POST /api/assistant` (AI Portfolio Assistant).
- `APP_URL`: Application base URL.
- `PORT`: Server port (defaults to `3000`).

Firebase client overrides (`VITE_FIREBASE_*`) are optional and default to the configured `my-portfolio-46f69` project.

## Local Development & Production

```bash
# Install dependencies
npm install

# Run full-stack Express + Vite dev server on port 3000
npm run dev

# Build frontend bundle for production
npm run build

# Start production Express server (serves dist/ and /api/*)
npm start
```
