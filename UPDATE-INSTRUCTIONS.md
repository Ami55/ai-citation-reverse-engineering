# AI Citation Reverse Engineering Update

## Changes

- Added a prominent **New Research** button to the main header.
- New Research opens a clean project configuration instead of reusing demo values.
- Fixed the project modal so it refreshes its fields when a different or new project opens.
- Removed all previous client-specific names, domains, URLs, placeholders, presets and hard-coded matching rules.
- Replaced the demo target with the neutral `sample-brand` slug and reserved sample domain `sample-brand.example`.
- Target-brand matching and display labels are now derived from the domain entered by the user.

## Deploy

Replace the existing files in the app's GitHub repository with this package and commit the changes. The connected Vercel project should deploy automatically.

## Verification

The project passes `tsc --noEmit` and the Vite production build.
