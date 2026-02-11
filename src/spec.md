# Specification

## Summary
**Goal:** Fix the Client “Provider Results” page to show real provider profiles from the backend (optionally filtered by category/businessType) and clearly display each provider’s Engaged / Not Engaged status.

**Planned changes:**
- Backend: add/extend an authenticated query that returns a list of provider profiles for client browsing, optionally filtered by BusinessType, including `isEngaged` and `engagementEndTime` (treat past `engagementEndTime` as Not Engaged).
- Frontend: replace the current empty/mock provider array on `ProviderResultsPage` with React Query fetching from the backend list query, including loading and error UI with English text and a retry action.
- Frontend: update provider cards in the results grid to show an English engagement status indicator (Engaged / Not Engaged) based on the backend list query data, while preserving the existing preview dialog behavior and polling when the dialog is open.
- Frontend: ensure provider counts and empty-state messaging reflect real backend results (including a “no providers for this category” empty-state when appropriate).

**User-visible outcome:** A logged-in client can browse a non-empty list of providers (or a correct empty-state), filter by category or view all providers, see accurate provider counts, and view each provider’s Engaged / Not Engaged status directly on the results cards.
