# Deployment Guide

This guide covers deploying iCalKit to Cloudflare Pages via automatic git integration.

## Prerequisites

- Cloudflare account
- GitHub repository connected to Cloudflare
- Custom domain (optional)

## Setup

### Initial Setup

1. **Create Pages Project**
   - Go to [Cloudflare Dashboard → Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
   - Click "Create application" → "Pages" tab → "Connect to Git"
   - Select your repository
   - Configure build settings:
     - **Project name**: `icalkit`
     - **Production branch**: `main`
     - **Framework preset**: None
     - **Build command**: `pnpm build:web`
     - **Build output directory**: `web/dist`
     - **Root directory**: (leave empty)

2. **Environment Variables**
   - Add environment variable:
     - `NODE_VERSION`: `24`
   - Save and deploy

3. **Automatic Deployments**
   - Every push to `main` branch triggers automatic deployment
   - Pull requests create preview deployments

4. **Configure Branch Deployments (Optional)**

   To exclude Renovate PRs from preview deployments:
   - Go to your Pages project → **Settings** → **Builds & deployments**
   - Under **Configure Production deployments** section, find preview deployment settings
   - Select **Custom branches** (instead of "All non-production branches")
   - Configure branch patterns:
     - **Include Preview branches**: `*`
     - **Exclude Preview branches**: `renovate/*`
   - Click **Save**
   - This prevents preview builds for dependency update PRs while keeping CI checks

   Note: Cloudflare Pages evaluates exclude rules first, then include rules. So this configuration means "include all branches except those starting with renovate/".

   **Benefits:**
   - Reduces build time and Cloudflare Pages usage
   - Renovate PRs still run CI tests
   - Only meaningful feature PRs get preview deployments

### Custom Domain Setup

1. **Add Domain to Pages**
   - Go to your Pages project → Custom domains
   - Click "Set up a custom domain"
   - Enter your domain (e.g., `icalkit.app`)
   - Cloudflare will configure DNS automatically if domain is on Cloudflare

2. **Redirect \*.pages.dev to Custom Domain**

   To ensure only your custom domain is used:
   - Go to **Account Home → Bulk Redirects**
   - Click "Create Bulk Redirects list"
   - Create a list (e.g., `icalkit_pages_redirect`)
   - Add redirect:
     - **Source URL**: `icalkit.pages.dev`
     - **Target URL**: `https://icalkit.app`
     - **Status**: `301` (Moved Permanently)
   - Enable options:
     - ✅ **Preserve query string** (クエリ文字列を保存する)
     - ❌ **Include subdomains** (サブドメインを含める) - Keep disabled to allow preview deployments
     - ✅ **Subpath matching** (サブパスの一致)
     - ✅ **Preserve path suffix** (パス サフィックスを保持する)
   - Save the list
   - Click "Create Bulk Redirect"
   - Select your list and deploy

   **Result:**
   - `https://icalkit.pages.dev/` → `https://icalkit.app/`
   - `https://icalkit.pages.dev/splitter` → `https://icalkit.app/splitter`
   - Preview deployments (`*.icalkit.pages.dev`) remain accessible

3. **Verify Redirect**
   ```bash
   curl -I https://icalkit.pages.dev
   # Should return: HTTP/2 301, location: https://icalkit.app/
   ```

## Troubleshooting

### Build Fails

**Issue**: Node.js version mismatch

- **Solution**: Ensure `NODE_VERSION` environment variable is set to `24`

**Issue**: pnpm not found

- **Solution**: Cloudflare Pages auto-detects pnpm from `pnpm-lock.yaml`

## Monitoring

### Build Logs

- View build logs in Cloudflare Dashboard → Pages → [Your Project] → Deployments
- Each deployment shows full build output

### Analytics

- Access analytics at: Pages → [Your Project] → Analytics
- Monitor page views, bandwidth, and performance metrics

## Rollback

To rollback to a previous deployment:

1. Go to Pages → [Your Project] → Deployments
2. Find the deployment you want to restore
3. Click "..." → "Rollback to this deployment"

## References

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Custom Domains Guide](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Bulk Redirects Documentation](https://developers.cloudflare.com/pages/configuration/custom-domains/#disable-access-to-pagesdev-subdomain)
