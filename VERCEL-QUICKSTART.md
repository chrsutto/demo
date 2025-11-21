# 🚀 Quick Vercel Deployment

Deploy your Stablecoin Yield Aggregator to Vercel in **3 easy steps**!

---

## ⚡ Method 1: One-Click Deploy (30 Seconds)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

### Step 2: Go to Vercel
- Visit: https://vercel.com/new
- Click "Import Git Repository"
- Select your repository
- Click "Deploy"

### Step 3: Done! 🎉
Your dashboard is live at: `https://your-project.vercel.app`

---

## 🔥 Method 2: Vercel CLI (Even Faster!)

### One-Time Setup:
```bash
npm install -g vercel
vercel login
```

### Deploy:
```bash
cd stablecoin-yield-aggregator
vercel --prod
```

**That's it!** Your site is live in seconds! ⚡

---

## 📦 What's Included

This package contains:

✅ **vercel.json** - Pre-configured for optimal deployment
✅ **api/yields.js** - Serverless API endpoint ready to use
✅ **.vercelignore** - Excludes unnecessary files
✅ **stablecoin-yield-dashboard.html** - Your beautiful dashboard

---

## 🌐 Live URLs After Deployment

You'll get these URLs automatically:

- **Production:** `https://stablecoin-yield-aggregator.vercel.app`
- **Dashboard:** `https://stablecoin-yield-aggregator.vercel.app/`
- **API Endpoint:** `https://stablecoin-yield-aggregator.vercel.app/api/yields`

---

## 🎯 Test Your Deployment

### Test the Dashboard:
1. Open your Vercel URL in a browser
2. You should see the yield aggregator dashboard
3. Filter and sort should work immediately

### Test the API:
```bash
curl https://your-project.vercel.app/api/yields
```

Should return JSON with yield data!

---

## 🔧 Troubleshooting

### Dashboard not showing?
- Check: https://your-project.vercel.app/
- Verify: vercel.json is properly configured

### API not working?
- Check: https://your-project.vercel.app/api/yields
- View logs: `vercel logs`

### Build failed?
```bash
# Test locally first
vercel dev
```

---

## 📊 Free Tier Includes:

✅ 100 GB Bandwidth/month  
✅ Unlimited deployments  
✅ Automatic HTTPS  
✅ Global CDN  
✅ Custom domains  
✅ Serverless functions  

Perfect for this project! 🎉

---

## 🎨 Optional: Add Custom Domain

1. Go to Vercel Dashboard
2. Settings → Domains
3. Add: `yields.yourdomain.com`
4. Update DNS (Vercel provides instructions)
5. Done! Auto-HTTPS included

---

## 📚 Full Documentation

For detailed instructions, see:
- **VERCEL-DEPLOYMENT.md** - Complete deployment guide
- **README.md** - Project documentation
- **DATA-SOURCES-API-REFERENCE.md** - API documentation

---

## 🎉 You're Live!

Visit your deployed dashboard and start tracking stablecoin yields! 🚀

**Need help?** Check VERCEL-DEPLOYMENT.md for detailed instructions.
