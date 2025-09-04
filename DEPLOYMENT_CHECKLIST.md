# 🚀 Vercel Deployment Checklist

## Pre-Deployment Setup

### 1. Database Setup
- [ ] Create MongoDB Atlas account
- [ ] Create a new cluster
- [ ] Create database user with read/write permissions
- [ ] Whitelist IP addresses (use `0.0.0.0/0` for all IPs)
- [ ] Get connection string

### 2. Code Preparation
- [ ] Push all code to GitHub repository
- [ ] Ensure all dependencies are in package.json files
- [ ] Test build locally: `npm run build`
- [ ] Test backend locally: `cd backend && npm run build`

## Backend Deployment

### 3. Deploy Backend to Vercel
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Click "New Project"
- [ ] Import GitHub repository
- [ ] Configure backend project:
  - Framework Preset: **Other**
  - Root Directory: **backend**
  - Build Command: **npm run build**
  - Output Directory: **dist**
  - Install Command: **npm install**
- [ ] Add Environment Variables:
  ```
  MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant
  JWT_SECRET=your-super-secret-jwt-key-here
  JWT_EXPIRE=7d
  NODE_ENV=production
  PORT=3000
  FRONTEND_URL=https://your-frontend-app.vercel.app
  ```
- [ ] Deploy backend
- [ ] Note the backend URL (e.g., `https://your-backend-app.vercel.app`)

## Frontend Deployment

### 4. Deploy Frontend to Vercel
- [ ] Create new Vercel project for frontend
- [ ] Import same GitHub repository
- [ ] Configure frontend project:
  - Framework Preset: **Vite**
  - Root Directory: **/** (root)
  - Build Command: **npm run build**
  - Output Directory: **dist**
  - Install Command: **npm install**
- [ ] Add Environment Variables:
  ```
  VITE_API_BASE_URL=https://your-backend-app.vercel.app
  ```
- [ ] Deploy frontend
- [ ] Note the frontend URL (e.g., `https://your-frontend-app.vercel.app`)

## Post-Deployment Testing

### 5. Test Backend
- [ ] Visit backend URL: `https://your-backend-app.vercel.app/api/health`
- [ ] Should return: `{"status":"ok","db":"connected"}`
- [ ] Test authentication endpoint
- [ ] Test other API endpoints

### 6. Test Frontend
- [ ] Visit frontend URL: `https://your-frontend-app.vercel.app`
- [ ] Check browser console for errors
- [ ] Test login functionality
- [ ] Test API calls from frontend
- [ ] Test all major features

### 7. Update Backend Environment
- [ ] Update `FRONTEND_URL` in backend environment variables
- [ ] Redeploy backend if needed

## Final Verification

### 8. Complete System Test
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads correctly
- [ ] Product management works
- [ ] Discount creation works
- [ ] Display screen shows products
- [ ] All CRUD operations work
- [ ] Database operations work
- [ ] No console errors
- [ ] No network errors

## Security Check

### 9. Security Verification
- [ ] Environment variables are not exposed in frontend
- [ ] Database connection is secure
- [ ] JWT secrets are strong
- [ ] CORS is configured correctly
- [ ] Rate limiting is working

## 🎉 Success!

Your restaurant dashboard is now live at:
- **Frontend**: `https://your-frontend-app.vercel.app`
- **Backend**: `https://your-backend-app.vercel.app`

## 📝 Notes

- Keep your MongoDB Atlas connection string secure
- Monitor Vercel function logs for any issues
- Set up monitoring and alerts if needed
- Consider setting up a custom domain
- Regular backups of your database

## 🆘 Troubleshooting

If something doesn't work:
1. Check Vercel function logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for errors
5. Verify database connectivity
