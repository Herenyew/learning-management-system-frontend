# Enterprise Learning Management System (Community)

This is a code bundle for Enterprise Learning Management System (Community). The original project is available at https://www.figma.com/design/42Azp1bGW2gTR2hx8KDKWM/Enterprise-Learning--Management-System--Community-.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Frontend folder structure

The project follows React + Vite + TypeScript structure:

```text
src/
├── app/
│   ├── API/
│   ├── components/
│   ├── constants/
│   ├── models/
│   ├── pages/
│   ├── schemas/
│   └── index.tsx
├── assets/
├── store/
├── styles/
├── utils/
├── main.tsx
├── fonts.d.ts
├── svg.d.ts
└── vite-env.d.ts
```

The large Figma-generated prototype files remain in `src/app` for now so the current app keeps running. Future implementation work should gradually move route-level screens into `src/app/pages`, reusable UI into `src/app/components`, and API calls into `src/app/API`.
