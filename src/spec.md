# Specification

## Summary
**Goal:** Allow an admin/back-office user to wipe all existing service providers and seed a fresh set of category-specific providers so browsing results reflect the new dataset immediately.

**Planned changes:**
- Add an admin-only backend operation to delete all existing service provider data (at minimum providerProfiles entries and provider role assignments) and ensure stats/results return zero providers after reset.
- Add an admin-only backend operation to seed multiple realistic provider profiles with a stored category so they appear only in matching category browsing, and also appear in “All Providers” mode.
- Add a simple back-office UI with two actions (“Delete All Providers” and “Seed Category Providers”), including confirmation for deletion, clear English success/error feedback, and invalidation of provider-related cached queries on success.

**User-visible outcome:** An authenticated admin can delete all providers (immediately making browsing return no providers) and then seed a new set of providers that show up only in their respective categories (and in the all-providers view), with clear confirmation and feedback in the back-office UI.
