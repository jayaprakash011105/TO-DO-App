# Firebase Activation Steps - TO-DO List App

Follow these steps to activate Firebase for your TO-DO List application.

## ✅ Step 1: Create Firebase Project

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project" or "Add project"
   - Project name: `todo-list-app-[yourname]` (e.g., `todo-list-app-jay`)
   - Click "Continue"

3. **Configure Google Analytics (Optional)**
   - You can disable this for now
   - Click "Create project"
   - Wait for project creation (about 30 seconds)

## ✅ Step 2: Enable Authentication

1. **Navigate to Authentication**
   - In the left sidebar, click "Build" → "Authentication"
   - Click "Get started"

2. **Enable Email/Password**
   - Go to "Sign-in method" tab
   - Click "Email/Password"
   - Toggle "Enable" switch ON
   - Click "Save"

3. **Enable Google Sign-in (Optional)**
   - Click "Google" in the providers list
   - Toggle "Enable" switch ON
   - Select a support email
   - Click "Save"

## ✅ Step 3: Set up Firestore Database

1. **Navigate to Firestore**
   - In the left sidebar, click "Build" → "Firestore Database"
   - Click "Create database"

2. **Configure Security**
   - Choose "Start in test mode" for development
   - Note: Test mode allows read/write for 30 days
   - Click "Next"

3. **Select Location**
   - Choose location closest to you:
     - For India: `asia-south1 (Mumbai)`
     - For US: `us-central1`
   - Click "Enable"
   - Wait for Firestore to initialize

## ✅ Step 4: Set up Storage

1. **Navigate to Storage**
   - In the left sidebar, click "Build" → "Storage"
   - Click "Get started"

2. **Configure Security**
   - Start with default rules (production mode)
   - Click "Next"

3. **Select Location**
   - Use same location as Firestore
   - Click "Done"

## ✅ Step 5: Get Your Configuration

1. **Go to Project Settings**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

2. **Add Web App**
   - Scroll down to "Your apps" section
   - Click the Web icon `</>`
   - App nickname: `TO-DO List Web App`
   - ✅ Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. **Copy Configuration**
   - You'll see a configuration object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyB...",
     authDomain: "todo-list-app-jay.firebaseapp.com",
     projectId: "todo-list-app-jay",
     storageBucket: "todo-list-app-jay.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123..."
   };
   ```
   - **COPY THESE VALUES** - You'll need them next!

## ✅ Step 6: Configure Your Local App

1. **Create .env file**
   ```bash
   # In your project root (C:\Users\Administrator\OneDrive\Desktop\TO-DO LIST\)
   # Create a new file called .env (not .env.example)
   ```

2. **Add your Firebase configuration to .env**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyB...your-actual-api-key
   VITE_FIREBASE_AUTH_DOMAIN=todo-list-app-jay.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=todo-list-app-jay
   VITE_FIREBASE_STORAGE_BUCKET=todo-list-app-jay.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123...
   ```

3. **Restart your development server**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   # Start again
   ```

## ✅ Step 7: Update Security Rules

### Firestore Rules
1. Go to Firestore Database → Rules
2. Replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read/write their own documents
    match /todos/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    match /notes/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    match /recipes/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    match /transactions/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    match /budgets/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    match /habits/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```
3. Click "Publish"

### Storage Rules
1. Go to Storage → Rules
2. Replace with:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
3. Click "Publish"

## ✅ Step 8: Test Your Setup

1. **Check Firebase Config**
   - Open browser console (F12)
   - Look for any Firebase errors
   - If no errors, Firebase is connected!

2. **Test Authentication**
   - Try registering a new account
   - Check Firebase Console → Authentication → Users
   - You should see the new user

3. **Test Firestore**
   - Create a todo item
   - Check Firebase Console → Firestore Database
   - You should see the data

## 🎉 Success Indicators

- ✅ No Firebase errors in browser console
- ✅ Can register/login with email
- ✅ Data appears in Firestore when creating items
- ✅ Files upload to Storage (if using images)

## ⚠️ Common Issues

1. **"Invalid API key" error**
   - Double-check your .env file
   - Make sure there are no quotes around values
   - Restart dev server after changing .env

2. **"Permission denied" error**
   - Check Firestore rules are published
   - Make sure user is logged in
   - Verify userId matches in data

3. **"Network error"**
   - Check internet connection
   - Verify Firebase project is active
   - Check if APIs are enabled in Google Cloud Console

## 📝 Notes

- **Test Mode expires in 30 days** - Update rules before expiration
- **Keep .env file secret** - Never commit to Git
- **Monitor usage** - Firebase has free tier limits
- **Enable backups** - Set up automatic Firestore backups for production

## 🔗 Quick Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Status](https://status.firebase.google.com/)
- [Pricing Calculator](https://firebase.google.com/pricing)

---

**Need help?** Check the browser console for errors and refer to FIREBASE_SETUP.md for detailed troubleshooting.
