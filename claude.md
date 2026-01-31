# JobTrackr

A job application tracking app built with React and Supabase.

## Tech Stack

- **Frontend:** React 19 with Vite
- **Styling:** Tailwind CSS v4
- **Database & Auth:** Supabase
- **Routing:** React Router v6
- **Deployment:** Vercel (planned)

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── Layout.jsx     # Main app layout with header/nav
│   └── ProtectedRoute.jsx  # Auth route guard
├── contexts/          # React context providers
│   └── AuthContext.jsx     # Authentication state
├── lib/               # Utilities and configurations
│   └── supabase.js    # Supabase client
├── pages/             # Route page components
│   ├── ApplicationsPage.jsx
│   ├── NetworkPage.jsx
│   ├── LoginPage.jsx
│   └── SignUpPage.jsx
├── App.jsx            # Router configuration
├── main.jsx           # App entry point
└── index.css          # Tailwind imports
```

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
