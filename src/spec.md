# Specification

## Summary
**Goal:** Make the Provider Profile page summary-first (read-only by default) with an explicit “Change Info” → “Update” flow, while preventing any post-onboarding edits to provider bio-data.

**Planned changes:**
- Update the Provider Profile page so Service Providers see a read-only summary view by default after navigating to “My Profile” (no editable inputs shown initially).
- Display key provider details in the summary (at minimum: Name, Service Category, Hourly Rate, Phone Number, Description, Pinned Location, Engagement Status).
- Add a “Change Info” button to enter edit mode for allowed fields, plus a “Cancel” action to exit edit mode without saving.
- In edit mode, add an “Update”/“Save Changes” button that is enabled only when changes exist, saves to the backend, disables during save, and shows clear English success/error feedback; refresh summary data after successful save.
- Lock provider bio-data fields as read-only in the UI and enforce the same restriction server-side so bio-data cannot be modified after initial creation; add English helper text explaining bio-data is sourced from an ID document.
- Remove/replace outdated Provider Profile messaging about editing being available in a future update and ensure all guidance matches the new flow in English.

**User-visible outcome:** Service Providers land on a read-only “My Profile” summary, can tap “Change Info” to edit only allowed fields, then tap “Update” to save with clear feedback; bio-data fields remain non-editable and explained in English.
