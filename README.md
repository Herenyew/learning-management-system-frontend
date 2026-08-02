# Learning Management System Frontend

React, Vite, and TypeScript frontend for ADIU's enterprise learning management system.

## Requirements

- Node.js 22+
- npm 10+
- Access to the LMS backend API

## Local setup

```bash
npm ci
copy .env.example .env
npm run dev
```

The development server runs at `http://localhost:5173` by default.

Set `VITE_API_BASE_URL` in `.env` to the backend API root. The default development value is `http://localhost:4000/api`.

## Commands

```bash
npm run dev          # Start the Vite development server
npm run typecheck    # Run TypeScript validation
npm run build        # Create a production build
npm run format       # Format the codebase
npm run format:check # Verify formatting
```

## Project structure

```text
src/
|-- app/
|   |-- API/          # Backend clients and endpoint functions
|   |-- components/   # Reusable UI components
|   |-- constants/    # Shared configuration and constants
|   |-- models/       # TypeScript domain and API contracts
|   |-- pages/        # Route-level page containers
|   |-- schemas/      # Form and payload validation schemas
|   `-- screens/      # Feature UI being incrementally moved into pages
|-- assets/           # Images and compiled assets
|-- store/            # Shared application state
|-- styles/           # Global styles and theme definitions
|-- utils/            # Framework-independent helpers
`-- main.tsx          # Application entry point
```

UI components must not call `fetch` or Axios directly. Add backend operations under `src/app/API`, keep shared response contracts under `src/app/models`, and consume them through page or store layers.

## CI and deployment

GitLab CI runs type checking, formatting validation, and the production build. The included Dockerfile creates an nginx-based static production image, and `render.yaml` defines the static Render deployment.

## Backend repository

The backend is maintained separately in `learning-management-system-backend`. This repository contains frontend code and frontend deployment configuration only.
