# Apply changes

This fork is consumed from Git, not npm. Apps load the built files in `dist/`.

1. Edit source (`src/index.ts`, `src/locales/*.json`, images under `src/assets`). Copy keys in locale files are the English sentences.
2. `npm install` (first time) then `npm run build`. Commit `dist/` with the source. The app does not use `src/`.
3. Push the branch.
4. In the app, set the dependency to this repo and branch (first time only):

```json
"pwa-add-to-homescreen": "git@github.com:jaaannnaaa/add-to-homescreen.git#firefox-guide"
```

5. After every push, refresh the lockfile in the app. `package-lock.json` pins a commit SHA, so `npm run deploy:dev` will keep building the old bundle until you do this:

```bash
npm update pwa-add-to-homescreen
```

Commit the updated `package-lock.json`, then deploy.

`npm install` inside this library folder only installs its build tools. It does not update the app.
