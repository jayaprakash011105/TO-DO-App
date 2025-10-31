import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Firebase configuration checker (development only)
if (import.meta.env.DEV) {
  import('./utils/firebaseChecker').then(({ firebaseChecker }) => {
    // Check Firebase configuration
    firebaseChecker.displayStatus();
    
    // Test connection after a short delay
    setTimeout(() => {
      firebaseChecker.testConnection();
    }, 1000);
    
    // Make it available globally for debugging
    window.firebaseChecker = firebaseChecker;
    console.log('💡 Tip: Use window.firebaseChecker.showQuickSetup() for setup guide');
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
