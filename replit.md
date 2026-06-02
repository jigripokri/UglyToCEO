# Ugly to CEO - AI Professional Headshot Generator

## Overview

Ugly to CEO is a web application that transforms casual photos into professional headshots using Google's Gemini AI image generation models. Users upload their photos, select customization options (AI model and background color), and receive AI-enhanced professional headshots with a before/after comparison view.

The application uses a full-stack TypeScript architecture with React on the frontend and Express on the backend, featuring a clean, studio-quality design aesthetic with professional animations and visual effects.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**UI Components**: Shadcn UI component library (New York style) with Radix UI primitives for accessible, composable components. The design system uses Tailwind CSS v4 with custom theming.

**Design Philosophy**: Clean, minimalist studio aesthetic with:
- Professional white and warm neutral color palette
- Custom fonts: Inter for UI, Cormorant Garamond for display text
- Glass morphism effects and soft shadows
- Smooth animations using Framer Motion
- Celebration effects with canvas-confetti

**State Management**: 
- TanStack Query (React Query) for server state and API calls
- Local component state with React hooks
- No global state management library (Redux, Zustand, etc.)

**Routing**: Wouter for lightweight client-side routing (single route architecture - homepage only).

**Key Features**:
- Drag-and-drop file upload with react-dropzone
- Before/after image comparison slider (react-compare-slider)
- Real-time image processing feedback
- Responsive design for mobile and desktop
- Toast notifications for user feedback

### Backend Architecture

**Framework**: Express.js with TypeScript, running as an ES module.

**API Design**: REST API with a single transformation endpoint (`POST /api/transform`) that accepts multipart form data with image files.

**File Processing**: Multer middleware for handling image uploads with:
- In-memory storage (no disk persistence)
- 10MB file size limit
- Support for common image formats (JPEG, PNG, WebP)

**Image Transformation Pipeline**:
1. Receive uploaded image via multipart form data
2. Convert image buffer to base64
3. Send to Google Gemini AI with custom prompt
4. Receive generated professional headshot
5. Return base64-encoded result to client

**Server Configuration**:
- Development: Vite middleware mode with HMR
- Production: Static file serving from compiled build
- Custom logging middleware for request/response tracking
- CORS and session handling ready (dependencies installed but not actively used)

### Data Storage

**Implementation**: PostgreSQL database via Neon serverless driver with Drizzle ORM. The database is actively used for analytics tracking and evaluation results.

**Schema Design**: Drizzle ORM schema defined for PostgreSQL with tables:
- `users`: Authentication data (id, username, password)
- `headshot_logs`: Activity tracking (id, createdAt timestamp)
- `analytics_logs`: Transformation analytics (modelUsed, backgroundColor, success, processingTimeMs, inputSizeBytes, outputSizeBytes, errorMessage)
- `download_logs`: Download tracking (analyticsLogId foreign key)
- `eval_results`: LLM-as-Judge evaluation results (runId, testImageName, scores, passed, judgeNotes)

**Database Configuration**:
- Schema location: `shared/schema.ts`
- Migrations directory: `./migrations`
- Environment variable: `DATABASE_URL`
- WebSocket configuration via `ws` package for Neon serverless connection

### Analytics & Evaluation System

**Analytics Dashboard** (`/analytics`):
- Total transformations, success rate, download rate
- Average processing time per transformation
- Model usage breakdown (Flash vs Pro)
- Timeline charts showing daily/weekly activity

**Evaluation System** (`/evals`):
- LLM-as-Judge scoring using Gemini 2.5 Flash
- Metrics: Professionalism (1-5), Identity Preservation (1-5), Background Accuracy (true/false), Technical Quality (1-5), Overall Score (1-5)
- Pass rate tracking (score ≥3.0)
- Per-test results with judge notes

**Eval Runner** (`server/eval-runner.ts`):
- Run via: `npx tsx server/eval-runner.ts`
- Tests images in `eval-images/` directory against all background colors and both models
- Stores results in database for dashboard viewing

### Model Comparison Lab

**Lab Page** (`/lab`):
- Open (no password) tool to compare image models side-by-side on a single uploaded photo.
- All models are accessed through a single **OpenRouter** account (`OPENROUTER_API_KEY_U2C`), kept fully separate from the public `/api/transform` flow (no DB logging).
- Endpoint `POST /api/lab/compare` accepts one image plus optional `modelIds`, fans out to every selected model in parallel, and returns each model's image or per-model error independently.
- `GET /api/lab/session` reports whether OpenRouter is configured and lists available models.
- Model registry lives in `server/lab-models.ts`; OpenRouter request/response handling in `server/openrouter-service.ts`. Shared prompt builder in `server/headshot-prompt.ts`.
- Current models (confirmed against OpenRouter's live image catalog): Nano Banana (`google/gemini-2.5-flash-image`), Nano Banana 2 (`google/gemini-3.1-flash-image-preview`), Nano Banana Pro (`google/gemini-3-pro-image-preview`), GPT-5 Image (`openai/gpt-5-image`), GPT-5 Image Mini (`openai/gpt-5-image-mini`), GPT-5.4 Image 2 (`openai/gpt-5.4-image-2`).
- Note: FLUX/Seedream/Grok image models are not currently served through OpenRouter's image API, so they are not included.

### Build System

**Development**:
- Client: Vite dev server on port 5000
- Server: tsx with hot reload and watch mode
- Custom Vite plugins for Replit integration (cartographer, dev banner, runtime error modal)

**Production Build**:
- Client: Vite build to `dist/public`
- Server: esbuild bundle to `dist/index.cjs`
- Selective dependency bundling (allowlist approach for faster cold starts)
- Single executable CJS output for serverless deployment

**Custom Build Script**: `script/build.ts` orchestrates the dual build process, ensuring the client builds first, then the server with appropriate external dependencies.

## External Dependencies

### AI Service Integration

**Google Gemini AI** (`@google/genai`):
- Purpose: AI-powered professional headshot generation
- Models: Two options available
  - `gemini-2.5-flash-image`: Fast, cost-effective transformations (default)
  - `gemini-3-pro-image-preview`: Higher quality, slower processing
- Authentication: API key via `GOOGLE_API_KEY_HH` environment variable
- Custom prompt engineering for professional headshot aesthetics with configurable background colors

### Database (Configured but Optional)

**Neon PostgreSQL** (`@neondatabase/serverless`):
- Serverless PostgreSQL via `DATABASE_URL` environment variable
- Drizzle ORM for type-safe queries and schema management
- Currently optional - app runs with in-memory storage
- Migration-ready architecture with `db:push` script

### UI Component Libraries

**Radix UI**: Comprehensive set of unstyled, accessible primitives including dialogs, dropdowns, tooltips, forms, and 30+ other components.

**Shadcn UI**: Pre-built component implementations using Radix primitives, customized with Tailwind CSS and the "New York" style variant.

### Styling and Animation

**Tailwind CSS v4**: Utility-first CSS with custom design tokens and theme variables.

**Framer Motion**: Declarative animations for page transitions, component mounting, and interactive effects.

**canvas-confetti**: Celebration effects on successful image transformation.

### Development Tools

**Replit Plugins**:
- `@replit/vite-plugin-cartographer`: Code navigation
- `@replit/vite-plugin-dev-banner`: Development environment indicator
- `@replit/vite-plugin-runtime-error-modal`: Enhanced error reporting
- Custom `vite-plugin-meta-images`: OpenGraph/Twitter image meta tag updates for Replit deployments

### File Upload

**Multer**: Multipart form data handling for image uploads with memory storage strategy.

**react-dropzone**: Accessible drag-and-drop file upload interface with MIME type validation.

### Other Key Dependencies

**wouter**: Minimal routing library (2KB alternative to React Router)

**TanStack Query**: Server state management and caching

**react-hook-form + zod**: Form validation (dependencies present, ready for future auth features)

**zod + drizzle-zod**: Runtime type validation and schema validation