import type { Metadata } from "next";
import { AppProvider } from "@/contexts/AppContext";
import "./globals.css";

export const metadata:Metadata={title:{default:"TasteForge AI — Food that understands you",template:"%s · TasteForge AI"},description:"Explainable, allergy-safe personalized food intelligence.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><AppProvider>{children}</AppProvider></body></html>}
