# Enable Google Sign-in for TO-DO List App

Follow these steps to enable Google Sign-in in your Firebase project.

## Steps to Enable Google Authentication

### 1. Open Firebase Console
- Go to [Firebase Console](https://console.firebase.google.com/)
- Select your project: **todo-app-f1a2b**

### 2. Navigate to Authentication
- In the left sidebar, click **"Build"** → **"Authentication"**
- Click on the **"Sign-in method"** tab

### 3. Enable Google Provider
1. Find **"Google"** in the list of providers
2. Click on it to open settings
3. Toggle the **"Enable"** switch to ON
4. **Important**: Select a **support email** from the dropdown
   - This is required and will be shown to users
   - Usually your Gmail address
5. Click **"Save"**

### 4. Verify Configuration
After enabling, you should see:
- ✅ Google provider showing as "Enabled"
- Your support email displayed
- Status indicator showing green/active

## Testing Google Sign-in

### Test in Development
1. Go to your app: http://localhost:3000/login
2. Click **"Sign in with Google"** button
3. Select your Google account
4. You should be redirected to the dashboard

### What Happens During Google Sign-in
1. User clicks the Google button
2. Firebase opens Google's authentication popup
3. User selects/enters their Google account
4. Google verifies the user
5. Firebase creates/updates user account
6. User is logged into your app

## Troubleshooting

### Common Issues

#### "Popup blocked" Error
- **Solution**: Allow popups for localhost in your browser settings
- Chrome: Settings → Privacy → Site Settings → Popups → Allow localhost

#### "Configuration not found" Error
- **Solution**: Make sure Google provider is enabled in Firebase Console
- Verify your Firebase project ID matches in .env file

#### "Invalid OAuth client" Error
- **Solution**: 
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Select your Firebase project
  3. Go to APIs & Services → Credentials
  4. Check OAuth 2.0 Client IDs are configured

#### "User not created in Firestore"
- **Solution**: The app automatically creates user profile in Firestore on first Google login

## Security Considerations

### Domain Whitelist (Production)
When deploying to production:
1. Go to Firebase Console → Authentication → Settings
2. Add your production domain to "Authorized domains"
3. Example: `yourdomain.com`, `app.yourdomain.com`

### User Data Handling
- Google provides: email, name, profile picture
- Stored in Firestore: users collection
- Password: Not stored (Google handles authentication)

## Benefits of Google Sign-in

1. **Faster Registration**: No need to fill forms
2. **No Password Management**: Users don't need to remember another password
3. **Trusted Authentication**: Users trust Google's security
4. **Profile Information**: Automatically get user's name and photo
5. **Reduced Friction**: One-click sign in/up

## Next Steps

After enabling Google Sign-in:
1. ✅ Test login flow
2. ✅ Verify user creation in Firestore
3. ✅ Check user appears in Authentication → Users
4. ✅ Test logout and re-login
5. ✅ Test on different devices

## Additional Providers (Optional)

You can also enable:
- **GitHub** - For developer audience
- **Microsoft** - For business users
- **Apple** - For iOS users
- **Facebook** - For social login
- **Twitter** - For social login

Each provider requires similar setup steps in Firebase Console.

---

**Note**: Google Sign-in is the easiest to set up as it's already integrated with Firebase (both are Google services).
