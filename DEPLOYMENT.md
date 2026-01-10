# Deployment Guide

This guide will help you deploy the Agrideck website to Vercel.

## Prerequisites

- GitHub, GitLab, or Bitbucket account
- Vercel account (free tier is sufficient)
- Git installed locally

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   # Create a new repository on GitHub first, then:
   git remote add origin https://github.com/YOUR_USERNAME/agrideck-web.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your Git provider and authorize Vercel
   - Choose the `agrideck-web` repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Configure Domain (Optional)**
   - After deployment, go to Project Settings → Domains
   - Add your custom domain (e.g., agrideck.com)
   - Follow Vercel's DNS configuration instructions

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd /Users/sarveshsavaliya/Code/apps/agrideck-web
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - What's your project's name? `agrideck-web`
   - In which directory is your code located? `./`
   - Want to override the settings? `N`

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Environment Variables

Currently, no environment variables are required. If you need to add any in the future:

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add your variables
3. Redeploy the project

## Custom Domain Setup

1. **Add Domain in Vercel**
   - Project Settings → Domains
   - Add your domain (e.g., `agrideck.com`, `www.agrideck.com`)

2. **Update DNS Records**
   Add these records in your domain provider:

   For root domain (agrideck.com):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   For www subdomain:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Wait for Propagation**
   - DNS changes can take 24-48 hours
   - Vercel will automatically provision SSL certificates

## Automatic Deployments

Once connected to Git, Vercel will automatically:
- Deploy on every push to `main` branch (production)
- Create preview deployments for pull requests
- Run builds and tests before deployment

## Monitoring and Analytics

- **Vercel Analytics**: Enable in Project Settings → Analytics
- **Web Vitals**: Automatically tracked in production
- **Build Logs**: Available in Deployments → Select deployment → View Logs

## Troubleshooting

### Build Fails
```bash
# Test build locally first
npm run build
npm run start
```

### DNS Not Resolving
- Check DNS records with: `dig agrideck.com`
- Verify domain is not locked at registrar
- Wait for full DNS propagation (up to 48 hours)

### 404 on Routes
- Ensure `vercel.json` is properly configured
- Next.js App Router handles routes automatically
- Check for case sensitivity in route names

## Update Sitemap

After deploying, update the domain in:
- `app/sitemap.ts` - Change `https://agrideck.com` to your actual domain
- `public/robots.txt` - Update sitemap URL

## Performance Optimization

Vercel automatically handles:
- Global CDN distribution
- Automatic image optimization
- Code splitting and lazy loading
- Brotli/Gzip compression
- Edge caching

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Support: https://vercel.com/support

## Post-Deployment Checklist

- [ ] Test all pages (/, /privacy, /terms)
- [ ] Verify mobile responsiveness
- [ ] Check page load speed (Lighthouse)
- [ ] Test navigation and links
- [ ] Verify SEO metadata
- [ ] Submit sitemap to Google Search Console
- [ ] Set up monitoring/analytics
- [ ] Update app store links when available

---

Need help? Contact support@agrideck.com
