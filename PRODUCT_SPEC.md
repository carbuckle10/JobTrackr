# JobTrackr — Product Specification

**Version:** 1.0
**Last Updated:** March 3, 2026
**Status:** Shipped

---

## 1. Overview

JobTrackr is a personal job search management tool for active job seekers. It helps users stay organized across two core workflows: tracking job applications through the hiring pipeline and managing their professional network of contacts. The app is designed for individual use — each user has a private, isolated workspace with no sharing or collaboration features.

**Target User:** A college student or early-career professional actively applying to jobs who wants a single place to track their pipeline, manage relationships, and stay on top of follow-ups.

---

## 2. Goals

- Give users a clear, current view of their job search status at a glance
- Reduce the cognitive load of tracking many concurrent applications across different companies and stages
- Encourage consistent networking by surfacing contacts who need follow-up
- Connect application records to the people involved (referrals, recruiters, hiring managers)

---

## 3. Non-Goals

- No job discovery or job board integration
- No resume or document management
- No team or collaborative features
- No email/calendar integration
- No mobile native app (web only)

---

## 4. Pages & Navigation

The app has three authenticated views and three auth pages:

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Summary stats, recent applications, follow-up reminders |
| `/applications` | Applications | Full list of job applications with search |
| `/network` | Network | Full list of contacts with search |
| `/login` | Login | Email/password login with forgot password link |
| `/signup` | Sign Up | New account creation |
| `/reset-password` | Reset Password | Password reset via email link |

Authenticated routes are wrapped in a persistent layout with a top navigation bar linking to Dashboard, Applications, and Network.

---

## 5. Features

### 5.1 Dashboard

The dashboard is the default home screen after login. It gives a high-level overview of the user's job search.

**Stats Row (5 cards):**
- **Total Apps** — count of all applications
- **Pending** — applications with status = "Pending"
- **Accepted** — applications with status = "Accepted"
- **Denied** — applications with status = "Denied"
- **Response Rate** — `(Accepted + Denied) / Total`, shown as a percentage; represents how many applications have received a decision

**Recent Applications** — A panel showing the 5 most recently created applications with company name, position, and status badge. Links to the full Applications list.

**Needs Follow-up** — A panel showing up to 5 contacts where `last_contact_date` is more than 14 days ago or null (never contacted), sorted by oldest contact date first. Links to the full Network list.

---

### 5.2 Applications

A searchable list of all job applications, sorted by creation date (newest first).

#### 5.2.1 Application Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Company | Text | Yes | Primary identifier for the application |
| Position | Text | No | Job title |
| Status | Enum | No | Pending (default), Accepted, Denied |
| Interview Stage | Enum | No | Applied, Phone Screen, Interview, Final Round, Offer |
| # of Interviews | Integer | No | Running count of interview rounds completed |
| Date Applied | Date | No | When the application was submitted |
| Date Responded | Date | No | When the company responded; empty = "Pending" |
| Contacts | Multi-select | No | Linked contacts from Network (many-to-many) |
| Connection Notes | Text | No | Free text about how the connection was made (e.g., "Met at career fair") |
| Notes | Text | No | General notes about the application |

#### 5.2.2 Status Values

| Status | Color | Meaning |
|---|---|---|
| Pending | Yellow | No decision yet |
| Accepted | Green | Offer received or moved forward |
| Denied | Red | Rejected |

#### 5.2.3 Interview Stage Values

| Stage | Color | Meaning |
|---|---|---|
| Applied | Gray | Submitted application, no further contact |
| Phone Screen | Blue | Initial recruiter call |
| Interview | Purple | Formal interview scheduled or completed |
| Final Round | Orange | Final stage interview |
| Offer | Green | Offer extended |

#### 5.2.4 Add Application Modal

Triggered by the "+ Add Application" button. A full-screen modal with a 2-column form layout. Requires company name. Upon save, the new application appears at the top of the list.

#### 5.2.5 Inline Edit

Each application card has an "Edit" button that expands the card into an editable form in place (no modal). Fields are identical to the add modal. Changes are saved immediately via Supabase and the list refreshes.

#### 5.2.6 Delete

Each card has a "Delete" button with a browser `confirm()` dialog. Deletion is permanent.

#### 5.2.7 Search

A full-width text input at the top of the page filters applications client-side in real time. Matches against:
- Company name
- Position
- Notes
- Linked contact names and companies

Empty state when no applications exist, and a "no results" state when the search query matches nothing.

#### 5.2.8 Contact Badges

In view mode, linked contacts appear as clickable badges showing the contact's name and company. Clicking a badge navigates to `/network?highlight=<contactId>`, which scrolls to and visually highlights that contact card.

---

### 5.3 Network

A searchable list of all contacts, sorted by creation date (newest first).

#### 5.3.1 Contact Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | Text | Yes | Primary identifier |
| Company | Text | No | Current employer |
| Position | Text | No | Job title |
| Relationship Status | Enum | No | Lead, Connected, Close, Mentor |
| Email | Email | No | Shown as `mailto:` link |
| Phone | Tel | No | Shown as `tel:` link |
| School | Text | No | University/institution |
| Major | Text | No | Field of study |
| Grad Year | Integer | No | Graduation year (1950–2030) |
| Last Contact Date | Date | No | When the user last spoke to this contact; drives follow-up reminders |
| Chat Length | Text | No | Free text, e.g. "30 min" |
| Chat Feel | Enum | No | Great, Good, Okay, Cold |
| Notes | Text | No | General notes about the contact |

#### 5.3.2 Relationship Status Values

| Status | Color | Meaning |
|---|---|---|
| Lead | Yellow | New or unestablished contact |
| Connected | Blue | Have had meaningful contact |
| Close | Green | Strong relationship |
| Mentor | Purple | Ongoing mentorship relationship |

#### 5.3.3 Chat Feel Values

| Value | Color | Meaning |
|---|---|---|
| Great | Green | Very positive interaction |
| Good | Blue | Positive interaction |
| Okay | Yellow | Neutral interaction |
| Cold | Gray | Unresponsive or unengaged |

#### 5.3.4 Add Contact Modal

Triggered by the "+ Add Contact" button. Same interaction pattern as the application modal.

#### 5.3.5 Inline Edit & Delete

Same pattern as ApplicationCard — "Edit" button toggles inline form, "Delete" with confirm dialog.

#### 5.3.6 Search

Filters contacts client-side against: name, company, position, school, email.

#### 5.3.7 Contact Highlight Navigation

When navigating to `/network?highlight=<id>` (e.g., from an application's contact badge), the page:
1. Smooth-scrolls to the target contact card
2. Applies a blue pulse animation (2 iterations, 1s each)
3. Clears the `highlight` URL parameter after 3 seconds

---

### 5.4 Authentication

- **Sign Up:** Email + password. New accounts are created via Supabase Auth.
- **Login:** Email + password with a "Forgot password?" link.
- **Forgot Password:** Submits the user's email to Supabase, which sends a password reset link.
- **Reset Password:** A dedicated page at `/reset-password` that handles the Supabase email link flow and accepts a new password.
- **Protected Routes:** All `/`, `/applications`, and `/network` routes redirect unauthenticated users to `/login`.
- **Session Persistence:** Supabase handles session tokens; users remain logged in across browser sessions.

---

## 6. Data Model

### `applications`

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK to `auth.users` |
| company | TEXT | Required |
| position | TEXT | |
| connection | TEXT | Connection notes |
| date_applied | DATE | |
| date_responded | DATE | |
| interview_stage | TEXT | Enum-like: Applied, Phone Screen, Interview, Final Round, Offer |
| num_interviews | INTEGER | |
| status | TEXT | Enum-like: Pending, Accepted, Denied |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-updated via trigger |

### `contacts`

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK to `auth.users` |
| name | TEXT | Required |
| company | TEXT | |
| position | TEXT | |
| school | TEXT | |
| major | TEXT | |
| grad_year | INTEGER | |
| email | TEXT | |
| phone | TEXT | |
| last_contact_date | DATE | Drives follow-up logic |
| chat_length | TEXT | Free text |
| chat_feel | TEXT | Enum-like: Great, Good, Okay, Cold |
| relationship_status | TEXT | Enum-like: Lead, Connected, Close, Mentor |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-updated via trigger |

### `application_contacts` (junction table)

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| application_id | UUID | FK to `applications`, CASCADE delete |
| contact_id | UUID | FK to `contacts`, CASCADE delete |
| created_at | TIMESTAMPTZ | |

Unique constraint on `(application_id, contact_id)` prevents duplicate links.

---

## 7. Security

All tables use Supabase Row Level Security (RLS). Every read, insert, update, and delete policy verifies `user_id = auth.uid()`, ensuring users can only access their own data. The `application_contacts` table inherits this security by checking that the linked `application_id` belongs to the authenticated user.

---

## 8. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Backend/Auth/DB | Supabase (PostgreSQL + Auth) |
| Hosting | Vercel (SPA with rewrite rules) |

---

## 9. Key UX Patterns

- **Inline editing** — Cards expand into forms in place; no navigation away from the list
- **Client-side search** — Instant filtering with no server round-trips
- **Optimistic-style refresh** — After any mutation, the full list is re-fetched from Supabase to ensure consistency
- **Expandable notes** — Long notes are truncated with a "More/Less" toggle to keep cards compact
- **Cross-entity navigation** — Contact badges on application cards deep-link into the Network list with visual feedback
- **Follow-up nudges** — Dashboard surfaces stale contacts automatically based on `last_contact_date`

---

## 10. Scope Not Included (v1)

The following were intentionally left out of v1:

- Sorting and filtering beyond text search (e.g., filter by status, sort by date)
- Bulk actions (bulk delete, bulk status update)
- Data export (CSV/JSON)
- Application deadlines or calendar integration
- Email or notification reminders
- Mobile app
- Sharing or collaboration
- Analytics or charts beyond the dashboard stat cards
