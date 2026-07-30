# LTSV Netlify Deploy Guide

## What This Version Does

- Opens publicly on staff phones.
- Keeps the LTSV staff PIN login inside the system.
- Saves shared office data through Netlify Blobs.
- Supports attendance, QR attendance, leave, gate pass, tasks, clients, candidates, reports, and invoices.

## Best Deploy Method

Use Netlify with a GitHub repository.

1. Create or open a Netlify account.
2. Click **Add new site**.
3. Choose **Import an existing project**.
4. Connect the GitHub repository that contains this project.
5. Keep these settings:
   - Build command: `pnpm run build:netlify`
   - Publish directory: `netlify-dist`
   - Functions directory: `netlify/functions`
6. Deploy the site.

## After Deploy

- Open the Netlify site link on your phone.
- Login with the existing staff PIN codes.
- Test by adding one small task or attendance entry from one phone.
- Refresh the site on another phone and check that the same entry appears.

## Important

Do not remove `netlify.toml`, `netlify/functions/state.mjs`, `netlify/index.html`,
`netlify/main.tsx`, or `vite.netlify.config.ts`. These files are what make the
public Netlify version work.
