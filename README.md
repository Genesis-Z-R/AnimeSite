# AnimeSite

AnimeSite is a client-side web application crafted for looking up, streaming, and tracking anime content. It interfaces directly with a remote backend proxy API layer to deliver continuous search results and real-time media feeds. The user interface features a specialized glassmorphism aesthetic built using Tailwind CSS utility structures.

---

## Technical Stack Architecture

* **Frontend Framework:** React 19 single-page client built within a fast Vite pipeline.
* **Video Playback Engine:** Artplayer (`artplayer`), a component player framework integrated directly with HTTP Live Streaming via `hls.js` to manage live adaptive M3U8 streaming playback.
* **Styling Mechanics:** Tailwind CSS 4 (`@tailwindcss/vite`) with custom `clsx` and `tailwind-merge` functions to support glassmorphism layers and smooth component transition states.
* **Routing Strategy:** Native browser path mapping handled clientside via `react-router-dom`.

---

## Core Features

### 1. Unified Search & Ingestion Pipeline

* **Real-Time Catalog Filtering:** Queries are routed via decoupled `axios` protocols to query titles immediately.
* **Resource Mapping:** The API maps custom objects (`SearchResponse`, `EpisodeHandlerResponse`) directly to components.

### 2. Stream Throttling & Decryption

* **Episode Server Multi-Tenancy:** Calls to `AnimeEpisodeHandler` dynamically fetch streaming mirror locations for a designated episode hash ID.
* **Iframe Link Decoding:** Integrates an active link decoding channel (`/decodevidstreamingiframeURL`) designed to translate raw embedding frames into clean, readable source vectors for native client player injection.

### 3. Glassmorphism Design Elements

* **GlassBox Framework:** A modular UI wrapper component that combines an opaque backdrop filter layer (`backdrop-blur-md bg-slate-900/40`) with thin accent borders (`border-white/5`) to provide a sleek layout look.

---

## API Connection Schema

The service connects directly to a primary upstream Render microservice endpoint:

```text
https://animesite-zx6n.onrender.com/api/v1

```

### Supported API Actions:

* `GET /Search/:query` — Performs a URI-encoded look-up against the catalog database.
* `GET /AnimeEpisodeHandler/:id` — Fetches active streaming servers.
* `GET /decodevidstreamingiframeURL?url=:iframeUrl` — Decrypts target video frames to isolate standard video files.

---

## Project Structure

```text
├── public/                 # Static visual components and app background textures
├── src/
│   ├── components/         # Reusable UI elements (AnimeCard, AnimeSearch, GlassBox, AnimePlayer)
│   ├── lib/                # Internal engineering utils (cn class merge helpers)
│   ├── pages/              # Application route screens (Home, Watch, AnimeInfo)
│   ├── services/           # Network management service layer (api.ts instances)
│   ├── types.ts            # Core TypeScript model and API response declarations
│   ├── App.tsx             # Main client router layout definitions
│   ├── index.css           # Core configuration files for Tailwind CSS v4 directives
│   └── main.tsx            # Root application bootstrap mount point
├── package.json            # Module manifest and script definitions
└── vite.config.ts          # Core Vite configurations and Tailwind integration hooks

```

---

## Installation & Setup

### Prerequisites

Make sure your development machine has **Node.js** installed (v18.x or higher recommended).

### 1. Initialize Project Workspaces

Clone the repository, enter the project root, and deploy the required node dependencies:

```bash
git clone https://github.com/your-username/AnimeSite.git
cd AnimeSite
npm install

```

### 2. Execution Scripts

* **Development Sandbox:** Starts a local development environment accessible at port `3000` on your network:
```bash
npm run dev

```


* **Production Ingestion Build:** Lints and builds optimal static build production files within the local `/dist` target path:
```bash
npm run build

```


* **Production Preview Mode:** Launches a localized server to check the performance of your compiled production code:
```bash
npm run preview

```


* **Static Type-Checking:** Compiles files via the TypeScript compiler with configuration parameters set to prevent output writes:
```bash
npm run lint

```


* **Asset Clean Routine:** Sweeps out prior compiled bundle targets:
```bash
npm run clean

```
