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
- **Search & Filter:** Quickly find applications and contacts with real-time search; Applications page has status tabs, stage chips, and deadline filter chips (Overdue, Due this week); Network page has a Needs Follow-up tab
- **Job Posting Link & Company Logo:** Each application can store a job posting URL; the card header shows the company logo (fetched from Clearbit via the URL's domain) and an external link icon; falls back to a letter avatar if no logo is found
- **LinkedIn Profiles:** Each contact can store a LinkedIn URL; a LinkedIn icon appears next to the contact's name in the card header for one-click access
- **Dashboard:** View statistics, recent activity, and analytics charts at a glance
- **Cross-Navigation:** Click contact names to navigate and highlight them in your network
- **Notification Bell:** In-app bell icon in the nav shows overdue follow-up contacts based on a configurable interval
- **Password Reset:** Forgot password flow on login page sends a reset email; `/reset-password` handles the magic-link redirect
- **Settings:** User preferences for follow-up reminder interval, notification toggle, and account deletion (Danger Zone)
- **Sort Controls:** Applications can be sorted by newest, oldest, deadline, or company A–Z; Contacts by recently added, name A–Z, or last contacted
- **Days-Since-Contact Badge:** Each ContactCard shows a color-coded badge indicating days since last contact (green <7d, yellow <14d, red ≥14d, gray if never)
- **Copy to Clipboard:** One-click copy buttons on email and phone in ContactCard with 1.5s checkmark feedback
- **Quick Status Change:** ApplicationCard status badge is an inline dropdown — change Pending/Accepted/Denied without entering edit mode
- **Linked Applications on Contacts:** ContactCard has an expandable "Linked Applications" section that lazy-fetches which applications the contact is tied to
- **CSV Export:** Applications and Contacts pages each have an Export CSV button that downloads the current filtered/sorted view

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
│   ├── Layout.jsx              # Main app layout with header/nav + notification bell
│   ├── ProtectedRoute.jsx      # Auth route guard
│   ├── ApplicationCard.jsx     # Application display/edit card
│   ├── ContactCard.jsx         # Contact display/edit card
│   ├── AddApplicationModal.jsx # Modal for creating applications
│   ├── AddContactModal.jsx     # Modal for creating contacts
│   └── charts/                 # Chart components for analytics
├── contexts/          # React context providers
│   └── AuthContext.jsx         # Authentication state
├── lib/               # Utilities and configurations
│   ├── supabase.js             # Supabase client
│   └── deadlineUtils.js        # Deadline calculation helpers
├── pages/             # Route page components
│   ├── HomePage.jsx            # Home/dashboard page with stats
│   ├── ApplicationsPage.jsx    # Applications list with search, filters, sort, deadline filter, CSV export
│   ├── NetworkPage.jsx         # Contacts list with search, follow-up filter, sort, CSV export
│   ├── SettingsPage.jsx        # User preferences (notification bell interval)
│   ├── LoginPage.jsx           # Login form + forgot password flow
│   ├── ResetPasswordPage.jsx   # Password reset via email magic link
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

- **applications:** Job application records with company, position, status, interview stages, deadline, application_url, and notes
- **contacts:** Professional network contacts with name, company, position, school, linkedin_url, and contact info
- **application_contacts:** Junction table for many-to-many relationships between applications and contacts
- **user_preferences:** Per-user settings — `follow_up_reminder_days` (int, default 14), `email_reminders_enabled` (bool, stores the in-app bell toggle)

### Row Level Security (RLS)

All tables have RLS policies enabled to ensure users can only access their own data. Each table includes policies for SELECT, INSERT, UPDATE, and DELETE operations that verify `user_id = auth.uid()`.

### Key Relationships

- One application can have multiple contacts (many-to-many via `application_contacts`)
- Contact deletions cascade to remove junction table entries
- Unique constraint prevents duplicate contact-application links

## Authentication

Uses Supabase Auth with email/password. Protected routes redirect to `/login` if not authenticated. Forgot password sends a Supabase reset email; the link redirects to `/reset-password` where the user sets a new password. The JobTrackr logo in the nav header is a link to `/` (Home nav button was removed).

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

### Notification Bell

`Layout.jsx` fetches `user_preferences` on mount. If `email_reminders_enabled` is true, it queries contacts where `last_contact_date < now - follow_up_reminder_days` OR `last_contact_date IS NULL`, capped at 10 results. A bell icon in the nav header shows a red badge with the count. Clicking the bell opens a dropdown listing overdue contacts; clicking a contact navigates to `/network?highlight=<id>`. The column name `email_reminders_enabled` is kept as-is in the DB — only the UI label changed to "Show notification bell."

### Settings Page

`SettingsPage.jsx` reads/writes `user_preferences` via upsert on `user_id`. Manages two fields: `email_reminders_enabled` (toggle) and `follow_up_reminder_days` (number input, 1–90). Also has a **Danger Zone** section for account deletion: user must type `DELETE` to confirm, then a `delete_user` RPC wipes all data and the auth user, followed by sign-out.

### Company Logo & Job Posting URL

`ApplicationCard.jsx` has a `CompanyLogo` component and a `getDomain` helper. When `application_url` is set, the domain is extracted (stripping `www.` and subdomains) and used to fetch `https://logo.clearbit.com/{domain}`. On `onError`, falls back to a letter-avatar div. The card header shows the logo left of the company name, and an external link icon (opens in new tab) if a URL is present. No API key required.

### LinkedIn URL on Contacts

`ContactCard.jsx` shows a LinkedIn SVG icon (`fill="currentColor"`, color `#0A66C2`) next to the contact name when `linkedin_url` is set. Clicking opens the profile in a new tab. Field is stored as `linkedin_url TEXT` in the `contacts` table and is available in both `AddContactModal` and inline edit mode.

### Application Filter Tabs & Sort

`ApplicationsPage.jsx` has three rows of filter controls plus a sort dropdown, all composing with text search:
- **Status tabs:** All / Pending / Accepted / Denied — each shows a live count
- **Stage chips:** Applied, Phone Screen, Interview, Final Round, Offer — toggleable
- **Deadline chips:** Overdue (red), Due this week (yellow) — toggleable, uses `getDeadlineUrgency` from `deadlineUtils.js`
- **Sort dropdown:** Newest first (default), Oldest first, Deadline (asc, nulls last), Company A–Z

### Network Filter & Sort

`NetworkPage.jsx` has filter tabs and a sort dropdown:
- **Follow-up tabs:** All / Needs Follow-up — Needs Follow-up filters contacts where `last_contact_date < now - follow_up_reminder_days` OR date is null; count shown on tab; `follow_up_reminder_days` fetched from `user_preferences` on mount (defaults to 14)
- **Sort dropdown:** Recently added (default), Name A–Z, Last contacted (asc, nulls first — most overdue first)

### ContactCard Enhancements

- **Days-since badge:** Computed from `last_contact_date` on each render; color-coded green/yellow/red/gray; shown in card header alongside chat feel and relationship badges
- **Copy buttons:** `copiedField` state (null | 'email' | 'phone') with `navigator.clipboard.writeText`; resets after 1500ms via `setTimeout`
- **Linked Applications:** `linkedAppsExpanded` + `linkedAppsLoading` state; fetches `application_contacts` joined with `applications` lazily on first expand; displays company, position, and status-colored label

### ApplicationCard Quick Status

The status badge in view mode is a styled `<select>` (same badge classes, `appearance-none border-0`) with `quickStatus` local state synced to `application.status` via `useEffect`. `onChange` saves directly to Supabase and calls `onUpdate()`; `statusSaving` boolean disables the select during the async call.

### CSV Export

Both `ApplicationsPage.jsx` and `NetworkPage.jsx` have an `exportCSV` function and "Export CSV" button (shown only when data exists). Exports the current filtered+sorted view. Uses a local `escapeCSV` helper that wraps values containing commas, quotes, or newlines in double-quoted strings. Downloads via `Blob` + temporary anchor click + `URL.revokeObjectURL`.
