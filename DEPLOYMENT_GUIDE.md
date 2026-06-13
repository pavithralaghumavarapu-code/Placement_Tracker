# Deployment Guide: Render (Backend) + Vercel (Frontend)

## Step 1: Deploy Backend to Render

1. **Create Render account** at https://render.com (if not already)

2. **Create a new Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo (or use public repo)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

3. **Set Environment Variables** in Render dashboard:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://assffdirga_db_user:dZ4y1sNrp711QUuV@cluster0.taeehts.mongodb.net/placement_tracker
   JWT_SECRET=pavithrapavithra
   CLOUDINARY_CLOUD_NAME=drba82tp0
   CLOUDINARY_API_KEY=675742513681784
   CLOUDINARY_API_SECRET=b3hdv2n7cHnkJRYtpOjfKFEcJbM
   CLIENT_URL=<your-vercel-frontend-url-here>
   ```

4. **Deploy** - Render will give you a URL like: `https://your-app-name.onrender.com`
   - **Copy this URL** - you'll need it for the frontend

---

## Step 2: Deploy Frontend to Vercel

1. **Create Vercel account** at https://vercel.com (if not already)

2. **Import Project:**
   - Click "Add New" → "Project"
   - Select your GitHub repo
   - Framework: React
   - Root Directory: `frontend`

3. **Set Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://your-render-backend-url.onrender.com/api
     ```

4. **Deploy** - Vercel will give you a URL like: `https://your-project.vercel.app`
   - **Copy this URL** - you need it for backend CLIENT_URL

---

## Step 3: Update Backend with Frontend URL

1. Go back to **Render Dashboard** → Your Backend Service
2. Click "Environment" 
3. Update `CLIENT_URL` to your Vercel URL:
   ```
   CLIENT_URL=https://your-project.vercel.app
   ```
4. Render will auto-redeploy

---

## Step 4: Verify Deployment

- Visit your **Vercel frontend URL**
- Test login/API calls
- Check browser console for any CORS errors
- If issues, verify both URLs are set correctly in environment variables

---

## Important Notes

- **Render free tier:** Services sleep after 15 min of inactivity. Consider a paid plan for production.
- **First deploy:** May take 5-10 minutes
- **Both services must know each other's URLs** for CORS to work
- Keep your secrets safe - never commit `.env` files to GitHub

