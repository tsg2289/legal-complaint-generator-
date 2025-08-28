# 🚀 Deployment Guide

## GitHub Repository Setup ✅
Your code is ready to push to GitHub with secure API key management.

## Vercel Deployment Steps

### 1. Connect to Vercel
- Go to [vercel.com](https://vercel.com)
- Sign in with your GitHub account
- Click "New Project"
- Import your `legal-complaint-generator` repository

### 2. Environment Variables (CRITICAL)
In Vercel project settings, add:
```
OPENAI_API_KEY = your_actual_openai_api_key_here
```

**Set for**: Production, Preview, and Development

### 3. Deploy Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 4. Deploy
Click "Deploy" - Vercel will:
- Install dependencies
- Build your app
- Deploy to global CDN
- Provide you with a live URL

## Security Checklist ✅
- ✅ API key in environment variables only
- ✅ `.env.local` not committed to Git
- ✅ Secure server-side API calls
- ✅ Ready for production

## Post-Deployment
Your app will be live at: `https://your-project-name.vercel.app`

Test the complaint generation to ensure everything works in production!
