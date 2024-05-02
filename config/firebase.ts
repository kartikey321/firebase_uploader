import admin from "firebase-admin";

import serviceAccount from "./cladbee-6554e-firebase-adminsdk-7pk5m-e470bb864d.json";

const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: "gs://cladbee-6554e.appspot.com",
});

export default firebaseAdmin;
