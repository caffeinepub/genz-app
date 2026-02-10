# Specification

## Summary
**Goal:** Regenerate the existing Genz App logo asset so it renders crisply as a small rounded header icon.

**Planned changes:**
- Regenerate `frontend/public/assets/generated/genz-app-logo.dim_512x512.png` as a sharp, clean 512×512 PNG suitable for downscaling to ~40–80 CSS pixels.
- Preserve the exact public asset path `/assets/generated/genz-app-logo.dim_512x512.png` so no code changes are required.

**User-visible outcome:** The header app icon looks sharp and not blurry/pixelated at current responsive sizes.
