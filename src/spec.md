# Specification

## Summary
**Goal:** Add an Administrator-only provider verification workflow where providers submit required documents and the Administrator reviews profiles and verifies providers via a single “Verify” action.

**Planned changes:**
- Add backend endpoints for providers to upload/submit verification documents (academic qualification(s), certificate of good conduct) and set verification status to Pending upon submission.
- Add backend Administrator-only endpoints to list providers needing review, fetch a provider’s full profile + submitted documents + current verification status, and mark the provider as Verified (optionally Rejected with a reason).
- Replace the admin “Verification Review” placeholder page with a functional, access-controlled review UI to browse providers, view profile + documents + status, and click “Verify” with loading and success/error feedback.
- Replace the provider “Verification Status / Document Upload” placeholder page with a functional upload + submission UI that displays status (Unverified / Pending / Verified / Rejected) and shows rejection reasons when applicable.
- Update all verification-related UI terminology to use “Administrator” instead of “technical team”, including renaming “Technical Team Tools” to “Administrator Tools” (or equivalent).
- Add/extend React Query hooks for the new verification endpoints and invalidate/refetch relevant queries so status updates appear immediately without a full reload.

**User-visible outcome:** Providers can upload and submit required verification documents and see their verification status, while Administrators can review provider profiles/documents and verify (or reject) providers from a working admin review page.
