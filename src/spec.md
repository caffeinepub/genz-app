# Specification

## Summary
**Goal:** Provide near-real-time visibility into a provider’s engagement status while a client is viewing that provider, and display a consistent 1–5 star rating UI (with an English empty state) across client-facing provider views.

**Planned changes:**
- Frontend: Add automatic periodic refresh (polling) of the viewed provider’s data on Provider Preview and Provider Detail so engagement status stays up to date without manual refresh.
- Frontend: Show an in-app notification when the engagement status changes between “Engaged” and “Not Engaged”, and update the on-screen status indicator within ~3 seconds (best-effort via polling).
- Backend: Ensure the provider engagement status update endpoint persists the existing `isEngaged` field and is protected so providers can only update their own status.
- Frontend: Implement a consistent star-based 1–5 rating display on provider cards, provider preview, and provider detail; show an English “No ratings yet” (or equivalent) empty state when no ratings exist.

**User-visible outcome:** While viewing a provider, clients see the provider’s Engaged/Not Engaged status update automatically and receive an in-app notice when it changes, and all provider surfaces show a consistent star rating (or “No ratings yet” in English).
