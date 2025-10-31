/**
 * Firebase Configuration Checker
 * This utility helps verify that Firebase is properly configured
 */

export const firebaseChecker = {
  /**
   * Check if Firebase environment variables are set
   */
  checkEnvVariables() {
    const required = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ];

    const missing = [];
    const configured = [];

    required.forEach(key => {
      const value = import.meta.env[key];
      if (!value || value === `your_${key.toLowerCase().replace('vite_firebase_', '').replace('_', '-')}_here`) {
        missing.push(key);
      } else {
        configured.push(key);
      }
    });

    return {
      isConfigured: missing.length === 0,
      missing,
      configured,
      summary: `${configured.length}/${required.length} variables configured`
    };
  },

  /**
   * Display configuration status in console
   */
  displayStatus() {
    const status = this.checkEnvVariables();
    
    console.group('🔥 Firebase Configuration Status');
    
    if (status.isConfigured) {
      console.log('✅ Firebase is fully configured!');
      console.log('📊 All environment variables are set');
    } else {
      console.warn('⚠️ Firebase configuration incomplete');
      console.log(`📊 Status: ${status.summary}`);
      
      if (status.missing.length > 0) {
        console.group('❌ Missing variables:');
        status.missing.forEach(key => {
          console.log(`- ${key}`);
        });
        console.groupEnd();
      }
      
      if (status.configured.length > 0) {
        console.group('✅ Configured variables:');
        status.configured.forEach(key => {
          console.log(`- ${key}`);
        });
        console.groupEnd();
      }
      
      console.log('\n📝 Next steps:');
      console.log('1. Create a Firebase project at https://console.firebase.google.com/');
      console.log('2. Get your configuration from Project Settings');
      console.log('3. Create a .env file in your project root');
      console.log('4. Add your Firebase configuration to the .env file');
      console.log('5. Restart the development server');
    }
    
    console.groupEnd();
    
    return status;
  },

  /**
   * Test Firebase connection
   */
  async testConnection() {
    try {
      const { auth, db } = await import('../config/firebase');
      
      console.group('🔌 Firebase Connection Test');
      
      // Check if Firebase is initialized
      if (auth && db) {
        console.log('✅ Firebase SDK initialized');
        
        // Check Auth
        console.log('🔐 Auth instance:', auth ? 'Available' : 'Not available');
        
        // Check Firestore
        console.log('💾 Firestore instance:', db ? 'Available' : 'Not available');
        
        console.log('\n✨ Firebase is ready to use!');
      } else {
        console.error('❌ Firebase initialization failed');
      }
      
      console.groupEnd();
      
      return true;
    } catch (error) {
      console.group('🔌 Firebase Connection Test');
      console.error('❌ Firebase connection failed:', error.message);
      console.log('\n📝 Make sure you have:');
      console.log('1. Created a .env file with your Firebase config');
      console.log('2. Restarted the development server after adding .env');
      console.groupEnd();
      
      return false;
    }
  },

  /**
   * Show quick setup guide
   */
  showQuickSetup() {
    console.group('🚀 Firebase Quick Setup Guide');
    console.log('%c Step 1: Create Firebase Project', 'font-weight: bold; color: #4285f4');
    console.log('Go to: https://console.firebase.google.com/');
    console.log('Click "Create a project"');
    
    console.log('\n%c Step 2: Enable Services', 'font-weight: bold; color: #4285f4');
    console.log('- Authentication (Email/Password)');
    console.log('- Firestore Database');
    console.log('- Storage (optional)');
    
    console.log('\n%c Step 3: Get Configuration', 'font-weight: bold; color: #4285f4');
    console.log('Project Settings → Your apps → Web app → Copy config');
    
    console.log('\n%c Step 4: Create .env file', 'font-weight: bold; color: #4285f4');
    console.log('Create .env file in project root with:');
    console.log(`
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
    `.trim());
    
    console.log('\n%c Step 5: Restart Server', 'font-weight: bold; color: #4285f4');
    console.log('Stop server (Ctrl+C) and run: npm run dev');
    
    console.groupEnd();
  }
};

// Auto-check on import if in development
if (import.meta.env.DEV) {
  firebaseChecker.displayStatus();
}

export default firebaseChecker;
