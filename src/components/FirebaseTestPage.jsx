import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiLoader, FiInfo } from 'react-icons/fi';
import { auth, db, storage } from '../config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const FirebaseTestPage = () => {
  const [status, setStatus] = useState({
    config: 'checking',
    auth: 'checking',
    firestore: 'checking',
    storage: 'checking'
  });
  const [configDetails, setConfigDetails] = useState({});
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    checkFirebaseConfiguration();
  }, []);

  const checkFirebaseConfiguration = async () => {
    // Check configuration
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    const configStatus = Object.values(config).every(val => val && val !== 'YOUR_' + val);
    setStatus(prev => ({ ...prev, config: configStatus ? 'success' : 'error' }));
    setConfigDetails(config);

    // Check Auth
    try {
      if (auth) {
        setStatus(prev => ({ ...prev, auth: 'success' }));
        addTestResult('✅ Firebase Auth initialized successfully');
      } else {
        setStatus(prev => ({ ...prev, auth: 'error' }));
        addTestResult('❌ Firebase Auth failed to initialize');
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, auth: 'error' }));
      addTestResult(`❌ Auth Error: ${error.message}`);
    }

    // Check Firestore
    try {
      if (db) {
        // Try to read from a test collection
        const testCollection = collection(db, 'test-connection');
        await getDocs(testCollection);
        setStatus(prev => ({ ...prev, firestore: 'success' }));
        addTestResult('✅ Firestore connected successfully');
      } else {
        setStatus(prev => ({ ...prev, firestore: 'error' }));
        addTestResult('❌ Firestore failed to initialize');
      }
    } catch (error) {
      if (error.code === 'permission-denied') {
        setStatus(prev => ({ ...prev, firestore: 'warning' }));
        addTestResult('⚠️ Firestore connected but needs security rules configuration');
      } else {
        setStatus(prev => ({ ...prev, firestore: 'error' }));
        addTestResult(`❌ Firestore Error: ${error.message}`);
      }
    }

    // Check Storage
    try {
      if (storage) {
        setStatus(prev => ({ ...prev, storage: 'success' }));
        addTestResult('✅ Firebase Storage initialized successfully');
      } else {
        setStatus(prev => ({ ...prev, storage: 'error' }));
        addTestResult('❌ Firebase Storage failed to initialize');
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, storage: 'error' }));
      addTestResult(`❌ Storage Error: ${error.message}`);
    }
  };

  const addTestResult = (message) => {
    setTestResults(prev => [...prev, { message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testFirestoreWrite = async () => {
    try {
      const docRef = await addDoc(collection(db, 'test-connection'), {
        message: 'Test connection from TO-DO List App',
        timestamp: new Date().toISOString()
      });
      addTestResult(`✅ Successfully wrote to Firestore (ID: ${docRef.id})`);
      
      // Clean up test document
      await deleteDoc(doc(db, 'test-connection', docRef.id));
      addTestResult('🧹 Test document cleaned up');
    } catch (error) {
      addTestResult(`❌ Firestore write failed: ${error.message}`);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'checking':
        return <FiLoader className="animate-spin text-blue-500" />;
      case 'success':
        return <FiCheck className="text-green-500" />;
      case 'warning':
        return <FiInfo className="text-yellow-500" />;
      case 'error':
        return <FiX className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'checking':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          🔥 Firebase Connection Test
        </h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className={`p-4 rounded-lg border-2 ${getStatusColor(status.config)}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Configuration</h3>
              {getStatusIcon(status.config)}
            </div>
            <p className="text-sm mt-2 text-gray-600">Environment variables loaded</p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${getStatusColor(status.auth)}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Authentication</h3>
              {getStatusIcon(status.auth)}
            </div>
            <p className="text-sm mt-2 text-gray-600">Firebase Auth service</p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${getStatusColor(status.firestore)}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Firestore Database</h3>
              {getStatusIcon(status.firestore)}
            </div>
            <p className="text-sm mt-2 text-gray-600">Cloud database connection</p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${getStatusColor(status.storage)}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Storage</h3>
              {getStatusIcon(status.storage)}
            </div>
            <p className="text-sm mt-2 text-gray-600">File storage service</p>
          </div>
        </div>

        {/* Configuration Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Configuration Details
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Project ID:</span>
              <span className="font-mono text-sm">{configDetails.projectId || 'Not configured'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Auth Domain:</span>
              <span className="font-mono text-sm">{configDetails.authDomain || 'Not configured'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Storage Bucket:</span>
              <span className="font-mono text-sm">{configDetails.storageBucket || 'Not configured'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">App ID:</span>
              <span className="font-mono text-sm">
                {configDetails.appId ? '....' + configDetails.appId.slice(-8) : 'Not configured'}
              </span>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Test Actions
          </h2>
          <div className="space-x-4">
            <button
              onClick={testFirestoreWrite}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Test Firestore Write
            </button>
            <button
              onClick={checkFirebaseConfiguration}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Refresh Status
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Test Results
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet...</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{result.message}</span>
                  <span className="text-gray-400">{result.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Connection Summary
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            {Object.values(status).every(s => s === 'success') 
              ? '🎉 All Firebase services are connected and working properly!'
              : Object.values(status).some(s => s === 'error')
              ? '⚠️ Some Firebase services need configuration. Check the details above.'
              : '🔄 Checking Firebase connection status...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTestPage;
