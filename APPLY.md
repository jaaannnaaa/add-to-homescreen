# Apply changes

This fork is consumed from Git, not npm. Apps load the built files in `dist/`.

1. Edit source (`src/index.ts`, `src/locales/*.json`, images under `src/assets`). Copy keys in locale files are the English sentences.
2. `npm install` (first time) then `npm run build`. Commit `dist/` with the source.
3. Push the branch.
4. In the app, set the dependency to this repo and branch, then reinstall:

```json
"pwa-add-to-homescreen": "git@github.com:jaaannnaaa/add-to-homescreen.git#firefox-guide"
```

```bash
npm install
```
