import admin from "firebase-admin";

import serviceAccount from "./cladbee-6554e-firebase-adminsdk-7pk5m-e470bb864d.json" assert { type: "json" };

const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://cladbee-6554e.appspot.com",
});

export default firebaseAdmin;
