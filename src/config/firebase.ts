import admin from "firebase-admin";

// Inicializa o Firebase com as credenciais
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_API_KEY?.replace(/\\n/g, "\n"), // Certifique-se de usar FIREBASE_PRIVATE_API_KEY
    clientEmail: process.env.FIREBASE_EMAIL_CLIENT,
  }),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
});

// Exporta o Firestore
export const firestore = admin.firestore();
