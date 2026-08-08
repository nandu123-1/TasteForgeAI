"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { defaultState, meals, updateTasteFromInteraction } from "@/lib/model";
import type { AppState, InteractionKind, Order, TasteProfile } from "@/lib/model";
import { firebaseConfigured, friendlyFirebaseError, getFirebase, loadCloudState, saveCloudState } from "@/lib/firebase";
import type { FirebaseUser } from "@/lib/firebase";

type SessionMode = "checking"|"signedOut"|"firebase"|"demo"|"local";
type ContextValue = {
  state:AppState; user:FirebaseUser|null; mode:SessionMode; hydrated:boolean; authError:string;
  signInWithGoogle:()=>Promise<void>; enterDemo:()=>void; logout:()=>Promise<void>;
  signInWithEmail:(email:string,password:string)=>Promise<void>;
  signUpWithEmail:(email:string,password:string)=>Promise<void>;
  updateProfile:(patch:Partial<TasteProfile>)=>void; completeOnboarding:()=>void;
  toggleSave:(mealId:string)=>void; feedback:(mealId:string,kind:"liked"|"disliked"|"dismissed")=>void;
  placeOrder:(mealId:string,quantity:number,notes:string)=>void; rateOrder:(orderId:string,rating:number)=>void;
  updateSettings:(patch:Partial<AppState["settings"]>)=>void; resetDemo:()=>void;
};

const AppContext=createContext<ContextValue|null>(null);
const cloneDefault=():AppState=>JSON.parse(JSON.stringify(defaultState)) as AppState;
const localKey=(id:string)=>`tasteforge-state-${id}`;

export function AppProvider({children}:{children:ReactNode}) {
  const [state,setState]=useState<AppState>(cloneDefault);
  const [user,setUser]=useState<FirebaseUser|null>(null);
  const [mode,setMode]=useState<SessionMode>("checking");
  const [hydrated,setHydrated]=useState(false);
  const [authError,setAuthError]=useState("");

  useEffect(()=>{
    let unsubscribe=()=>{}; let alive=true; let hydrationTimer:ReturnType<typeof setTimeout>|null=null;
    const forceHydrate=()=>{if(!alive||hydrated)return;const demo=localStorage.getItem("tasteforge-demo-active")==="true";const activeLocal=localStorage.getItem("tasteforge-local-active");if(activeLocal){const stored=localStorage.getItem(localKey(activeLocal));if(stored)setState(JSON.parse(stored) as AppState);setUser({uid:activeLocal,displayName:activeLocal.split('@')[0],email:activeLocal,photoURL:null});setMode("local");}else if(demo){const stored=localStorage.getItem(localKey("demo"));if(stored)setState(JSON.parse(stored) as AppState);setUser({uid:"demo",displayName:"Arjun Rao",email:"demo@tasteforge.local",photoURL:null});setMode("demo");}else{setMode("signedOut");}setHydrated(true);};
    const start=async()=>{
      const demo=localStorage.getItem("tasteforge-demo-active")==="true";
      const activeLocal=localStorage.getItem("tasteforge-local-active");
      if(!firebaseConfigured){
        if(activeLocal){ const stored=localStorage.getItem(localKey(activeLocal)); if(stored)setState(JSON.parse(stored) as AppState); setUser({uid:activeLocal,displayName:activeLocal.split('@')[0],email:activeLocal,photoURL:null}); setMode("local"); }
        else if(demo){ const stored=localStorage.getItem(localKey("demo")); if(stored)setState(JSON.parse(stored) as AppState); setUser({uid:"demo",displayName:"Arjun Rao",email:"demo@tasteforge.local",photoURL:null}); setMode("demo"); }
        else setMode("signedOut");
        setHydrated(true); return;
      }
      hydrationTimer=setTimeout(forceHydrate,2000);
      try{
        const f=await getFirebase(); if(!alive)return;
        unsubscribe=f.authModule.onAuthStateChanged(f.auth,async(next)=>{
          if(!alive)return;
          if(hydrationTimer){clearTimeout(hydrationTimer);hydrationTimer=null;}
          if(next){ setUser(next); setMode("firebase"); const cloud=await loadCloudState(next.uid).catch(()=>undefined); if(cloud)setState(cloud); else setState({...cloneDefault(),profile:{...defaultState.profile,onboardingCompleted:false}}); }
          else if(activeLocal){ const stored=localStorage.getItem(localKey(activeLocal)); if(stored)setState(JSON.parse(stored) as AppState); setUser({uid:activeLocal,displayName:activeLocal.split('@')[0],email:activeLocal,photoURL:null}); setMode("local"); }
          else if(demo){ const stored=localStorage.getItem(localKey("demo")); if(stored)setState(JSON.parse(stored) as AppState); setUser({uid:"demo",displayName:"Arjun Rao",email:"demo@tasteforge.local",photoURL:null}); setMode("demo"); }
          else { setUser(null); setMode("signedOut"); }
          setHydrated(true);
        });
      }catch(error){ if(alive){if(hydrationTimer){clearTimeout(hydrationTimer);hydrationTimer=null;}setAuthError(friendlyFirebaseError(error));setMode(demo?"demo":"signedOut");setHydrated(true);} }
    };
    void start(); return()=>{alive=false;unsubscribe();if(hydrationTimer)clearTimeout(hydrationTimer);};
  },[]);

  useEffect(()=>{
    if(!hydrated||!user)return;
    localStorage.setItem(localKey(user.uid),JSON.stringify(state));
    if(mode!=="firebase")return;
    const timer=setTimeout(()=>{void saveCloudState(user.uid,user,state).catch(()=>setAuthError("Your changes are saved on this device, but cloud sync is temporarily unavailable."));},500);
    return()=>clearTimeout(timer);
  },[state,user,mode,hydrated]);

  const signInWithGoogle=useCallback(async()=>{setAuthError("");try{const f=await getFirebase();await f.authModule.signInWithPopup(f.auth,f.provider);}catch(error){setAuthError(friendlyFirebaseError(error));throw error;}},[]);
  const enterDemo=useCallback(()=>{const stored=localStorage.getItem(localKey("demo"));setState(stored?JSON.parse(stored) as AppState:cloneDefault());localStorage.setItem("tasteforge-demo-active","true");setUser({uid:"demo",displayName:"Arjun Rao",email:"demo@tasteforge.local",photoURL:null});setMode("demo");setHydrated(true);},[]);
  
  const signInWithEmail=useCallback(async(email:string,password:string)=>{
    const usersStr=localStorage.getItem("tasteforge-local-users");
    const users=usersStr?JSON.parse(usersStr):{};
    if(!users[email]){setAuthError("Account not found. Please sign up.");throw new Error("not found");}
    if(users[email]!==password){setAuthError("Incorrect password.");throw new Error("wrong pass");}
    setAuthError("");
    const stored=localStorage.getItem(localKey(email));
    setState(stored?JSON.parse(stored) as AppState:cloneDefault());
    localStorage.setItem("tasteforge-local-active",email);
    setUser({uid:email,displayName:email.split('@')[0],email,photoURL:null});
    setMode("local");
    setHydrated(true);
  },[]);

  const signUpWithEmail=useCallback(async(email:string,password:string)=>{
    const usersStr=localStorage.getItem("tasteforge-local-users");
    const users=usersStr?JSON.parse(usersStr):{};
    if(users[email]){setAuthError("User already exists. Please sign in.");throw new Error("exists");}
    users[email]=password;
    localStorage.setItem("tasteforge-local-users",JSON.stringify(users));
    setAuthError("");
    const fresh=cloneDefault();
    setState(fresh);
    localStorage.setItem("tasteforge-local-active",email);
    setUser({uid:email,displayName:email.split('@')[0],email,photoURL:null});
    setMode("local");
    setHydrated(true);
  },[]);

  const logout=useCallback(async()=>{if(mode==="firebase"){const f=await getFirebase();await f.authModule.signOut(f.auth);}localStorage.removeItem("tasteforge-demo-active");localStorage.removeItem("tasteforge-local-active");setUser(null);setMode("signedOut");},[mode]);
  const record=useCallback((mealId:string,kind:InteractionKind,rating?:number)=>({id:`${kind}-${Date.now()}`,mealId,kind,createdAt:Date.now(),rating}),[]);
  const updateProfile=useCallback((patch:Partial<TasteProfile>)=>setState(s=>({...s,profile:{...s.profile,...patch}})),[]);
  const completeOnboarding=useCallback(()=>updateProfile({onboardingCompleted:true}),[updateProfile]);
  const toggleSave=useCallback((mealId:string)=>setState(s=>{const exists=s.saved.includes(mealId),meal=meals.find(m=>m.id===mealId);return {...s,saved:exists?s.saved.filter(id=>id!==mealId):[...s.saved,mealId],profile:meal?updateTasteFromInteraction(s.profile,meal,exists?"unsaved":"saved"):s.profile,interactions:[record(mealId,exists?"unsaved":"saved"),...s.interactions]};}),[record]);
  const feedback=useCallback((mealId:string,kind:"liked"|"disliked"|"dismissed")=>setState(s=>{const meal=meals.find(m=>m.id===mealId);return {...s,liked:kind==="liked"?Array.from(new Set([...s.liked,mealId])):s.liked.filter(id=>id!==mealId),disliked:kind==="disliked"?Array.from(new Set([...s.disliked,mealId])):s.disliked.filter(id=>id!==mealId),dismissed:kind==="dismissed"?Array.from(new Set([...s.dismissed,mealId])):s.dismissed,profile:meal?updateTasteFromInteraction(s.profile,meal,kind):s.profile,interactions:[record(mealId,kind),...s.interactions]};}),[record]);
  const placeOrder=useCallback((mealId:string,quantity:number,notes:string)=>setState(s=>{const order:Order={id:`order-${Date.now()}`,mealId,quantity,notes,createdAt:Date.now()};const meal=meals.find(m=>m.id===mealId);return {...s,orders:[order,...s.orders],profile:meal?updateTasteFromInteraction(s.profile,meal,"ordered"):s.profile,interactions:[record(mealId,"ordered"),...s.interactions]};}),[record]);
  const rateOrder=useCallback((orderId:string,rating:number)=>setState(s=>{const order=s.orders.find(o=>o.id===orderId);return {...s,orders:s.orders.map(o=>o.id===orderId?{...o,rating}:o),interactions:order?[record(order.mealId,"rated",rating),...s.interactions]:s.interactions};}),[record]);
  const updateSettings=useCallback((patch:Partial<AppState["settings"]>)=>setState(s=>({...s,settings:{...s.settings,...patch}})),[]);
  const resetDemo=useCallback(()=>{const fresh=cloneDefault();setState(fresh);localStorage.setItem(localKey("demo"),JSON.stringify(fresh));},[]);
  const value=useMemo(()=>({state,user,mode,hydrated,authError,signInWithGoogle,signInWithEmail,signUpWithEmail,enterDemo,logout,updateProfile,completeOnboarding,toggleSave,feedback,placeOrder,rateOrder,updateSettings,resetDemo}),[state,user,mode,hydrated,authError,signInWithGoogle,signInWithEmail,signUpWithEmail,enterDemo,logout,updateProfile,completeOnboarding,toggleSave,feedback,placeOrder,rateOrder,updateSettings,resetDemo]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(){const value=useContext(AppContext);if(!value)throw new Error("useApp must be used inside AppProvider");return value;}
