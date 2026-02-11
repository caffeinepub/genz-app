# Specification

## Summary
**Goal:** Let service providers set an “Engaged” duration (in hours) and let clients see a live, accurate engaged/available status with remaining time across provider views.

**Planned changes:**
- Extend `ProviderProfile` to include an optional engagement end time (availability time) alongside the existing engagement boolean, and return it in provider-read views.
- Add provider-authorized backend APIs to: (1) set Engaged for N hours (store end time), and (2) clear engagement early (set Not Engaged and remove end time), with validation and authorization traps.
- Make provider-read backend responses automatically treat expired end times as Not Engaged / cleared so client views remain accurate without manual action.
- Update the Service Provider profile UI to toggle Engaged/Not Engaged; when Engaged is chosen, require an “Hours engaged” input and persist immediately; show friendly errors on failure.
- Update client-facing Provider Preview dialog and Provider Detail page to show an Engaged/Available badge and, when applicable, the remaining time until available again.
- Poll provider data while Provider Preview is open and while Provider Detail is visible (following the existing ~3-second refetch pattern), and show engagement change notices via the existing `EngagementStatusNotice` component.

**User-visible outcome:** Providers can mark themselves engaged for a set number of hours (or disengage early), and clients see a live-engagement badge plus remaining time that updates automatically until the provider is available again.
