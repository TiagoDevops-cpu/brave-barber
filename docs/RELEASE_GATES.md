# Release gates

No pull request may be merged into `main` until all checks in `.github/workflows/quality.yml` pass and at least one reviewer approves it. Configure these checks as **required** in the repository branch-protection settings.

## Automated gates

- Biome formatting and linting;
- TypeScript typecheck;
- Vitest unit tests with a coverage report;
- dependency-cruiser architectural contracts (no circular dependencies and no UI imports from `src/lib`);
- Knip unused-code/dependency scan;
- production build and a 350 KiB per-JavaScript-file budget;
- Playwright end-to-end smoke test;
- conventional-commit validation on pull requests;
- production dependency audit for high-severity vulnerabilities.

## Required human gates

- Security review when changing Firebase rules, authentication, customer data, payments, third-party scripts, or server routes.
- Privacy-policy and terms-of-use approval by the responsible legal team before production release, and on every material data-processing change. This is a manual approval; the repository cannot claim legal approval automatically.
- Verify Firebase Authentication and restrictive Firestore rules before the public launch. The present temporary Firestore rules are not suitable for production.

## Operational notes

- Sentry is enabled only when `VITE_SENTRY_DSN` is configured. Do not send customer phone numbers, names, or booking notes as event context.
- Express has a general request limit. Firestore writes bypass Express, so public booking protection must be completed with Firebase App Check and authenticated server-side booking endpoints (for example, Cloud Functions) before launch.
