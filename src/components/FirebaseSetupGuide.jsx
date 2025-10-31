import { useState } from 'react';
import { FiX, FiCopy, FiCheck, FiExternalLink } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const FirebaseSetupGuide = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState(null);

  const copyToClipboard = (text, step) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      title: 'Create a Firebase Project',
      content: [
        'Go to Firebase Console',
        'Click "Create a project" or "Add project"',
        'Enter a project name (e.g., "todo-list-app")',
        'Accept the terms and click "Continue"',
        'Optionally enable Google Analytics',
        'Click "Create project"'
      ],
      link: 'https://console.firebase.google.com/'
    },
    {
      title: 'Enable Authentication',
      content: [
        'In Firebase Console, go to "Authentication"',
        'Click "Get started"',
        'Go to "Sign-in method" tab',
        'Enable "Email/Password" provider',
        'Optionally enable "Google" provider for Google Sign-in',
        'Click "Save"'
      ]
    },
    {
      title: 'Set up Firestore Database',
      content: [
        'Go to "Firestore Database" in Firebase Console',
        'Click "Create database"',
        'Choose "Start in production mode" or "Start in test mode"',
        'Select your Cloud Firestore location',
        'Click "Enable"'
      ]
    },
    {
      title: 'Set up Storage (Optional)',
      content: [
        'Go to "Storage" in Firebase Console',
        'Click "Get started"',
        'Review the security rules',
        'Choose your storage location',
        'Click "Done"'
      ]
    },
    {
      title: 'Get Your Configuration',
      content: [
        'Go to Project Settings (gear icon)',
        'Scroll down to "Your apps"',
        'Click "Web" icon (</>) to add a web app',
        'Register your app with a nickname',
        'Copy the configuration object',
        'Create a .env file in your project root',
        'Add your configuration values:'
      ],
      code: `VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here`
    },
    {
      title: 'Configure Firestore Rules',
      content: [
        'Go to Firestore Database → Rules',
        'Replace the default rules with:'
      ],
      code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own todos
    match /todos/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    // Users can only access their own notes
    match /notes/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    // Users can only access their own recipes
    match /recipes/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    // Users can only access their own transactions
    match /transactions/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    // Users can only access their own budgets
    match /budgets/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    // Users can only access their own habits
    match /habits/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
  }
}`
    },
    {
      title: 'Configure Storage Rules (Optional)',
      content: [
        'Go to Storage → Rules',
        'Replace the default rules with:'
      ],
      code: `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Firebase Setup Guide
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    {step.title}
                  </h3>
                  
                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Open Firebase Console
                      <FiExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  
                  <ul className="space-y-2 ml-11">
                    {step.content.map((item, i) => (
                      <li key={i} className="text-gray-600 dark:text-gray-300 flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  
                  {step.code && (
                    <div className="ml-11 relative">
                      <pre className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <code className="text-sm text-gray-800 dark:text-gray-200">
                          {step.code}
                        </code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(step.code, index)}
                        className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        {copiedStep === index ? (
                          <FiCheck className="w-4 h-4 text-green-500" />
                        ) : (
                          <FiCopy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> After completing the setup, restart your development server for the changes to take effect.
              </p>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Need Help?</strong> Check out the{' '}
                <a
                  href="https://firebase.google.com/docs/web/setup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  Firebase Documentation
                </a>{' '}
                for more detailed instructions.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FirebaseSetupGuide;
