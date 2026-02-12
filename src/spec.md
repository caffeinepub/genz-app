# Specification

## Summary
**Goal:** Fix the Client Profile “Save Required Information” flow so required profile fields persist correctly without triggering a page reload/refresh loop.

**Planned changes:**
- Backend: add a dedicated update method for required client profile fields (names, yearOfBirth, idNumber, mobile/phone number, pinnedLocation) that updates the caller’s existing profile with current validation and clear auth/role/existence errors.
- Frontend: update Client Profile save to call the new update mutation (instead of the initial create method), show a pending/loading state during save, and display clear error messages on failure.
- Frontend: ensure React Query invalidation/refetch updates the displayed profile after save without repeated refresh/navigation loops.

**User-visible outcome:** From the Client Profile page, users can click “Save Required Information” to update their existing profile fields without the page reloading; after saving, the updated values remain stored and are shown again when revisiting the page, and failures show a clear error message.
