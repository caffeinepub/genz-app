# Specification

## Summary
**Goal:** Enable PWA installability for Genz App, including “Install to Home Screen,” minimal offline app-shell support, and an in-app install prompt with iOS instructions.

**Planned changes:**
- Add a `manifest.webmanifest` served from the frontend public/static path with name “Genz App”, required install fields (short_name, start_url, display, theme/background colors), and icon entries (192x192, 512x512).
- Update `frontend/index.html` to link the manifest, set appropriate PWA meta tags (including theme-color and iOS-related tags), and set the document title to “Genz App”.
- Add a service worker under the frontend public/static path plus runtime registration code (without editing `frontend/src/main.tsx`) to precache the static app shell and provide a basic offline shell/page, while avoiding caching authenticated API requests.
- Implement an in-app install prompt UI that appears only when install is available, triggers the native prompt on supported browsers, hides when already installed, and shows English manual “Add to Home Screen” instructions on iOS Safari.

**User-visible outcome:** Users on supported mobile browsers can install “Genz App” to their home screen, see an in-app install call-to-action when available (or iOS instructions on Safari), and reopen the installed app to a basic offline shell after an initial successful load.
