# BARB7 Unisex Salon — Booking PWA

Foundation scaffold only. No business logic implemented yet — see roadmap below.

## Stack
React + TypeScript + Vite + Tailwind + Firebase (Auth/Firestore/Hosting/Functions) + PWA.

## Folder Structure

```
salon-booking-pwa/
├── public/
│   ├── icons/                # PWA icons (placeholder — real assets Phase 8)
│   └── manifest.json
├── src/
│   ├── app/
│   │   └── router.tsx        # route skeleton, no screens yet
│   ├── components/
│   │   ├── ui/                # shared primitives (button, input, etc.) — Phase 1 wireframes
│   │   ├── layout/             # shell, nav, header
│   │   └── shared/              # reusable app components used across 2+ features
│   ├── features/                # each follows the same internal shape:
│   │   ├── auth/                 #   components/ pages/ hooks/ services/ types/ — Phase 2
│   │   ├── booking/              #   (same shape)                          — Phase 3 (customer)
│   │   ├── owner/                #   (same shape)                          — Phase 4
│   │   ├── admin/                #   (same shape)                          — Phase 5
│   │   └── salon/                #   (same shape)                          — shared salon-info views
│   ├── contexts/
│   │   └── AuthContext.tsx     # skeleton, wired Phase 2
│   ├── hooks/                  # global cross-feature hooks
│   ├── lib/
│   │   └── firebase.ts         # Firebase app/auth/db/functions init
│   ├── services/                # role-level API/Cloud Function calls — logic added per phase
│   ├── utils/                    # reusable utility functions (date, validation, format) — stubs only
│   ├── types/                   # TS interfaces mirror 03-Database.md (frozen schema)
│   ├── constants/                # status enums, roles, booking rules constants
│   └── styles/
├── functions/                    # Cloud Functions subproject (Phase 7)
│   └── src/{booking,owner,admin,utils}/
├── firestore.rules               # placeholder deny-all (real rules Phase 6)
├── firestore.indexes.json
├── firebase.json
└── .firebaserc
```

## Type/Constant Foundation
`src/types/*` and `src/constants/booking.ts` already encode the **frozen** decisions:
- Appointment status enum: `confirmed | completed | cancelled | no_show` (`blocked` removed).
- `blockedSlots` is sole source of truth for owner blocks.
- `customerPhone` is a nullable snapshot; `customerName`/`customerEmail` are immutable required snapshots.

## Implementation Roadmap (per master-prompt.md phase order)

| Phase | Scope | Status |
|---|---|---|
| 1 | Architecture, schema, wireframes, folder structure | ✅ this delivery |
| 2 | Authentication (Google Sign-In customer, email/pw owner+admin, `users` profile) | pending |
| 3 | Customer booking flow (slots, book, cancel, my-bookings, history) | pending |
| 4 | Owner dashboard (working hours, holidays, block slots, manual bookings, status, search) | pending |
| 5 | Admin dashboard (salons, owners, customers, analytics) | pending |
| 6 | Firestore Rules (replace deny-all placeholder) | pending |
| 7 | Cloud Functions (slot-lock, overlap check, cancellation window, IST server-time validation) | pending |
| 8 | PWA features (real icons, offline caching per Requirements offline rules, install prompt) | pending |
| 9 | Testing | pending |
| 10 | Deployment | pending |

Each phase waits for explicit go-ahead before code is written, per master-prompt.md process rules.

## Structure Freeze

Folder structure finalized as of this delivery. Not touched again unless a future
requirement genuinely demands it — feature work fills these folders, doesn't reshape them.
