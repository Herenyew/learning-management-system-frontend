# Learning Management System Frontend

React and TypeScript application for administering and using a multi-tenant learning management system.

## Highlights

- HR Program configuration, publishing, cohorts, rosters, tasks, and rewards
- Learner course catalog, Programs, assessments, surveys, and submissions
- Program phases, task waivers, peer review, attendance, and retakes
- Analytics, notifications, certificates, and XP progress
- Role- and permission-aware navigation
- SSO integration with the authentication service

## Stack

React, TypeScript, Vite, Material UI, Tailwind CSS, React Router, and Recharts.

## Local setup

Requirements: Node.js 22+, npm 10+, and running LMS/authentication APIs.

```bash
npm ci
cp .env.example .env
npm run dev
```

Important frontend settings:

```dotenv
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_EMS_API_URL=http://localhost:5000/api/v1
VITE_AUTH_SERVICE_URL=http://localhost:3861
VITE_AUTH_FRONTEND_URL=http://localhost:5174
```

The development server runs at `http://localhost:5173` by default.

## Commands

```bash
npm run dev          # Start development server
npm run typecheck    # Check TypeScript
npm run build        # Create production build
npm run format:check # Check formatting
```

## Structure

- `src/app/API` — API clients
- `src/app/models` — domain and response types
- `src/app/pages` — route-level learner pages
- `src/app/screens` — administration and feature screens
- `src/app/services` — application services
- `src/app/hooks` — reusable application hooks
