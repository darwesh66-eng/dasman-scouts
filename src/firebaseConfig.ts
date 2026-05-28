// ============================================================
//  🔥  FIREBASE CONFIGURATION
//  Replace these placeholder values with your real credentials
//  from: Firebase Console → Project Settings → General → Your apps
// ============================================================
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.firebasestorage.app',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
// ============================================================

export function isFirebaseConfigured(): boolean {
  return !firebaseConfig.apiKey.startsWith('YOUR');
}
