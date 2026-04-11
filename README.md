# BigBrain

A full-stack real-time quiz platform inspired by Kahoot. Admins create and host quiz sessions while players join and answer questions live with a countdown timer.

> Built on top of a course-provided backend scaffold — independently redesigned and extended the frontend, and refactored the backend to fit custom game logic.

<!-- Demo: [link here] -->

## Technical Highlights

- **JWT-based authentication** — admin login/register flow with token stored in localStorage, Bearer token sent on every protected API call
- **Real-time session polling** — frontend polls the server every 500ms to sync game state (question progress, timer, player answers) without WebSockets
- **Dual-role architecture** — separate flows for Admin (game host) and Player (participant), each with independent routing and API access
- **Three question types** — single choice, multiple choice, and true/false, each with different answer selection and scoring logic
- **Session lifecycle management** — admins control game flow via START / ADVANCE / END mutations; frontend reflects state changes in real time
- **Countdown timer synced to server time** — timer is calculated from `isoTimeLastQuestionStarted` returned by the server, not local state, to prevent drift

## Tech Stack

| | |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 4, React Router 7, Axios, Recharts |
| Backend | Node.js, Express, JWT |
| Testing | Vitest (frontend), Jest (backend) |

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev   # runs on http://localhost:5005
```

### Frontend

```bash
cd frontend
npm install
npm run dev   # runs on http://localhost:5173
```
