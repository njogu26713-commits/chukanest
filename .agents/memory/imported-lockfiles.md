---
name: Imported npm lockfiles
description: Imported Replit projects may carry private registry URLs that break installs on external hosts.
---

When deploying an imported Node project outside Replit, inspect package-lock.json for Replit-internal registry hosts. Regenerate the lockfile from package.json using the public npm registry and keep a project .npmrc pointing at registry.npmjs.org.

**Why:** npm ci can hang or fail with an npm exit-handler error when it tries to fetch lockfile tarballs from an internal Replit-only host.

**How to apply:** Before external deployment, run a clean npm ci and confirm the lockfile has no private registry references.