export default function handler(req, res) {
  // No caching — always fresh from env vars
  res.setHeader('Cache-Control', 'no-store');

  const cfg = {
    apiKey:            process.env.FIREBASE_API_KEY            || "",
    authDomain:        process.env.FIREBASE_AUTH_DOMAIN        || "",
    projectId:         process.env.FIREBASE_PROJECT_ID         || "",
    storageBucket:     process.env.FIREBASE_STORAGE_BUCKET     || "",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID|| "",
    appId:             process.env.FIREBASE_APP_ID             || "",
    measurementId:     process.env.FIREBASE_MEASUREMENT_ID     || "",
  };

  res.status(200).json(cfg);
}
