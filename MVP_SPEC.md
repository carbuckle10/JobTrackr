# JobTrackr — MVP Product Spec

**Version:** 1.0
**Date:** March 3, 2026

---

## Context

**Job to be Done**
When I'm actively job searching, I need to track every application and manage my professional network in one place so I can stay organized across many concurrent opportunities, know exactly where I stand with each company, and follow up with the right people at the right time.

**Value Proposition**
JobTrackr is a personal job search organizer that connects your application pipeline and professional network — replacing scattered spreadsheets and forgotten follow-ups with a single workspace that tells you where you stand and who to reach out to next.

**Ideal Customer Profile**
College students and early-career professionals who are actively applying to 10+ jobs simultaneously. They're doing informational interviews, managing referrals, and running their job search solo. Their biggest pain: losing track of where things stand and letting relationships go cold because they forgot to follow up.

---

## User Stories

### Story 1 — Log job applications
**Priority: Must Have** — the core action of the product; nothing works without this

> As an active job seeker, I want to add a job application with the company name, position, and status so that I have a running record of every company I've applied to and where I stand.

**Acceptance Criteria:**
- [ ] User can create an application with company name (required), position, status, interview stage, date applied, and notes
- [ ] Application immediately appears at the top of the applications list after saving
- [ ] User can inline-edit any field on an existing application without leaving the page
- [ ] User can delete an application with a confirmation prompt
- [ ] Status can be set to Pending (default), Accepted, or Denied
- [ ] Interview stage can be set to Applied, Phone Screen, Interview, Final Round, or Offer

---

### Story 2 — Track professional contacts
**Priority: Must Have** — networking is the second core workflow; app is incomplete without it

> As an active job seeker, I want to add contacts from my professional network with their details and relationship status so that I have all my networking information in one organized place.

**Acceptance Criteria:**
- [ ] User can create a contact with name (required), company, position, email, phone, school, and notes
- [ ] User can record a relationship status: Lead, Connected, Close, or Mentor
- [ ] User can record the date of last contact and rate how the interaction felt (Great, Good, Okay, Cold)
- [ ] Contact immediately appears in the contacts list after saving
- [ ] User can inline-edit and delete contacts

---

### Story 3 — Link contacts to applications
**Priority: Should Have** — important for users with referrals or networking into roles, but app functions without it

> As an active job seeker, I want to link one or more contacts from my network to a specific job application so that I know who referred me, who the recruiter is, or who else is involved in a hiring process.

**Acceptance Criteria:**
- [ ] When creating or editing an application, user can select any number of contacts from a checkbox list
- [ ] Linked contacts appear as clickable badges on the application card in view mode
- [ ] Clicking a contact badge navigates to the Network page and scrolls to + highlights that contact
- [ ] Removing a contact from an application does not delete the contact from the network
- [ ] A contact can be linked to multiple applications simultaneously

---

### Story 4 — Surface contacts who need follow-up
**Priority: Should Have** — core value differentiator, but dashboard works without this specific widget

> As an active job seeker, I want to see which contacts I haven't reached out to in over two weeks so that I can maintain relationships before they go cold.

**Acceptance Criteria:**
- [ ] Dashboard shows up to 5 contacts where `last_contact_date` is more than 14 days ago or has never been set
- [ ] List is sorted by oldest contact date first (most neglected at the top)
- [ ] Each entry shows the contact name, company, and the last contact date (or "Never contacted")
- [ ] Widget links to the full Network page

---

### Story 5 — See a pipeline summary
**Priority: Could Have** — useful at-a-glance view, but users can get this from the applications list

> As an active job seeker, I want to see a dashboard with my application stats so that I can quickly assess the health of my job search without reviewing every application individually.

**Acceptance Criteria:**
- [ ] Dashboard shows total application count, and counts for Pending, Accepted, and Denied
- [ ] Response rate is calculated as `(Accepted + Denied) / Total` and shown as a percentage
- [ ] The 5 most recently added applications are shown with company, position, and status badge
- [ ] Dashboard links to the full Applications list

---

## Functional Requirements

These are the things the MVP must do. If any of these don't work, the product doesn't ship.

### Authentication
- Users can create an account with email and password
- Users can log in and log out
- Users can reset their password via an email link
- All data is private to the authenticated user — no user can access another user's data

### Applications
- Create an application (company required; all other fields optional)
- View all applications in a list sorted by creation date, newest first
- Inline-edit any field on an existing application
- Delete an application (with confirmation)
- Search applications by company, position, notes, or linked contact name — client-side, real-time

### Contacts
- Create a contact (name required; all other fields optional)
- View all contacts in a list sorted by creation date, newest first
- Inline-edit any field on an existing contact
- Delete a contact (with confirmation); cascades to remove all application links
- Search contacts by name, company, position, school, or email — client-side, real-time

### Application ↔ Contact Linking
- Link zero or more contacts to any application via a checkbox multi-select
- Linked contacts are displayed as badges on the application card
- Clicking a contact badge navigates to and highlights that contact in the Network list

### Dashboard
- Show aggregate stats: total, pending, accepted, denied, response rate
- Show 5 most recent applications
- Show up to 5 contacts who haven't been contacted in 14+ days

---

## Success Metrics

How we'll know the MVP is working:

| Metric | Target | Why It Matters |
|---|---|---|
| User creates at least 1 application | >80% of new signups | Validates that onboarding leads to core action |
| User creates at least 1 contact | >50% of new signups | Validates that both workflows are being used, not just one |
| User returns within 7 days | >40% retention | Job search is ongoing; the app only has value if users come back |
| User links a contact to an application | >30% of active users | Validates that the cross-feature connection is discoverable and useful |
| Application count per active user | >5 applications | Proxy for whether the tool is actually replacing their spreadsheet |

---

## Out of Scope (Won't Have in MVP)

These are explicitly not being built. If they come up, the answer is no until v2.

- **Job discovery / job board integration** — users bring their own applications; we don't source jobs
- **Resume or document management** — no file uploads, no resume builder
- **Sorting and column filtering** — no filter by status, sort by date, etc. beyond text search
- **Bulk actions** — no bulk delete, bulk status update, or multi-select operations
- **Data export** — no CSV or JSON export
- **Email or push notifications** — all reminders are in-app only (the follow-up widget)
- **Calendar integration** — no interview scheduling or calendar sync
- **Mobile native app** — web only; no React Native or Expo
- **Sharing or collaboration** — all data is strictly private, single-user
- **Charts or analytics** — stat cards on the dashboard only, no graphs or trend views
- **Salary tracking** — not stored or displayed
- **Application deadlines** — no due dates or countdown timers
