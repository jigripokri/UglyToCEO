# HeadShot Hero - AI Professional Headshot Generator

## Overview

HeadShot Hero is a web application that transforms casual photos into professional headshots using Google's Gemini AI image generation models. Users upload their photos, select customization options (AI model and background color), and receive AI-enhanced professional headshots with a before/after comparison view.

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

**Current Implementation**: In-memory storage using a custom `MemStorage` class that implements the `IStorage` interface.

**Schema Design**: Drizzle ORM schema defined for PostgreSQL with two tables:
- `users`: Authentication data (id, username, password)
- `headshot_logs`: Activity tracking (id, createdAt timestamp)

**Database Ready**: The application is structured to support database persistence but currently uses memory storage. Drizzle is configured for PostgreSQL (via Neon serverless driver) with:
- Schema location: `shared/schema.ts`
- Migrations directory: `./migrations`
- Environment variable: `DATABASE_URL`

**Rationale**: Memory storage allows the application to run without database dependencies while maintaining a clean separation between storage interface and implementation. The `IStorage` interface makes it trivial to swap to database-backed storage by implementing the same interface with Drizzle queries.

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