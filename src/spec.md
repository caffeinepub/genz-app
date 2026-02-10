# Specification

## Summary
**Goal:** Replace the existing Genz App logo asset with the user-uploaded logo while keeping the same static asset path used by the header.

**Planned changes:**
- Update `frontend/public/assets/generated/genz-app-logo.dim_512x512.png` to match the uploaded logo image.
- Ensure the updated logo is a 512x512 PNG and renders crisply at 40x40 with rounded corners without unintended cropping.

**User-visible outcome:** The app header displays the new uploaded Genz logo at the same location, loading from the existing `/assets/generated/genz-app-logo.dim_512x512.png` path.
