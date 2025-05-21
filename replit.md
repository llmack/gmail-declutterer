# Gmail Declutter Application

## Overview

This application is designed to help users clean up their Gmail inbox by identifying and removing unnecessary emails. It uses Google OAuth for authentication and Gmail API to analyze the user's emails. The application identifies various categories of emails (such as temporary verification codes) that can be safely deleted to save storage space.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- React-based single-page application
- React Query for data fetching and state management
- Shadcn UI components with Tailwind CSS for styling
- Wouter for client-side routing

### Backend

- Express.js server with TypeScript
- OAuth 2.0 for Google authentication
- Gmail API integration for email operations
- Session-based authentication
- Drizzle ORM for database interactions
- RESTful API design pattern

### Database

- PostgreSQL (configured via Drizzle ORM)
- Used to store:
  - User information
  - Email analysis results
  - Temporary code emails detected

## Key Components

### Authentication Flow

The application uses Google OAuth for authentication. When a user clicks the login button, they are redirected to Google for authorization. After successful authentication, the user is redirected back to the application with an auth code, which is exchanged for access and refresh tokens. These tokens are stored in the user's session and database for future API requests.

### Email Analysis

Once authenticated, the application can:
1. Fetch email statistics (total count, storage used)
2. Identify temporary verification code emails
3. Calculate potential storage savings

### Data Purging

Users can select temporary code emails and batch delete them to free up space.

## Data Flow

1. **Authentication**:
   - User initiates login → Google OAuth → Callback with code → Exchange for tokens → Store in session and database
   
2. **Email Analysis**:
   - User requests analysis → Backend uses Gmail API → Results stored in database → UI displays statistics
   
3. **Email Cleanup**:
   - User selects emails to delete → Confirmation dialog → Backend uses Gmail API to move emails to trash → UI updates to show successful deletion

## External Dependencies

### Google APIs
- Google OAuth 2.0 for authentication
- Gmail API for email operations

### Frontend Libraries
- React
- React Query
- Shadcn UI/Radix UI
- Tailwind CSS
- Wouter for routing

### Backend Libraries
- Express
- Drizzle ORM
- Express-session for session management

## Database Schema

The database uses three main tables:
1. `users` - Stores user information including OAuth tokens
2. `email_analysis` - Stores results of email analysis operations
3. `temp_code_emails` - Stores information about identified temporary code emails

## Deployment Strategy

The application is configured for deployment on Replit with auto-scaling. The deployment process involves:

1. Building the frontend with Vite
2. Bundling the server with esbuild
3. Running the production build with Node.js

For local development, the application uses:
- Vite's development server with HMR for frontend
- tsx for running TypeScript directly during development

## Configuration

### Environment Variables Required
- `DATABASE_URL`: Connection string for PostgreSQL
- `GOOGLE_CLIENT_ID`: OAuth client ID from Google Developer Console
- `GOOGLE_CLIENT_SECRET`: OAuth client secret from Google Developer Console
- `GOOGLE_REDIRECT_URI`: Callback URL for OAuth (default: `http://localhost:5000/api/auth/callback`)
- `SESSION_SECRET`: Secret for encrypting session data

## Getting Started

1. Ensure PostgreSQL is properly set up
2. Set the required environment variables
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the development server
5. For database operations:
   - Use `npm run db:push` to update database schema

## Known Limitations

- The application currently only identifies and manages temporary code emails
- There is no automatic scheduling for email cleanup
- OAuth tokens need to be refreshed periodically for long-term access