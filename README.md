# DualForce

A fitness and productivity tracker for students and working people. Balance workouts, study time, sleep, and calorie tracking in one clean app.

## Features

- **Auth** — Email OTP sign-in (no password needed), account creation is automatic
- **Goals** — Set weekly workout targets, study hours, sleep goals, and daily calorie targets
- **Dashboard** — See today's calories & sleep progress + this week's workout & study totals at a glance
- **Logging** — Log workouts, study sessions, sleep (with quality rating), and food/calories
- **Weekly Report** — Browse any past week's performance vs your goals with pass/fail indicators

## Stack

| Layer | Tech |
|---|---|
| Mobile | Expo SDK 53, React Native, Expo Router, NativeWind |
| State | Zustand, React Query |
| Auth | Better Auth (Email OTP) |
| Backend | Hono, Bun |
| Database | SQLite via Prisma |

## Project Structure

```
mobile/src/app/
  sign-in.tsx           — Email input (public)
  verify-otp.tsx        — OTP verification (public)
  (app)/
    _layout.tsx         — Protected area layout
    onboarding.tsx      — Set/edit goals (modal)
    log-workout.tsx     — Log a workout (modal)
    log-study.tsx       — Log a study session (modal)
    log-sleep.tsx       — Log sleep + quality (modal)
    log-calories.tsx    — Log food/calories (modal)
    (tabs)/
      index.tsx         — Dashboard tab
      report.tsx        — Weekly report tab
      settings.tsx      — Profile & sign out tab

backend/src/
  auth.ts               — Better Auth config
  prisma.ts             — Prisma client
  routes/
    goals.ts            — GET/PUT /api/goals
    workouts.ts         — GET/POST/DELETE /api/workouts
    study.ts            — GET/POST/DELETE /api/study
    sleep.ts            — GET/POST/DELETE /api/sleep
    calories.ts         — GET/POST/DELETE /api/calories
    dashboard.ts        — GET /api/dashboard
    report.ts           — GET /api/report/weekly
```

## API Endpoints

All app routes are auth-protected and return `{ data: ... }`.

| Method | Path | Description |
|---|---|---|
| GET/PUT | `/api/goals` | User goals |
| GET/POST/DELETE | `/api/workouts` | Workout logs |
| GET/POST/DELETE | `/api/study` | Study session logs |
| GET/POST/DELETE | `/api/sleep` | Sleep logs |
| GET/POST/DELETE | `/api/calories` | Calorie logs |
| GET | `/api/dashboard` | Today + this week summary |
| GET | `/api/report/weekly?weekOffset=0` | Full weekly breakdown |
| GET | `/api/me` | Current user |
| GET/POST | `/api/auth/*` | Better Auth endpoints |
