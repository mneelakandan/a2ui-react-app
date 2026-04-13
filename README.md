# A2UI · React Integration Sample

A production-ready React application demonstrating the **A2UI (Agent-to-UI) protocol** — Google's open standard that lets AI agents generate rich, interactive user interfaces as declarative JSON, rendered natively by the client application.

## What is A2UI?

A2UI solves a fundamental problem in agentic systems: *how can a remote AI agent safely present a rich, interactive UI to the user?*

Instead of sending HTML or executable JavaScript, agents send a **declarative JSON payload** describing a component tree. The client application maps these descriptions to its own native widgets using a trusted **component catalog** — no arbitrary code execution required.

```
Agent                    A2UI Message Stream               React Client
  │                                                              │
  │──── { createSurface, updateComponents, setRoot } ──────────▶│
  │                                                         Renderer
  │◀─── { type: "ACTION", actionName: "confirm_booking" } ──────│
```

## Features

- ✅ **Full A2UI v0.9 spec** — `createSurface`, `updateComponents`, `setRoot`, `updateDataModel`
- ✅ **14 built-in components** — Text, Button, TextField, DateTimeInput, Card, Row, Column, Select, Checkbox, Slider, Badge, List, Image, Divider
- ✅ **Live data model** — two-way binding between components and a flat path-based store
- ✅ **Action dispatch** — button actions route back to your agent handler
- ✅ **Streaming simulation** — visualise incremental message delivery
- ✅ **3 demo surfaces** — Restaurant Booking, Contact Lookup, Agent Settings
- ✅ **Cloud Run ready** — Dockerfile + nginx + deploy script included

## Project Structure

```
a2ui-react-app/
├── src/
│   ├── lib/
│   │   ├── a2ui-engine.js        # Core: DataModel, Registry, SurfaceManager, Processor
│   │   └── sample-messages.js    # A2UI JSON payloads for 3 demo surfaces
│   ├── hooks/
│   │   └── useA2UI.jsx           # React context, Provider, useA2UI, useDataValue
│   ├── components/
│   │   ├── A2UIRenderer.jsx      # Component map: A2UI type → React component
│   │   └── JSONViewer.jsx        # Syntax-highlighted JSON viewer
│   ├── styles/
│   │   └── globals.css           # Tailwind + custom CSS variables
│   ├── App.jsx                   # Main application shell
│   └── main.jsx                  # React entry point
├── Dockerfile                    # Multi-stage build: Node → nginx
├── nginx.conf                    # SPA routing + gzip + security headers
├── cloudbuild.yaml               # Google Cloud Build CI/CD pipeline
├── deploy.sh                     # One-command Cloud Run deploy script
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

### Integrate A2UI Into Your Own App

**1. Set up the provider:**

```jsx
import { A2UIProvider } from './hooks/useA2UI';

function App() {
  return (
    <A2UIProvider onAction={(action) => console.log('Agent action:', action)}>
      <YourApp />
    </A2UIProvider>
  );
}
```

**2. Process A2UI messages from your agent:**

```jsx
import { useA2UI } from './hooks/useA2UI';

function AgentChat() {
  const { processor } = useA2UI();

  // When your agent responds with A2UI JSON:
  async function fetchFromAgent(userMessage) {
    const response = await fetch('/api/agent', {
      method: 'POST',
      body: JSON.stringify({ message: userMessage }),
    });
    const messages = await response.json(); // Array of A2UI messages
    processor.processMessageStream(messages);
  }
}
```

**3. Render a surface:**

```jsx
import { A2UISurface } from './components/A2UIRenderer';

function ChatUI() {
  return (
    <div>
      <p>Agent says:</p>
      <A2UISurface surfaceId="main" />
    </div>
  );
}
```

**4. Register custom components:**

```jsx
import { useA2UI } from './hooks/useA2UI';

function MyApp() {
  const { registry } = useA2UI();

  // Register your own component under a custom catalog type
  registry.register('MapView', ({ props }) => (
    <iframe src={`https://maps.google.com/?q=${props.location}`} />
  ));
}
```

## A2UI Message Format (v0.9)

### Create a surface
```json
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "booking",
    "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json"
  }
}
```

### Add components
```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "booking",
    "components": [
      {
        "id": "title",
        "component": {
          "Text": {
            "text": { "literalString": "Book Your Table" },
            "usageHint": "h1"
          }
        }
      },
      {
        "id": "confirm-btn",
        "component": {
          "Button": {
            "label": "Confirm",
            "action": { "name": "confirm_booking" },
            "variant": "primary"
          }
        }
      }
    ]
  }
}
```

### Set root component
```json
{
  "version": "v0.9",
  "setRoot": { "surfaceId": "booking", "componentId": "title" }
}
```

### Update data model
```json
{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "booking",
    "path": "/reservation/date",
    "value": "2026-04-15"
  }
}
```

## Deploy to Cloud Run

### Prerequisites
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed
- Docker installed
- A GCP project with billing enabled

### One-command deploy

```bash
# Set your project ID
export GOOGLE_CLOUD_PROJECT=your-project-id

# Make deploy script executable and run
chmod +x deploy.sh
./deploy.sh
```

### Manual steps

```bash
# 1. Build the React app
npm run build

# 2. Build Docker image (linux/amd64 for Cloud Run)
docker build --platform linux/amd64 -t gcr.io/YOUR_PROJECT/a2ui-react-app .

# 3. Push to Google Container Registry
gcloud auth configure-docker
docker push gcr.io/YOUR_PROJECT/a2ui-react-app

# 4. Deploy to Cloud Run
gcloud run deploy a2ui-react-app \
  --image gcr.io/YOUR_PROJECT/a2ui-react-app \
  --platform managed \
  --region asia-south1 \
  --port 8080 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --memory 256Mi
```

### CI/CD with Cloud Build

```bash
# Connect your GitHub repo and create a trigger
gcloud beta builds triggers create github \
  --repo-name=a2ui-react-app \
  --repo-owner=YOUR_GITHUB_ORG \
  --branch-pattern=^main$ \
  --build-config=cloudbuild.yaml

# Or manually trigger a build
gcloud builds submit --config=cloudbuild.yaml .
```

The `cloudbuild.yaml` pipeline:
1. Builds the Docker image with layer caching
2. Pushes to Google Container Registry (tagged with commit SHA + `latest`)
3. Deploys the new revision to Cloud Run with zero-downtime rollout

## Component Catalog Reference

| Component | Key Props | Description |
|-----------|-----------|-------------|
| `Text` | `text`, `usageHint` (`h1`/`h2`/`body`/`label`/`caption`) | Displays text |
| `Button` | `label`/`child`, `action`, `variant` (`primary`/`secondary`/`ghost`/`danger`) | Clickable button, dispatches action |
| `TextField` | `label`, `placeholder`, `value.path` | Text input, bound to data model |
| `DateTimeInput` | `label`, `value.path`, `enableDate`, `enableTime` | Date/time picker |
| `Select` | `label`, `value.path`, `options[]` | Dropdown selector |
| `Checkbox` | `label`, `value.path` | Boolean toggle |
| `Slider` | `label`, `value.path`, `min`, `max` | Numeric range input |
| `Card` | `children[]`, `elevation` | Container with surface styling |
| `Row` | `children[]`, `gap`, `align` | Horizontal flex container |
| `Column` | `children[]`, `gap` | Vertical flex container |
| `Badge` | `label`, `color` (`default`/`success`/`warning`/`error`/`info`) | Inline status pill |
| `List` | `items[]` | Bulleted list of strings |
| `Image` | `src`, `alt` | Image with border |
| `Divider` | — | Horizontal rule |

## References

- [A2UI Official Site](https://a2ui.org)
- [GitHub: google/A2UI](https://github.com/google/A2UI)
- [A2UI Quickstart](https://a2ui.org/quickstart/)
- [Google Developers Blog Announcement](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/)

## License

Apache 2.0 — same as the A2UI project itself.
