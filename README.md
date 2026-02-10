# JobTrackr

A job application tracking app built with React and Supabase. Track your job applications, manage professional contacts, and monitor your job search progress all in one place.

## Features

- Track job applications with detailed information (company, position, status, interview stages)
- Manage professional contacts and networking relationships
- Dashboard with statistics and recent activity
- Secure authentication with Supabase
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend:** React 19 with Vite
- **Styling:** Tailwind CSS v4
- **Database & Auth:** Supabase
- **Routing:** React Router v6
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 16+ installed
- A Supabase account (free tier works)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd JobTrackr
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL to create tables and security policies

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Find these values in your Supabase project settings under **API**.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── Layout.jsx     # Main app layout with header/nav
│   ├── ProtectedRoute.jsx  # Auth route guard
│   ├── ApplicationCard.jsx
│   ├── ContactCard.jsx
│   └── Modals/        # Add/Edit modals
├── contexts/          # React context providers
│   └── AuthContext.jsx     # Authentication state
├── lib/               # Utilities and configurations
│   └── supabase.js    # Supabase client
├── pages/             # Route page components
│   ├── HomePage.jsx
│   ├── ApplicationsPage.jsx
│   ├── NetworkPage.jsx
│   ├── LoginPage.jsx
│   └── SignUpPage.jsx
├── App.jsx            # Router configuration
├── main.jsx           # App entry point
└── index.css          # Tailwind imports
```

## Security

- Row Level Security (RLS) policies ensure users can only access their own data
- Authentication handled by Supabase Auth
- All API requests are authenticated with user tokens

## Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT
