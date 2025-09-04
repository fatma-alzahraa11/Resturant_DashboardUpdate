# Vercel Deployment Guide for Restaurant Dashboard

This guide will help you deploy your restaurant dashboard project to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Database**: Set up a MongoDB Atlas cluster (recommended) or use another MongoDB hosting service
3. **GitHub Repository**: Push your code to GitHub

## 🗄️ Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for all IPs)
5. Get your connection string

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

### Step 2: Deploy Backend to Vercel

1. **Go to Vercel Dashboard** and click "New Project"
2. **Import your GitHub repository**
3. **Configure the backend**:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables** in Vercel:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   NODE_ENV=production
   PORT=3000
   FRONTEND_URL=https://your-frontend-app.vercel.app
   ```

5. **Deploy the backend**

### Step 3: Deploy Frontend to Vercel

1. **Create another Vercel project** for the frontend
2. **Import the same GitHub repository**
3. **Configure the frontend**:
   - **Framework Preset**: Vite
   - **Root Directory**: `/` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**:
   ```
   VITE_API_BASE_URL=https://your-backend-app.vercel.app
   ```

5. **Deploy the frontend**

## 🔧 Configuration Files

### Backend Configuration

The following files have been created/updated for Vercel deployment:

- `backend/vercel.json` - Vercel configuration for backend
- `backend/package.json` - Updated with production scripts
- `backend/env.example` - Environment variables template

### Frontend Configuration

- `vercel.json` - Vercel configuration for frontend
- `env.example` - Environment variables template

## 🌐 Environment Variables

### Backend Environment Variables (in Vercel)

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-app.vercel.app
```

### Frontend Environment Variables (in Vercel)

```env
VITE_API_BASE_URL=https://your-backend-app.vercel.app
```

## 📁 Project Structure for Deployment

```
restaurant-project/
├── backend/                 # Backend API
│   ├── src/
│   ├── package.json
│   ├── vercel.json         # Backend Vercel config
│   └── env.example
├── src/                    # Frontend React app
├── package.json           # Frontend package.json
├── vercel.json           # Frontend Vercel config
└── env.example
```

## 🔄 Deployment Process

### Option 1: Separate Deployments (Recommended)

1. **Deploy Backend First**:
   - Create Vercel project for backend
   - Set root directory to `backend`
   - Configure environment variables
   - Deploy

2. **Deploy Frontend Second**:
   - Create Vercel project for frontend
   - Set root directory to `/` (root)
   - Set `VITE_API_BASE_URL` to backend URL
   - Deploy

### Option 2: Monorepo Deployment

1. **Deploy as single project**:
   - Use the root `vercel.json` configuration
   - Deploy both frontend and backend together

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation works locally
   - Check build logs in Vercel dashboard

2. **Database Connection Issues**:
   - Verify MongoDB Atlas connection string
   - Check IP whitelist in MongoDB Atlas
   - Ensure environment variables are set correctly

3. **CORS Issues**:
   - Update `FRONTEND_URL` environment variable
   - Check CORS configuration in backend

4. **API Not Found**:
   - Verify `VITE_API_BASE_URL` is set correctly
   - Check that backend is deployed and accessible

### Debugging Steps

1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Functions tab
   - Check logs for errors

2. **Test API Endpoints**:
   - Use Postman or curl to test backend endpoints
   - Verify database connectivity

3. **Check Frontend Console**:
   - Open browser dev tools
   - Check for API call errors

## 📝 Post-Deployment Checklist

- [ ] Backend is accessible at `https://your-backend.vercel.app`
- [ ] Frontend is accessible at `https://your-frontend.vercel.app`
- [ ] Database connection is working
- [ ] Authentication is working
- [ ] All API endpoints are responding
- [ ] Frontend can communicate with backend
- [ ] Environment variables are set correctly

## 🔒 Security Considerations

1. **Environment Variables**:
   - Never commit `.env` files to Git
   - Use strong JWT secrets
   - Rotate secrets regularly

2. **Database Security**:
   - Use strong database passwords
   - Limit IP access in MongoDB Atlas
   - Enable database authentication

3. **API Security**:
   - Implement rate limiting
   - Use HTTPS in production
   - Validate all inputs

## 📞 Support

If you encounter issues during deployment:

1. Check Vercel documentation
2. Review build logs in Vercel dashboard
3. Test locally with production environment variables
4. Check MongoDB Atlas connection

## 🎉 Success!

Once deployed, your restaurant dashboard will be available at:
- **Frontend**: `https://your-frontend-app.vercel.app`
- **Backend API**: `https://your-backend-app.vercel.app`

Remember to update your domain settings and SSL certificates as needed.
