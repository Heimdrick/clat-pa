# clat-pa

Profit Analysis tool for Connect Latam deal pricing: cost waterfall from vendor
cost to partner price, commission calculation, multi-currency quoting and signed
PDF output.

Production: <https://clat-pa.netlify.app>

## Architecture

A single-file SPA. `index.html` contains everything: styles, markup and three
inline `<script>` blocks.

| Block | Contents | Size |
| --- | --- | --- |
| 1 | MSAL Browser 2.38.3 (vendored, self-hosted) | ~367 KB |
| 2 | jsPDF + autoTable (vendored) | ~356 KB |
| 3 | Application code | ~98 KB |

There is no build step and no bundler. Netlify publishes the repository root as
static files; `netlify.toml` only sets security headers and disables caching.

Libraries are vendored rather than loaded from a CDN so the tool keeps working
if a CDN is unreachable, and so no third party sees traffic from a page that
handles deal margins.

### Data

There is no backend. State lives in two places:

- **SharePoint** — each analysis is one JSON record under
  `Internal/KnowledgeBase/01_Sales_Assets/Profit_Analysis/PA_Registry`, read and
  written through Microsoft Graph. Signed PDFs are uploaded to the same folder on
  validation.
- **The browser** — `sessionStorage` holds the MSAL token cache, `localStorage`
  holds the UI language. Nothing else is persisted client-side.

Authentication is MSAL against the Connect Latam tenant. Only the accounts in
`APP_CONFIG.validators` can sign off an analysis; only `fernando@connect.lat`
can override commission rates.

> **One tab at a time.** Two tabs open on the same record will overwrite each
> other — last write wins. Wait for the *Guardado · SharePoint* confirmation
> before closing a tab.

## Development

Edit `index.html` directly, then serve the folder over HTTP — opening the file
with `file://` breaks the MSAL redirect:

```bash
python3 -m http.server 8080
```

Sign-in only works from an origin registered as a redirect URI on the
`Clat_PA` app registration, so local sign-in requires `http://localhost:8080`
to be registered.

### Before opening a pull request

```bash
node scripts/validate.mjs
```

The same script runs in CI on every push and pull request. It checks that the
application script block parses, that the block order has not shifted, that
every literal `$('id')` resolves to an element in the markup, and that no
conflict markers or `debugger` statements survived. A syntax error in the
application block takes the whole tool down silently once deployed, which is
what this guards against.

Dynamic references such as `$('cp-' + role)` are not checked — only literals.

## Deployment

This repository is the source of truth. Netlify deploys from a mirror.

Netlify's free plan cannot deploy a private repository owned by an
organization, so every push to `main` is mirrored to `Heimdrick/clat-pa`, a
private personal repository, and Netlify's Git integration builds from that.

The mirror is a build artifact, not a fork. It holds only the files Netlify
serves, as a single orphan commit naming the source revision it came from;
`.github/` is deliberately absent so the workflows do not run a second time
there. Never commit to it — the next deploy force-overwrites it. All pull
requests belong here.

Mirroring is gated on validation, so a commit that fails
`scripts/validate.mjs` never reaches the mirror and never reaches production.
It needs a `MIRROR_TOKEN` repository secret — a personal access token with
Contents: Read and write on the mirror, owned by the mirror's owner. Letting
that token expire silently stops deployments while `main` keeps accepting
commits, so the Actions tab is the place to check when the site looks stale.

Do not use the Netlify drag-and-drop panel any more. It bypasses validation
and history, and a manual drop is overwritten by the next deploy.

## Conventions

- Commit messages, pull requests, branch names and code comments in English.
- User-facing strings in Spanish, with Portuguese and English in the `I18N`
  table. Every new string needs all three.
- Money is rounded to two decimals **up** at the unit-price level. Line prices
  are the source of truth; the profitability waterfall reconciles to them, never
  the other way around.
- Local-currency amounts are always derived from an explicit FX rate and spread
  with the rate date recorded on the analysis. Never an implicit or live rate.
