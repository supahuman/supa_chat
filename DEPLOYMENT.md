# 🚀 Deployment Guide

## **Deployment Strategy:**
- **Frontend (Next.js)**: Deploy to **Vercel**
- **Backend (Node.js)**: Deploy to **Render**

## **Frontend Deployment (Vercel):**

### **1. Connect to Vercel:**
- Go to [vercel.com](https://vercel.com)
- Connect your GitHub repository
- Select the `chat-widget` directory as the root

### **2. Environment Variables:**
Set in Vercel Dashboard → Project Settings → Environment Variables:
```
NEXT_PUBLIC_BOT_API_URL=https://your-backend.onrender.com
```

### **3. Deploy:**
- Vercel will auto-detect Next.js
- Uses pnpm automatically (detects pnpm-lock.yaml)
- Auto-deploys on git push

## **Backend Deployment (Render):**

### **1. Connect to Render:**
- Go to [render.com](https://render.com)
- Create new Web Service
- Connect your GitHub repository
- Set **Root Directory** to `bot`

### **2. Build & Start Commands:**
```
Build Command: pnpm install
Start Command: pnpm start
```

### **3. Environment Variables:**
Set in Render Dashboard → Environment:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_atlas_connection_string
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
ANTHROPIC_API_KEY=your_anthropic_key
COHERE_API_KEY=your_cohere_key
HUGGINGFACE_API_KEY=your_huggingface_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
BOT_ENABLED=true
ADMIN_SECRET_KEY=your_admin_secret_key
```

### **4. Deploy:**
- Render will build and deploy the backend
- Auto-deploys on git push

## **Important Notes:**

### **✅ DO:**
- Deploy frontend to Vercel (chat-widget directory)
- Deploy backend to Render (bot directory)
- Set environment variables in both platforms
- Use pnpm for both deployments

### **❌ DON'T:**
- Deploy the entire monorepo to one platform
- Mix frontend and backend on the same service
- Forget to set environment variables

## **After Deployment:**

1. **Get your Render backend URL** (e.g., `https://your-backend.onrender.com`)
2. **Update Vercel environment variable** `NEXT_PUBLIC_BOT_API_URL` with the Render URL
3. **Test the connection** between frontend and backend
4. **Verify all features work** in production

## **Troubleshooting:**

### **Backend Issues:**
- Check Render logs for dependency errors
- Verify all environment variables are set
- Ensure MongoDB Atlas allows connections from Render IPs

### **Frontend Issues:**
- Check Vercel build logs
- Verify `NEXT_PUBLIC_BOT_API_URL` is set correctly
- Test API calls in browser dev tools

### **Connection Issues:**
- Verify CORS is configured in backend
- Check if backend URL is accessible
- Test API endpoints directly
