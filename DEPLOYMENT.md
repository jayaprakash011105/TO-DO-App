# Deployment Guide for TO-DO List App

## 🚀 Deploying to Vercel

### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Repository pushed to GitHub

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect GitHub to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project**
   - Framework Preset: `Vite`
   - Root Directory: `./`
   - Build Command: `npm run build` or `yarn build`
   - Output Directory: `dist`
   - Install Command: `npm install` or `yarn install`

3. **Environment Variables** (Optional)
   - Add any environment variables if needed
   - Use the `.env.example` as reference

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # In the project root directory
   vercel
   ```

4. **Follow the prompts**
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N` (for first time)
   - Project name: `todo-list-app` (or your preferred name)
   - Directory: `./`
   - Override settings: `N`

5. **Production Deployment**
   ```bash
   vercel --prod
   ```

## 🔧 Configuration Details

### Build Settings
- **Framework**: Vite + React
- **Node Version**: 18.x or higher
- **Package Manager**: npm or yarn
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Important Files
- `vercel.json` - Vercel configuration for routing and headers
- `vite.config.js` - Vite build configuration
- `package.json` - Dependencies and scripts

## 🌐 Custom Domain (Optional)

1. Go to your project settings in Vercel Dashboard
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## 🔄 Automatic Deployments

- Every push to `main` branch triggers automatic deployment
- Pull requests create preview deployments
- Branch deployments available for testing

## 📊 Features Working in Production

✅ User Authentication (localStorage)
✅ Task Management
✅ Notes Section
✅ Recipe Management
✅ Finance Tracking with PDF Export
✅ Habit Tracker
✅ Dark Mode
✅ Data Persistence (localStorage)
✅ Responsive Design

## 🐛 Troubleshooting

### Build Fails
- Check Node version (should be 18.x or higher)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check for console errors in build logs

### Routing Issues
- Ensure `vercel.json` is present with rewrite rules
- Check that all routes are properly configured

### Environment Variables
- Add them in Vercel Dashboard > Settings > Environment Variables
- Prefix with `VITE_` for Vite to recognize them

## 📝 Post-Deployment Checklist

- [ ] Test all features in production
- [ ] Check responsive design on mobile
- [ ] Verify PDF export functionality
- [ ] Test dark mode toggle
- [ ] Ensure data persistence works
- [ ] Check all navigation tabs
- [ ] Test form submissions

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Repository](https://github.com/jayaprakash011105/TO-DO-App)

## 📧 Support

For issues or questions, please open an issue on GitHub.
