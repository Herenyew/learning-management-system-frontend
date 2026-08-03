# Frontend Folder Structure

This project has been arranged to match the company frontend file structure template for React, Vite, and TypeScript projects.

## Root

- `.husky/` - placeholder for Git hooks
- `public/` - static files served directly by Vite
- `src/` - frontend source code
- `.env.example` - committed frontend environment variable template
- `.eslintrc.json` - ESLint configuration placeholder
- `.gitignore` - ignored files and folders
- `.gitlab-ci.yml` - GitLab CI validation/build starter
- `.prettierrc.json` - Prettier configuration
- `docker-compose.yml` - local development services
- `Dockerfile` - production frontend build image
- `index.html` - Vite HTML entry
- `package.json` - scripts and dependencies
- `tsconfig.json` - frontend TypeScript config
- `tsconfig.node.json` - Vite/build TypeScript config
- `vite.config.ts` - Vite configuration

## Source

- `src/app/API/` - API clients and network requests
- `src/app/components/` - reusable shared UI components
- `src/app/constants/` - shared constants
- `src/app/models/` - shared TypeScript types and models
- `src/app/pages/` - route-level page containers
- `src/app/schemas/` - validation schemas
- `src/app/index.tsx` - app root export
- `src/assets/` - imported images, icons, and static assets
- `src/store/` - global state setup
- `src/styles/` - global styles
- `src/utils/` - pure utility functions
- `src/main.tsx` - React DOM entry point

The current prototype remains in `src/app/App.tsx` and the `Extensions*.tsx` files to avoid breaking the working design. As backend integration begins, screens can be moved incrementally into `src/app/pages`.
