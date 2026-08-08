import { notFound } from "next/navigation";
import { TasteForgeApp } from "@/components/TasteForgeApp";
import { knownStaticRoutes } from "@/lib/routes";

export default async function RoutedPage({params}:{params:Promise<{slug:string[]}>}){
  const {slug}=await params; const path=`/${slug.join("/")}`;
  if(!knownStaticRoutes.has(path)&&!/^\/meal\/[a-z0-9-]+$/.test(path))notFound();
  return <TasteForgeApp/>;
}
