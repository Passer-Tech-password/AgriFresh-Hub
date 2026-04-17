import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Handle potential undefined values during development reloads or server-side pre-rendering
// We check if the keys are actually set and not just placeholders or "undefined" strings
const isConfigValid = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "your_api_key" && 
  firebaseConfig.apiKey !== "undefined" &&
  !!firebaseConfig.projectId &&
  firebaseConfig.projectId !== "your_project_id" &&
  firebaseConfig.projectId !== "undefined";

const app = getApps().length 
  ? getApp() 
  : (isConfigValid ? initializeApp(firebaseConfig) : null);

export const firebaseApp = app;
// Safely export Firebase services or a proxy during build
export const auth = app ? getAuth(app) : ({} as any);
export const db = app ? getFirestore(app) : ({} as any);
export const storage = app ? getStorage(app) : ({} as any);

/**
 * Uploads a file to Firebase Storage with progress tracking.
 * @param file The file to upload
 * @param path The path in storage (e.g., 'vendor-docs/uid/filename')
 * @param onProgress Callback for progress percentage (0-100)
 */
export async function uploadFileWithProgress(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

