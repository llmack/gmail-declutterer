# Gmail Declutter - Replit Project Guide

## Overview

Gmail Declutter is a modern web application designed to help users clean up their Gmail inboxes by identifying and removing unnecessary emails. The application uses Google OAuth for authentication, analyzes emails in users' inboxes, and provides a dashboard to visualize email statistics and cleanup opportunities. 

The application follows a full-stack architecture with a React frontend and Express backend. It uses Drizzle ORM for database operations, with support for PostgreSQL. The UI is built using the Shadcn UI component library and follows a clean, modern design language.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with Shadcn UI components
- **State Management**: React hooks and context

### Backend
- **Framework**: Express.js (Node.js)
- **Authentication**: Google OAuth 2.0
- **Data Storage**: Drizzle ORM with PostgreSQL
- **Session Management**: Express-session with memory store

### API
- RESTful API patterns
- JSON response format
- API routes prefixed with `/api`

## Key Components

### Authentication Flow
1. User initiates Google OAuth flow by clicking "Sign in with Google" button
2. Server generates authorization URL with required Gmail scopes
3. User is redirected to Google to grant permissions
4. Google redirects back with an authorization code
5. Server exchanges code for access and refresh tokens
6. User profile is stored in the database and session is established

### Email Analysis
1. Server uses Google Gmail API to fetch and analyze emails
2. Emails are categorized (e.g., temporary verification codes, subscriptions)
3. Statistics about email usage and "declutter potential" are calculated
4. Results are presented in a user-friendly dashboard

### Email Cleanup
1. User selects categories of emails to clean up
2. Server moves selected emails to trash using Gmail API
3. History of cleanup actions is recorded in the database

## Data Flow

1. **Authentication**: 
   - Frontend → `/api/auth/url` → Google OAuth → `/api/auth/callback` → Session Creation

2. **Email Analysis**:
   - Frontend → `/api/gmail/profile` → Gmail API → Database → Frontend
   - Frontend → `/api/gmail/temp-codes` → Gmail API → Frontend

3. **Email Cleanup**:
   - Frontend → `/api/gmail/trash` → Gmail API → Database → Frontend

## Database Schema

The application uses a relational database with the following tables:

1. **users**: Stores user information and OAuth tokens
2. **email_analytics**: Stores aggregate email statistics for each user
3. **email_categories**: Tracks categorized emails and their counts
4. **deletion_history**: Logs history of email cleanup operations

## External Dependencies

### Google APIs
- Gmail API (read and modify access)
- Google OAuth 2.0 for authentication

### Key Third-Party Libraries
- **@tanstack/react-query**: For data fetching and caching
- **drizzle-orm**: For database operations
- **shadcn/ui**: Component library based on Radix UI
- **tailwindcss**: For styling
- **express**: Backend server
- **express-session**: Session management

## Deployment Strategy

The application is configured to be deployed on Replit with the following structure:

1. **Development**: 
   - `npm run dev` starts both the frontend dev server and the backend server

2. **Production Build**:
   - Frontend: Vite builds the React application to the `dist/public` directory
   - Backend: ESBuild bundles the server code to the `dist` directory
   - The Express server serves the static frontend files in production

3. **Database**:
   - Configured to use PostgreSQL with Drizzle ORM
   - Database URL is provided via environment variable

## Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL database connection string
- `GOOGLE_CLIENT_ID`: OAuth client ID from Google Developer Console
- `GOOGLE_CLIENT_SECRET`: OAuth client secret
- `REDIRECT_URI`: OAuth callback URL
- `SESSION_SECRET`: Secret for session cookie encryption

## Development Workflow

1. Use `npm run dev` to start the development server
2. Database migrations are handled with Drizzle Kit via `npm run db:push`
3. Build for production with `npm run build`
4. Start production server with `npm run start`

## Key Files

- **Frontend Entry**: `client/src/main.tsx`
- **Backend Entry**: `server/index.ts`
- **API Routes**: `server/routes.ts`
- **Database Schema**: `shared/schema.ts`
- **UI Components**: `client/src/components/`
- **Pages**: `client/src/pages/`