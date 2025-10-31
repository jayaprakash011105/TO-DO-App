# Firebase Setup Guide for TO-DO List App

This guide will help you set up Firebase for the TO-DO List application, enabling cloud storage, authentication, and real-time synchronization.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Configuration](#configuration)
- [Migration from LocalStorage](#migration-from-localstorage)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js and npm installed
- A Google account for Firebase Console access
- Basic knowledge of Firebase (optional but helpful)

## Quick Start

1. **Install Firebase SDK**
   ```bash
   npm install firebase
   ```

2. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Follow the setup wizard

3. **Configure Your App**
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration values

4. **Run the Application**
   ```bash
   npm run dev
   ```

## Detailed Setup

### Step 1: Create a Firebase Project

1. Navigate to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or **"Add project"**
3. Enter a project name (e.g., "todo-list-app")
4. Accept the terms and click **"Continue"**
5. (Optional) Enable Google Analytics
6. Click **"Create project"**

### Step 2: Enable Authentication

1. In Firebase Console, navigate to **Authentication**
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Enable the following providers:
   - **Email/Password** (Required)
   - **Google** (Optional, for Google Sign-in)
5. Click **"Save"**

### Step 3: Set up Firestore Database

1. Navigate to **"Firestore Database"** in Firebase Console
2. Click **"Create database"**
3. Choose security mode:
   - **Test mode**: For development (30-day open access)
   - **Production mode**: For production (secure by default)
4. Select your Cloud Firestore location (choose closest to your users)
5. Click **"Enable"**

### Step 4: Set up Storage (Optional)

1. Navigate to **"Storage"** in Firebase Console
2. Click **"Get started"**
3. Review the default security rules
4. Choose your storage location
5. Click **"Done"**

### Step 5: Get Your Configuration

1. Go to **Project Settings** (gear icon in Firebase Console)
2. Scroll down to **"Your apps"**
3. Click the **Web icon** (</>) to add a web app
4. Register your app with a nickname
5. Copy the configuration object
6. Your config will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

### Firestore Security Rules

Navigate to **Firestore Database → Rules** and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Generic rule for user-owned documents
    match /{collection}/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Storage Security Rules

Navigate to **Storage → Rules** and add:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Migration from LocalStorage

### Automatic Migration

The app includes a migration helper that automatically transfers your existing localStorage data to Firebase:

1. **Login or Register** with Firebase Authentication
2. The app will detect existing localStorage data
3. Click **"Migrate Data"** when prompted
4. Your data will be transferred to Firebase
5. A backup file will be downloaded automatically

### Manual Migration

If automatic migration fails, you can manually trigger it:

```javascript
import { migrationHelper } from './src/utils/migrationHelper';

// Check if migration is needed
if (migrationHelper.checkMigrationNeeded()) {
  // Create backup
  migrationHelper.backupLocalStorageData();
  
  // Migrate data
  const results = await migrationHelper.migrateAllData(userId);
  
  // Clear localStorage after successful migration
  if (results.total.success > 0) {
    migrationHelper.clearLocalStorageData();
  }
}
```

## Features Enabled by Firebase

### 🔐 Authentication
- Email/Password authentication
- Google Sign-in
- Password reset via email
- User profile management

### 💾 Cloud Storage
- All data stored in Firestore
- Real-time synchronization
- Offline support with caching
- Cross-device access

### 📁 File Storage
- Profile picture uploads
- Recipe image uploads
- Document attachments
- Automatic file management

### 🔄 Real-time Updates
- Instant data synchronization
- Multi-device support
- Collaborative features ready

## Data Structure

### Firestore Collections

```
users/
  └── {userId}/
      ├── username
      ├── email
      ├── photoURL
      └── createdAt

todos/
  └── {todoId}/
      ├── userId
      ├── title
      ├── description
      ├── priority
      ├── completed
      └── dueDate

notes/
  └── {noteId}/
      ├── userId
      ├── title
      ├── content
      ├── category
      └── tags[]

recipes/
  └── {recipeId}/
      ├── userId
      ├── title
      ├── ingredients[]
      ├── instructions[]
      └── imageUrl

transactions/
  └── {transactionId}/
      ├── userId
      ├── type
      ├── amount
      ├── category
      └── date

budgets/
  └── {budgetId}/
      ├── userId
      ├── category
      ├── amount
      └── period

habits/
  └── {habitId}/
      ├── userId
      ├── name
      ├── frequency
      ├── streak
      └── completedDates[]
```

## Troubleshooting

### Common Issues

#### 1. Authentication Errors

**Problem**: "auth/invalid-api-key" error
**Solution**: Check your `.env` file and ensure all Firebase config values are correct

**Problem**: "auth/network-request-failed" error
**Solution**: Check your internet connection and Firebase project status

#### 2. Firestore Errors

**Problem**: "permission-denied" error
**Solution**: Check your Firestore security rules and ensure user is authenticated

**Problem**: Data not syncing
**Solution**: Verify Firestore is enabled and check browser console for errors

#### 3. Storage Errors

**Problem**: File upload fails
**Solution**: Check Storage rules and ensure file size is within limits (default 5MB)

### Debug Mode

Enable debug mode in your `.env` file:

```env
VITE_ENABLE_DEBUG=true
```

This will log additional information to the console.

## Best Practices

1. **Security**
   - Never commit `.env` file to version control
   - Use environment variables for sensitive data
   - Implement proper security rules
   - Enable App Check for production

2. **Performance**
   - Use Firestore indexes for complex queries
   - Implement pagination for large datasets
   - Cache frequently accessed data
   - Optimize image uploads with compression

3. **Backup**
   - Regular Firestore backups
   - Export user data functionality
   - Keep localStorage backup during migration

## Support

For issues or questions:
1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review the [Firebase Status](https://status.firebase.google.com/)
3. Open an issue on the project repository

## License

This Firebase integration is part of the TO-DO List App project.

---

**Note**: Remember to keep your Firebase configuration secure and never share your API keys publicly.
