# Deployment

**Project:** Tajima Ramen
**Last updated:** 2026-07-13

## Hosting

- **Platform:** Cloudflare Pages
- **Repository:** github.com/marcopradog/tajima-ramen
- **Production URL:** [To be configured]
- **Build command:** `npm run build`
- **Output directory:** `_site`

## Cloudflare Pages Settings

### The project name, and how to build a preview URL without guessing

**Cloudflare Pages project: `tajima-ramen`.**

Recorded 2026-09-16 because it was not written down anywhere and a preview URL
had to be recovered from a GitHub check run to be quoted at all. Two forms,
both real:

```
Branch alias   https://<branch-slug>.tajima-ramen.pages.dev
Per deploy     https://<commit-hash-8>.tajima-ramen.pages.dev
```

The branch slug is the branch name with every non-alphanumeric character
turned into a hyphen, so `preview/location-photos` becomes
`preview-location-photos`:

```
https://preview-location-photos.tajima-ramen.pages.dev
```

The branch alias follows the branch, so it is the one to send to a reviewer.
The per-deploy URL is pinned to one commit and is the one to quote when you
mean a specific state.

**If you ever need to recover this again**, the authoritative source is the
Cloudflare Pages check on the pushed commit, which carries both URLs in its
output and the project name in its dashboard link:

```
gh api repos/CirculationStudio/tajima-ramen/commits/<sha>/check-runs \
  --jq '.check_runs[] | .output.summary'
```

Note that `gh api .../deployments` returns empty for this project: Cloudflare
reports through a check run rather than the GitHub deployments API, so looking
there suggests nothing has deployed when it has.

### Build Configuration

```
Build command: npm run build
Build output directory: _site
Root directory: /
Node version: 18 or later
```

### Environment Variables

[Add environment variables here if needed]

```
# Example:
# API_KEY=<value>
```

## Cloudflare Performance Settings

### Enabled Features

- **Early Hints:** ON
- **HTTP/3:** ON
- **0-RTT:** ON
- **Brotli:** Automatic
- **Rocket Loader:** OFF (breaks JS)

### Cache Configuration

- **Tiered Cache:** Enabled
- **Cache Rules:** [To be configured based on content types]

### Speed Optimization

- **Auto Minify:** OFF (minification handled at build time)
- **Cloudflare Images:** For client photos and dynamic image optimization
- **Speed Observatory:** Enabled for daily performance monitoring

## Headers

See `src/_headers` for security and caching headers configuration.

Key headers:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

[Add additional headers as needed during Phase 7]

## Redirects

See `src/_redirects` for URL redirects configuration.

[Configure redirects during Phase 9 if this is a rebuild/migration]

## Performance Budget

### Core Web Vitals Targets (75th percentile)

- **LCP (Largest Contentful Paint):** < 2.5s
- **INP (Interaction to Next Paint):** < 200ms
- **CLS (Cumulative Layout Shift):** < 0.1

These are the official Google thresholds as of July 2026.

### Asset Budget

- **Hero images:** Target < 300KB each
- **Below-fold images:** Lazy-loaded, optimized for WebP/AVIF
- **Total page weight:** Target < 1MB for initial load
- **JavaScript:** Minimal, defer/async non-critical scripts

## DNS Configuration

[To be configured during launch]

- **Domain registrar:** [To be confirmed]
- **Nameservers:** Point to Cloudflare
- **Email hosting consideration:** [Confirm where client email is hosted before DNS cutover]

## SSL/TLS

Cloudflare automatic SSL/TLS (Full or Full Strict mode)

## Deployment Process

1. Push to `main` branch triggers automatic deployment
2. Cloudflare Pages builds and deploys
3. Preview deployments created automatically for feature branches
4. Verify deployment at Cloudflare preview URL before final checks

## Monitoring

- **Cloudflare Speed Observatory:** Daily scheduled performance tests
- **Google Search Console:** Monitor indexing and search performance
- **Google Analytics:** [To be configured with client's account]

## Rollback Procedure

Cloudflare Pages maintains deployment history. Rollback via dashboard if needed.
