# Specification

## Summary
**Goal:** Make the Support UI show the correct phone support contact and ensure the app logo renders sharply in the header.

**Planned changes:**
- Update the Support UI to display a “Customer Support” contact list that includes a “Phone Support” item with the exact number “+254 723169783”.
- Make the phone number tappable/clickable using a `tel:` link to initiate a call on supported devices/browsers.
- Ensure the Support drawer/contact list is accessible from both the header “Support” entry and the footer “Customer Support” entry.
- Improve the clarity of the existing logo image asset while keeping the exact path `/assets/generated/genz-app-logo.dim_512x512.png` and ensuring it looks crisp when shown as a 40x40 rounded header icon.

**User-visible outcome:** Users can open Support from the header or footer to see a Customer Support contact list and tap “+254 723169783” to call support, and the header logo appears sharp instead of blurry.
