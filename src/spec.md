# Specification

## Summary
**Goal:** Remove the “Troubleshooting Access Issues” section from the unauthenticated Landing page while keeping the rest of the page intact.

**Planned changes:**
- Delete the entire “Troubleshooting Access Issues” section from `frontend/src/pages/LandingPage.tsx`, including its heading, explanatory text (“Canister ID Not Resolved” / “Error 400”), the displayed URL `https://genz-app.icp0.io`, and the step-by-step instructions list.
- Ensure the remaining Landing page sections (Hero, Platform Stats, Featured Providers, Testimonials, Features, About) still render correctly in the expected order without layout issues.
- Remove any now-unused imports or code related to the removed section (e.g., `AlertCircle`) and confirm the frontend builds cleanly without lint/type errors.

**User-visible outcome:** The Landing page no longer shows troubleshooting guidance, and all other existing Landing page sections continue to display normally.
