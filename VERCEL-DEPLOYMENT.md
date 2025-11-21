# 🚀 Vercel Deployment Guide

Complete guide to deploy your Stablecoin Yield Aggregator on Vercel.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works perfectly)
- Your repository uploaded to GitHub

---

## 🎯 Deployment Options

### Option 1: Deploy via Vercel Website (Easiest) ⭐

1. **Upload to GitHub first**
   - Follow GITHUB-SETUP.md
   - Make sure your repository is public or accessible

2. **Go to Vercel**
   - Visit https://vercel.com
   - Click "Sign Up" or "Log In"
   - Choose "Continue with GitHub"

3. **Import Project**
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Find your `stablecoin-yield-aggregator` repository
   - Click "Import"

4. **Configure Project**
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: (leave empty or use "npm install")
   Output Directory: (leave empty or use "./")
   Install Command: npm install
   ```

5. **Environment Variables** (Optional)
   - Add `PORT=3000` if using the backend
   - Click "Deploy"

6. **Done!** 🎉
   - Your dashboard will be live at: `https://your-project.vercel.app`
   - The dashboard works immediately (static HTML)

---

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to your project**
   ```bash
   cd stablecoin-yield-aggregator
   ```

3. **Login to Vercel**
   ```bash
   vercel login
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? `Y`
   - Which scope? Choose your account
   - Link to existing project? `N`
   - Project name? `stablecoin-yield-aggregator`
   - Directory? `./`
   - Override settings? `N`

5. **Production deployment**
   ```bash
   vercel --prod
   ```

---

## 🔧 Vercel Configuration Files

Create these files in your project root for optimal deployment:

### 1. vercel.json (Required for API Routes)

```json
{
  "version": 2,
  "name": "stablecoin-yield-aggregator",
  "builds": [
    {
      "src": "stablecoin-yield-dashboard.html",
      "use": "@vercel/static"
    },
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/stablecoin-yield-dashboard.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. Update package.json

Add these scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js",
    "vercel-build": "echo 'Build complete'"
  },
  "engines": {
    "node": "18.x"
  }
}
```

---

## 🌐 Deploying Frontend Only (Recommended for Start)

If you just want to deploy the dashboard without the backend:

### Step 1: Create vercel.json (Simple)

```json
{
  "version": 2,
  "name": "stablecoin-yield-aggregator",
  "builds": [
    {
      "src": "stablecoin-yield-dashboard.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/stablecoin-yield-dashboard.html"
    }
  ]
}
```

### Step 2: Deploy

```bash
vercel --prod
```

### Step 3: Access

Your dashboard will be live at:
```
https://your-project-name.vercel.app
```

---

## 🔥 Deploying Full Stack (Frontend + Backend)

### Restructure for Vercel

Create an `api` folder for serverless functions:

1. **Create folder structure**
   ```bash
   mkdir api
   ```

2. **Move server code to api/yields.js**

Create `api/yields.js`:

```javascript
// Serverless function for Vercel
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

// Import your fetch functions from server.js
async function fetchDefiLlamaYields() {
  try {
    const cached = cache.get('defillama');
    if (cached) return cached;

    const response = await fetch('https://yields.llama.fi/pools');
    const data = await response.json();
    
    const stablecoinYields = data.data
      .filter(pool => 
        pool.stablecoin === true && 
        pool.tvlUsd > 1000000 &&
        pool.apy < 200
      )
      .slice(0, 30)
      .map(pool => ({
        protocol: pool.project,
        stablecoin: pool.symbol,
        chain: pool.chain,
        apy: parseFloat(pool.apy.toFixed(2)),
        tvl: pool.tvlUsd,
        type: 'Lending',
        source: 'defillama',
        updatedAt: new Date().toISOString()
      }));

    cache.set('defillama', stablecoinYields);
    return stablecoinYields;
  } catch (error) {
    console.error('DeFi Llama error:', error);
    return [];
  }
}

// Serverless handler
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const yields = await fetchDefiLlamaYields();
    
    res.status(200).json({
      success: true,
      data: yields,
      stats: {
        totalOpportunities: yields.length,
        totalTVL: yields.reduce((sum, y) => sum + y.tvl, 0),
        avgAPY: yields.reduce((sum, y) => sum + y.apy, 0) / yields.length,
        maxAPY: Math.max(...yields.map(y => y.apy)),
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch yield data'
    });
  }
};
```

3. **Create vercel.json**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    },
    {
      "src": "stablecoin-yield-dashboard.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/yields",
      "dest": "/api/yields.js"
    },
    {
      "src": "/(.*)",
      "dest": "/stablecoin-yield-dashboard.html"
    }
  ]
}
```

4. **Deploy**
   ```bash
   vercel --prod
   ```

---

## 🔐 Environment Variables

If you need environment variables:

### Via CLI:
```bash
vercel env add NODE_ENV
# Enter: production

vercel env add PORT
# Enter: 3000
```

### Via Dashboard:
1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add variables
4. Redeploy

---

## 🌍 Custom Domain

1. **Go to your project on Vercel**
2. **Settings → Domains**
3. **Add your domain**
   - Example: `yields.yourdomain.com`
4. **Update DNS records** (Vercel provides instructions)
5. **Wait for SSL certificate** (automatic)

---

## 🔄 Automatic Deployments

Vercel automatically deploys when you:
- Push to `main` branch (production)
- Push to any branch (preview deployment)

### Configure:
1. Settings → Git
2. Choose production branch
3. Enable/disable preview deployments

---

## 📊 Monitoring & Analytics

### View deployment logs:
```bash
vercel logs
```

### Add analytics to your dashboard:

```html
<!-- Add to stablecoin-yield-dashboard.html before </body> -->
<script defer src="https://analytics.vercel.com/track.js"></script>
```

---

## ⚡ Performance Optimization

### 1. Enable Compression

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Encoding",
          "value": "gzip"
        }
      ]
    }
  ]
}
```

### 2. Add Caching Headers

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=300, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

### 3. Use Edge Functions

```json
{
  "functions": {
    "api/yields.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

---

## 🐛 Troubleshooting

### Issue: Build fails

**Solution:**
```bash
# Test build locally first
npm install
npm run build
```

### Issue: API routes not working

**Solution:**
- Check vercel.json routes
- Ensure API files are in `/api` folder
- Check function logs: `vercel logs`

### Issue: Environment variables not working

**Solution:**
```bash
# List env vars
vercel env ls

# Pull env vars locally
vercel env pull
```

### Issue: 404 errors

**Solution:**
Check your vercel.json routes:
```json
{
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/stablecoin-yield-dashboard.html"
    }
  ]
}
```

---

## 📱 Testing Before Deploy

### Local Vercel environment:

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev
```

This simulates the Vercel environment locally!

---

## 🎯 Best Practices

1. **Use Environment Variables** for sensitive data
2. **Enable Edge Caching** for better performance
3. **Set up Custom Domain** for professional look
4. **Monitor Logs** regularly
5. **Use Preview Deployments** to test changes
6. **Enable Analytics** to track usage
7. **Set up Alerts** for downtime

---

## 📊 Vercel Free Tier Limits

- ✅ 100 GB Bandwidth/month
- ✅ 100 GB-hours Serverless Function Execution
- ✅ 1000 Image Optimizations
- ✅ Unlimited websites
- ✅ Automatic HTTPS
- ✅ Custom domains

Perfect for this project! 🎉

---

## 🔗 Useful Vercel Commands

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# Check deployment status
vercel ls

# View logs
vercel logs

# Open dashboard
vercel

# Remove deployment
vercel rm [deployment-url]

# Link to existing project
vercel link

# Environment variables
vercel env ls
vercel env add
vercel env rm
```

---

## 🎨 Example Deployment URLs

After deployment, you'll get:
- **Production:** `https://stablecoin-yield-aggregator.vercel.app`
- **Preview:** `https://stablecoin-yield-aggregator-git-feature.vercel.app`
- **Custom:** `https://yields.yourdomain.com`

---

## 📞 Support

### Vercel Documentation
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Discord: https://vercel.com/discord

### Project Issues
- Check your Vercel dashboard
- View deployment logs
- Check GitHub Actions (if enabled)

---

## ✅ Deployment Checklist

- [ ] Repository on GitHub
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] vercel.json configured
- [ ] Dashboard deployed successfully
- [ ] API routes working (if using backend)
- [ ] Custom domain added (optional)
- [ ] Analytics enabled (optional)
- [ ] Environment variables set (if needed)
- [ ] SSL certificate active
- [ ] Tested in production

---

## 🎉 Quick Deploy (30 seconds)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Navigate to project
cd stablecoin-yield-aggregator

# 3. Deploy!
vercel --prod

# Done! 🚀
```

---

**Your dashboard will be live in under a minute!**

Visit: `https://your-project.vercel.app` 🎊
