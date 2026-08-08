import type { AppState } from "./model";

export type FirebaseUser = { uid:string; displayName:string|null; email:string|null; photoURL:string|null };
type FirebaseConfig = { apiKey:string; authDomain:string; projectId:string; storageBucket:string; messagingSenderId:string; appId:string; measurementId?:string };
type AppModule = { initializeApp:(c:FirebaseConfig)=>unknown; getApps:()=>unknown[]; getApp:()=>unknown };
type AuthModule = { getAuth:(a:unknown)=>unknown; GoogleAuthProvider:new()=>unknown; signInWithPopup:(a:unknown,p:unknown)=>Promise<{user:FirebaseUser}>; signOut:(a:unknown)=>Promise<void>; onAuthStateChanged:(a:unknown,cb:(u:FirebaseUser|null)=>void)=>()=>void };
type FirestoreModule = { getFirestore:(a:unknown)=>unknown; doc:(db:unknown,...p:string[])=>unknown; getDoc:(r:unknown)=>Promise<{exists:()=>boolean;data:()=>Record<string,unknown>}>; setDoc:(r:unknown,d:Record<string,unknown>,o?:{merge:boolean})=>Promise<void>; serverTimestamp:()=>unknown };
type FirebaseRuntime = { auth:unknown; db:unknown; provider:unknown; authModule:AuthModule; firestoreModule:FirestoreModule };

const config: FirebaseConfig = { apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY||"", authDomain:process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN||"", projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID||"", storageBucket:process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET||"", messagingSenderId:process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID||"", appId:process.env.NEXT_PUBLIC_FIREBASE_APP_ID||"", measurementId:process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID||undefined };
export const firebaseConfigured = Boolean(config.apiKey&&config.authDomain&&config.projectId&&config.storageBucket&&config.messagingSenderId&&config.appId);
let runtimePromise: Promise<FirebaseRuntime>|null = null;
const importRemote = (url:string) => (new Function("url", "return import(url)") as (u:string)=>Promise<unknown>)(url);

export async function getFirebase(): Promise<FirebaseRuntime> {
  if (!firebaseConfigured) throw new Error("Firebase is not configured");
  if (!runtimePromise) runtimePromise = Promise.all([importRemote("https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js"),importRemote("https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js"),importRemote("https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js")]).then(([a,b,c])=>{
    const appModule=a as AppModule, authModule=b as AuthModule, firestoreModule=c as FirestoreModule;
    const app=appModule.getApps().length?appModule.getApp():appModule.initializeApp(config);
    const auth=authModule.getAuth(app), db=firestoreModule.getFirestore(app), provider=new authModule.GoogleAuthProvider();
    return {auth,db,provider,authModule,firestoreModule};
  });
  return runtimePromise;
}

export async function loadCloudState(uid:string) { const f=await getFirebase(); const snap=await f.firestoreModule.getDoc(f.firestoreModule.doc(f.db,"users",uid)); return snap.exists()?(snap.data().appState as AppState|undefined):undefined; }
export async function saveCloudState(uid:string,user:FirebaseUser,state:AppState) { const f=await getFirebase(); const ref=f.firestoreModule.doc(f.db,"users",uid); const existing=await f.firestoreModule.getDoc(ref); const data:Record<string,unknown>={uid,displayName:user.displayName,email:user.email,photoURL:user.photoURL,onboardingCompleted:state.profile.onboardingCompleted,tasteProfile:state.profile,appState:state,updatedAt:f.firestoreModule.serverTimestamp()}; if(!existing.exists())data.createdAt=f.firestoreModule.serverTimestamp(); await f.firestoreModule.setDoc(ref,data,{merge:true}); }
export function friendlyFirebaseError(error:unknown) { const code=typeof error==="object"&&error&&"code" in error?String((error as {code:unknown}).code):""; if(code.includes("popup-closed"))return "Sign-in was cancelled."; if(code.includes("popup-blocked"))return "Your browser blocked the sign-in window. Allow popups and try again."; if(code.includes("unauthorized-domain"))return "This domain is not authorized in Firebase yet."; if(code.includes("network"))return "A network problem interrupted sign-in. Please retry."; return "Google sign-in could not be completed. Please try again."; }
