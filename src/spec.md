# Specification

## Summary
**Goal:** Fix production access on `https://genz-app.icp0.io` by resolving the “Canister ID Not Resolved” error and providing basic user guidance.

**Planned changes:**
- Add IC domain verification file at `frontend/public/.well-known/ic-domains` containing `genz-app.icp0.io`.
- Update the service worker/caching behavior so `/.well-known/ic-domains` is not blocked or incorrectly served by offline/navigation fallbacks and can be fetched successfully from the network.
- Add a small “Troubleshooting Access Issues” section to the unauthenticated Landing page in English, explicitly showing `https://genz-app.icp0.io` and instructing users to remove old bookmarks/shortcuts and retry.

**User-visible outcome:** Users can load the app at `https://genz-app.icp0.io` without the “Canister ID Not Resolved” error, and the Landing page provides clear steps to follow if the error appears.
