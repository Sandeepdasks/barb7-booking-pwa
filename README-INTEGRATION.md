# Owner Dashboard — Milestone 1 — Integration Notes

## Folder tree (drop into `src/`)

```
src/
├── types/owner.types.ts
├── constants/ownerBusinessRules.ts
├── utils/ownerDateUtils.ts
├── services/ownerService.ts
├── hooks/useOwnerSchedule.ts
├── components/owner/
│   ├── OwnerLayout.tsx
│   ├── OwnerTopBar.tsx
│   ├── OwnerBottomNav.tsx
│   ├── StatCard.tsx
│   ├── BookingCard.tsx
│   ├── StatusBadge.tsx
│   ├── DateNavigator.tsx
│   ├── LunchBreakDivider.tsx
│   └── EmptyState.tsx
├── pages/owner/
│   ├── OwnerLoginPage.tsx
│   ├── OwnerDashboardPage.tsx
│   └── OwnerSchedulePage.tsx
└── routes/ownerRoutes.tsx
```

## Files created
All 16 files above — new, no existing customer files touched.

## No repo access disclaimer
This session has no access to the actual BARB7 codebase (only the 4 spec
docs + images in the project). Every cross-reference to existing code
below is an **assumption inferred from the spec / prior phase notes**, not
a verified read of real files. Grep for these before merging:

| Assumption | Where used | Verify |
|---|---|---|
| `db` exported from `../../lib/firebase` | `ownerService.ts` | actual Firestore init file path |
| `useAuth()` returns `{ profile: { salonId, name }, signOut }` | `OwnerLayout.tsx`, `OwnerDashboardPage.tsx`, `OwnerSchedulePage.tsx` | actual `AuthContext` shape/field names |
| `ProtectedRoute` accepts `allowed: string[]` prop | `ownerRoutes.tsx` | actual prop name (`allowed` vs `roles`) |
| `EmailPasswordForm` accepts `role` + `onSuccess` props | `OwnerLoginPage.tsx` | actual component signature |
| `bookings` doc fields: `salonId, customerId, customerName, customerPhone, serviceName, durationMins, date, time, status, bookingSource` | `owner.types.ts`, `ownerService.ts` | actual field names written by customer booking flow |
| No existing shared date-utils module | `ownerDateUtils.ts` | if one exists in repo, delete this file, import from there instead (avoid duplicate utilities) |

`lucide-react` used for icons — install if not already a dependency:
`npm i lucide-react`

## Firestore
- Composite index needed: `bookings` — `salonId ASC, date ASC, time ASC` (Firestore will prompt with a console link on first query if missing).
- No writes to `slotLocks` in this milestone — status updates only touch `bookings`.

## Manual steps
1. Copy files into `src/` per tree above, fixing the import paths flagged in the assumptions table.
2. `npm i lucide-react` if missing.
3. Merge `ownerRoutes` into the main router (`createBrowserRouter` children array, or add as nested `<Route>`s under `<Routes>` in `App.tsx`).
4. Confirm an `owner`-role user doc exists in `users` with a `salonId` set, and Firebase Auth email/password account provisioned for it.
5. Deploy/verify Firestore composite index for the `bookings` query above.

## Manual testing
1. Visit `/owner/login`, sign in with owner credentials → redirects to `/owner`.
2. Dashboard shows today's counts (0s if no bookings) and revenue placeholder.
3. Tap "Go to Today Schedule" → `/owner/schedule`.
4. Create a test booking (via customer flow) for today at a time on either side of 14:00–15:30 → confirm it appears grouped correctly and the Lunch Break divider renders between 14:00 and 15:30 regardless of bookings.
5. Tap Start → In Progress badge updates; tap Mark Completed → Completed badge updates; refresh page → status persisted in Firestore.
6. Tap prev/next day arrows → schedule reloads for that date; empty day shows "No bookings for this day." plus the lunch divider still visible.
7. Try loading `/owner` or `/owner/schedule` while logged out, or logged in as `customer`/`admin` role → should be blocked by `ProtectedRoute`.

## Migration notes
- `in_progress` status is new — if any existing UI/rules/reports read the old enum (`confirmed | completed | cancelled | blocked | no_show`), they won't recognize it. None touched in this milestone, but flag for Phase 6 Firestore rules review (rules currently validate against fields, not sure if status enum is validated — check).
- `bookings`/`slotLocks` naming here supersedes the `appointments` naming in the frozen `03-Database.md`. That doc is now stale per your instruction — consider deleting or marking it superseded so it doesn't cause confusion in a future session.

## Explicitly out of scope (per Milestone 1 boundary)
Walk-in booking creation, Working Hours management UI, Service management UI, Analytics. Not touched.
