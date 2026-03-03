# JobTrackr

## Product Overview

JobTrackr is a personal job search organizer that gives active job seekers a single source of truth for their application pipeline and professional contacts. It replaces scattered spreadsheets and forgotten follow-ups with a clean, connected workspace where everything about your job search lives in one place.

## Target User

College students and early-career professionals (roughly 21–27) who are actively applying to multiple jobs simultaneously, doing informational interviews and networking, and managing their job search on their own. They're comfortable with web apps, detail-oriented, and frustrated by the cognitive overhead of tracking everything across their head, email, and a spreadsheet.

## Value Proposition

When you're applying to 10+ companies at once and networking with dozens of contacts, things fall through the cracks. JobTrackr connects your application pipeline and your professional network so you always know where you stand, who's involved in each process, and who you haven't talked to in a while — without ever having to dig through your inbox to find out.

## Tech Stack

- **Frontend:** React 19 with Vite
- **Styling:** Tailwind CSS v4
- **Database & Auth:** Supabase (PostgreSQL + Row Level Security)
- **Routing:** React Router v6
- **Deployment:** Vercel

---

A job application tracking app built with React and Supabase. Track job applications, manage professional contacts, and monitor your job search progress.

## Features

- **Applications Tracking:** Manage job applications with company, position, status, interview stages, and notes
- **Contact Management:** Build and organize your professional network
- **Multi-Contact Support:** Link multiple contacts to each application (referrals, recruiters, hiring managers)
- **Search & Filter:** Quickly find applications and contacts with real-time search
- **Dashboard:** View statistics and recent activity at a glance
- **Cross-Navigation:** Click contact names to navigate and highlight them in your network

## Tech Stack

- **Frontend:** React 19 with Vite
- **Styling:** Tailwind CSS v4
- **Database & Auth:** Supabase
- **Routing:** React Router v6
- **Deployment:** Vercel

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── Layout.jsx              # Main app layout with header/nav
│   ├── ProtectedRoute.jsx      # Auth route guard
│   ├── ApplicationCard.jsx     # Application display/edit card
│   ├── ContactCard.jsx         # Contact display/edit card
│   ├── AddApplicationModal.jsx # Modal for creating applications
│   └── AddContactModal.jsx     # Modal for creating contacts
├── contexts/          # React context providers
│   └── AuthContext.jsx         # Authentication state
├── lib/               # Utilities and configurations
│   └── supabase.js             # Supabase client
├── pages/             # Route page components
│   ├── DashboardPage.jsx       # Home page with stats
│   ├── ApplicationsPage.jsx    # Applications list with search
│   ├── NetworkPage.jsx         # Contacts list with search
│   ├── LoginPage.jsx           # Login form
│   └── SignUpPage.jsx          # Sign up form
├── App.jsx            # Router configuration
├── main.jsx           # App entry point
└── index.css          # Tailwind imports + animations

supabase/
├── schema.sql         # Database tables and RLS policies
└── check-rls.sql      # RLS verification queries
```

## Database Architecture

### Tables

- **applications:** Job application records with company, position, status, salary, interview stages, and notes
- **contacts:** Professional network contacts with name, company, position, school, and contact info
- **application_contacts:** Junction table for many-to-many relationships between applications and contacts

### Row Level Security (RLS)

All tables have RLS policies enabled to ensure users can only access their own data. Each table includes policies for SELECT, INSERT, UPDATE, and DELETE operations that verify `user_id = auth.uid()`.

### Key Relationships

- One application can have multiple contacts (many-to-many via `application_contacts`)
- Contact deletions cascade to remove junction table entries
- Unique constraint prevents duplicate contact-application links

## Authentication

Uses Supabase Auth with email/password. Protected routes redirect to `/login` if not authenticated.

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

```bash
npm install
npm run dev
```

## Conventions

- Functional components with hooks
- File naming: PascalCase for components (e.g., `LoginPage.jsx`)
- Tailwind for all styling (no CSS modules)
- Supabase for all backend operations

## Key Implementation Details

### Search Functionality

Both Applications and Network pages implement real-time client-side filtering:
- **ApplicationsPage:** Searches company, position, notes, and linked contact names
- **NetworkPage:** Searches name, company, position, school, and email
- Case-insensitive matching with empty state handling

### Multi-Contact Feature

Applications support linking multiple contacts via checkbox multi-select:
- **View Mode:** Clickable contact badges with company name
- **Edit Mode:** Scrollable checkbox list with existing selections pre-populated
- **Add Modal:** Checkbox list for selecting contacts when creating applications

### Contact Navigation

Clicking a contact badge navigates to Network page with:
- URL parameter: `/network?highlight=<contactId>`
- Smooth scroll to the contact card
- Blue pulse animation (2 iterations, 1s each)
- Auto-clear highlight parameter after 3 seconds

### Card Components

Both ApplicationCard and ContactCard support:
- **View mode:** Compact display with all details
- **Edit mode:** Inline editing with save/cancel
- **Delete:** Confirmation before deletion
- Optimistic UI updates via `onUpdate` callback
